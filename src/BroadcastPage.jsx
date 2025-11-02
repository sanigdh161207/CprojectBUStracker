import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useBus } from './context/BusContext';

// Inline defaults moved from removed constants file
// Safe default coordinates (equator / prime meridian). Tests and simulation
// can run without requiring a real GPS fix.
const DEFAULT_COORDINATES = { latitude: 0, longitude: 0 };
const COORDINATE_VARIATION = 0.02;
const SIMULATION_STEP = 0.001;

const BroadcastPage = () => {
  const { isBroadcasting, busDetails, error: contextError, actions } = useBus();
  const [localBusNo, setLocalBusNo] = useState(busDetails.busNo);
  const [localDriverName, setLocalDriverName] = useState(busDetails.driverName);
  const [localSimulate, setLocalSimulate] = useState(
    busDetails.simulateMovement
  );
  const [validationError, setValidationError] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const watchIdRef = useRef(null);
  const simulationIntervalIdRef = useRef(null);
  const locationRef = useRef(null); // Ref to store latest location
  const manuallyStoppedRef = useRef(false); // prevent auto-restart after manual stop

  // Clear any local errors when context error changes
  useEffect(() => {
    if (contextError) setLocalError(contextError);
  }, [contextError]);

  // Keep local state in sync with context *if not broadcasting*
  useEffect(() => {
    if (!isBroadcasting) {
      setLocalBusNo(busDetails.busNo);
      setLocalDriverName(busDetails.driverName);
      setLocalSimulate(busDetails.simulateMovement);
    }
  }, [busDetails, isBroadcasting]);

  const validateInputs = () => {
    if (!localBusNo.trim() || !localDriverName.trim()) {
      setValidationError('Bus Number and Driver Name cannot be empty.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const clearWatchers = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simulationIntervalIdRef.current) {
      clearInterval(simulationIntervalIdRef.current);
      simulationIntervalIdRef.current = null;
    }
  };

  const handleLocationUpdate = useCallback(
    (position) => {
      // If the user manually stopped broadcasting, ignore any incoming
      // location updates to avoid re-starting broadcasting unexpectedly.
      if (manuallyStoppedRef.current) return;

      const { latitude, longitude } = position.coords;
      const newLocation = { latitude, longitude };
      locationRef.current = newLocation;

      // Check if this is the *first* update to start broadcasting
      if (!isBroadcasting) {
        // Pass current local details to avoid a race where context's busDetails
        // may not have updated yet when the first location arrives.
        actions.startBroadcasting(newLocation, {
          busNo: localBusNo,
          driverName: localDriverName,
          simulateMovement: localSimulate,
        });
      } else {
        actions.updateLocation(newLocation);
      }
    },
    [actions, isBroadcasting, localBusNo, localDriverName, localSimulate]
  );

  const handleLocationError = (err) => {
    setLocalError(
      `Geolocation Error: ${err.message}. Please enable location services.`
    );
    clearWatchers();
    setIsProcessing(false);
  };

  const startSimulation = () => {
    let { latitude, longitude } = DEFAULT_COORDINATES;

    // Add initial random variation
    latitude += (Math.random() * COORDINATE_VARIATION - COORDINATE_VARIATION / 2);
    longitude += (Math.random() * COORDINATE_VARIATION - COORDINATE_VARIATION / 2);

    const sendSimulatedUpdate = () => {
      latitude += (Math.random() - 0.5) * SIMULATION_STEP * 2;
      longitude += (Math.random() - 0.5) * SIMULATION_STEP * 2;
      handleLocationUpdate({ coords: { latitude, longitude } });
    };

    // Send first update and start interval only if user hasn't manually stopped
    if (!manuallyStoppedRef.current) {
      sendSimulatedUpdate();
      simulationIntervalIdRef.current = setInterval(sendSimulatedUpdate, 3000);
    }
  };

  const startRealGPS = () => {
    // Only start watching if user hasn't manually stopped broadcasting
    if (!manuallyStoppedRef.current) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleLocationUpdate,
        handleLocationError,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const handleStart = () => {
    if (!validateInputs()) return;
    setIsProcessing(true);
    setLocalError(null);

    // Clear manual-stop flag so location updates can trigger broadcasting again
    manuallyStoppedRef.current = false;

    // Update context/localStorage with latest preferences
    actions.updateBusDetails({
      busNo: localBusNo,
      driverName: localDriverName,
      simulateMovement: localSimulate,
    });

    if (localSimulate) {
      startSimulation();
    } else {
      if (!('geolocation' in navigator)) {
        setLocalError('Geolocation is not supported by your browser.');
        setIsProcessing(false);
        return;
      }
      startRealGPS();
    }
    // We don't set isBroadcasting to true here. 
    // We wait for the context to confirm it via the first location update.
    setIsProcessing(false); // Processing is done, now just waiting for updates
  };

  const handleStop = async () => {
    setIsProcessing(true);
    // Mark that the user manually stopped broadcasting to avoid an immediate
    // re-start from any in-flight location callbacks or intervals.
    manuallyStoppedRef.current = true;
    clearWatchers();
    await actions.stopBroadcasting();
    setIsProcessing(false);
  };

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff6b6b 0%, #4d79ff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Driver Broadcast
          </Typography>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              label="Bus Number"
              value={localBusNo}
              onChange={(e) => setLocalBusNo(e.target.value)}
              fullWidth
              margin="normal"
              disabled={isBroadcasting}
              error={!!validationError && !localBusNo.trim()}
            />
            <TextField
              label="Driver Name"
              value={localDriverName}
              onChange={(e) => setLocalDriverName(e.target.value)}
              fullWidth
              margin="normal"
              disabled={isBroadcasting}
              error={!!validationError && !localDriverName.trim()}
            />
            {validationError && (
              <Typography color="error" variant="body2">
                {validationError}
              </Typography>
            )}
            {/* Show simulate control only outside of production builds so
                production users don't accidentally broadcast simulated data.
                Keep the control available for development and test runs. */}
            {(import.meta.env.MODE !== 'production') && (
              <FormControlLabel
                control={
                  <Switch
                    checked={localSimulate}
                    onChange={(e) => setLocalSimulate(e.target.checked)}
                    disabled={isBroadcasting}
                  />
                }
                label="Simulate Movement"
                sx={{ mt: 2 }}
              />
            )}
            <Box sx={{ my: 2, position: 'relative' }}>
              <Button
                variant="contained"
                color={isBroadcasting ? 'error' : 'primary'}
                fullWidth
                size="large"
                onClick={isBroadcasting ? handleStop : handleStart}
                disabled={isProcessing}
                sx={{
                  py: 1.5,
                  background: isBroadcasting
                    ? "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)"
                    : "linear-gradient(135deg, #ff0000 0%, #0000ff 100%)",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
              >
                {isBroadcasting ? 'Stop Broadcasting' : 'Start Broadcasting'}
              </Button>
              {isProcessing && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
            {isBroadcasting && (
              <Box mt={2} p={2} sx={{
                background: "linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(0, 0, 255, 0.1) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 2
              }}>
                <Typography variant="body2">
                  {localSimulate ? (
                    <>
                      <strong>Simulation Active</strong> - Moving randomly around default location
                    </>
                  ) : (
                    "Your real location is being shared"
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
      <Snackbar
        open={!!localError}
        autoHideDuration={6000}
        onClose={() => setLocalError(null)}
      >
        <Alert
          onClose={() => setLocalError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {localError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BroadcastPage;
