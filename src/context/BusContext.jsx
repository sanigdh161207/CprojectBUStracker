import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { database, auth } from '../Firebase';

const BusContext = createContext();

export const BusProvider = ({ children }) => {
  const [activeBuses, setActiveBuses] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [busDetails, setBusDetails] = useState(() => {
    // Load preferences from localStorage
    return {
      busNo: localStorage.getItem('busNo') || '',
      driverName: localStorage.getItem('driverName') || '',
      simulateMovement:
        localStorage.getItem('simulateMovement') === 'true' || false,
    };
  });
  const [error, setError] = useState(null);

  // 1. Handle Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth).catch((err) =>
          setError(`Authentication failed: ${err.message}`)
        );
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Handle Firestore Listener (Single Source of Truth)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(database, 'locations'),
      (snapshot) => {
        const buses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActiveBuses(buses);
      },
      (err) => {
        setError(`Failed to listen to locations: ${err.message}`);
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Determine if *this* user is broadcasting
  useEffect(() => {
    if (userId) {
      const currentlyBroadcasting = activeBuses.some(
        (bus) => bus.id === userId
      );
      setIsBroadcasting(currentlyBroadcasting);
    }
  }, [activeBuses, userId]);

  // 4. Function to update preferences (localStorage)
  const updateBusDetails = useCallback((details) => {
    setBusDetails(details);
    localStorage.setItem('busNo', details.busNo);
    localStorage.setItem('driverName', details.driverName);
    localStorage.setItem(
      'simulateMovement',
      details.simulateMovement.toString()
    );
  }, []);

  // 5. Broadcasting Actions
  const startBroadcasting = useCallback(
    async (location) => {
      if (!userId) {
        setError('User not authenticated. Cannot start broadcasting.');
        return;
      }
      const locationData = {
        ...busDetails,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: serverTimestamp(),
        isSimulated: busDetails.simulateMovement,
      };
      try {
        await setDoc(doc(database, 'locations', userId), locationData);
      } catch (err) {
        setError(`Failed to start broadcasting: ${err.message}`);
      }
    },
    [userId, busDetails]
  );

  const updateLocation = useCallback(
    async (location) => {
      if (!userId || !isBroadcasting) return; // Don't update if not broadcasting

      try {
        await setDoc(
          doc(database, 'locations', userId),
          {
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: serverTimestamp(),
            isSimulated: busDetails.simulateMovement, // ensure this stays updated
          },
          { merge: true }
        );
      } catch (err) {
        // Fail silently on updates to avoid spamming errors
        console.error('Failed to update location:', err);
      }
    },
    [userId, isBroadcasting, busDetails.simulateMovement]
  );

  const stopBroadcasting = useCallback(async () => {
    if (!userId) return;
    try {
      await deleteDoc(doc(database, 'locations', userId));
    } catch (err) {
      setError(`Failed to stop broadcasting: ${err.message}`);
    }
  }, [userId]);

  // Memoize context value
  const value = useMemo(
    () => ({
      activeBuses,
      isBroadcasting,
      busDetails,
      error,
      actions: {
        updateBusDetails,
        startBroadcasting,
        updateLocation,
        stopBroadcasting,
      },
    }),
    [
      activeBuses,
      isBroadcasting,
      busDetails,
      error,
      updateBusDetails,
      startBroadcasting,
      updateLocation,
      stopBroadcasting,
    ]
  );

  return <BusContext.Provider value={value}>{children}</BusContext.Provider>;
};

// Custom hook
export const useBus = () => {
  const context = useContext(BusContext);
  if (context === undefined) {
    throw new Error('useBus must be used within a BusProvider');
  }
  return context;
};

