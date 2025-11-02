import React, { useMemo, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import { Box, Paper, Typography, Chip, List, ListItem, ListItemText, Avatar } from '@mui/material';
import { DirectionsBus } from '@mui/icons-material';
import { useBus } from './context/BusContext';

// Inline default coordinates from removed constants file
const DEFAULT_COORDINATES = { latitude: 17.43065300129256, longitude: 78.53042705991402 };
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// FIX Leaflet default icon path issue with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
// End icon fix

// Component to auto-fit map bounds to markers
const AutoFitBounds = ({ buses }) => {
  const map = useMap();

  useEffect(() => {
    if (buses.length === 0) {
      map.setView(
        [DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude],
        13
      );
      return;
    }

    const bounds = L.latLngBounds(
      buses.map((bus) => [bus.latitude, bus.longitude]).filter(([lat, lng]) =>
        !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
      )
    );

    if (bounds.isValid() && buses.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [buses, map]);

  return null;
};

// MovingMarker: creates a leaflet marker and smoothly interpolates between
// old and new positions when `position` prop changes. We use a plain Leaflet
// marker (not react-leaflet <Marker>) so we can call setLatLng directly.
const MovingMarker = ({ position, popupText, iconOptions }) => {
  const map = useMap();
  const markerRef = React.useRef(null);
  const animRef = React.useRef(null);
  // In test environments leaflet may be mocked without marker support.
  // If L.marker isn't available, render a simple placeholder so tests can
  // find markers via data-testid.
  React.useEffect(() => {
    if (typeof L.marker !== 'function') return;
    if (!markerRef.current) {
      const marker = L.marker(position, iconOptions || {}).addTo(map);
      if (popupText) marker.bindPopup(popupText);
      markerRef.current = marker;
      return () => {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
      };
    }
    // if marker exists, update popup content if changed
    if (markerRef.current && popupText) {
      markerRef.current.getPopup()?.setContent(popupText);
    }
  }, [map]);

  // animate changes to position
  React.useEffect(() => {
    if (typeof L.marker !== 'function') return;
    if (!markerRef.current) return;
    const marker = markerRef.current;
    const startLatLng = marker.getLatLng();
    const endLatLng = L.latLng(position[0], position[1]);

    // If same position, nothing to do
    if (startLatLng.equals(endLatLng)) return;

    const duration = 800; // ms
    const start = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * t;
      const lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * t;
      marker.setLatLng([lat, lng]);
      if (t < 1) animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [position]);

  return null; // marker is managed directly via Leaflet
};


const MapViewPage = () => {
  const { activeBuses } = useBus();
  const busCount = activeBuses.length;

  const markers = useMemo(
    () =>
      activeBuses
        .filter((bus) => bus.latitude && bus.longitude &&
          !isNaN(bus.latitude) && !isNaN(bus.longitude))
        .map((bus) => ({
          key: bus.id,
          position: [bus.latitude, bus.longitude],
          popup: `Bus ${bus.busNo || 'Unknown'} - ${bus.driverName || 'Driver'}${bus.isSimulated ? ' (Simulated)' : ''}`,
        })),
    [activeBuses]
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 250,
          p: 2,
          overflowY: 'auto',
          height: '100%',
          position: 'fixed',
          left: 0,
          top: 64,
          zIndex: 1000,
          background: "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(77, 121, 255, 0.1) 100%)",
        }}
        elevation={4}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Avatar
            sx={{
              background: "linear-gradient(135deg, #ff0000 0%, #0000ff 100%)",
              color: "white",
            }}
          >
            <DirectionsBus />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            Active Buses ({busCount})
          </Typography>
        </Box>
        {busCount === 0 ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(0, 0, 255, 0.1) 100%)",
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No active buses
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {activeBuses.map((bus) => (
              <ListItem
                key={bus.id}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  background: "linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(0, 0, 255, 0.1) 100%)",
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="bold">
                      Bus {bus.busNo || 'Unknown'}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {bus.driverName || 'Driver'}
                      {bus.isSimulated && (
                        <Chip
                          label="Simulated"
                          size="small"
                          color="warning"
                          sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                        />
                      )}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Map Container */}
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          marginLeft: '250px',
        }}
      >
        <MapContainer
          center={[
            DEFAULT_COORDINATES.latitude,
            DEFAULT_COORDINATES.longitude,
          ]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {markers.map((m) => (
            // markers array used to create simple marker-like entries; we
            // now render MovingMarker instances for smooth animation.
            <React.Fragment key={m.key}>
              {/* When Leaflet isn't available (tests), MovingMarker renders a placeholder */}
              <MovingMarker
                position={m.position}
                popupText={m.popup}
              />
              {typeof L.marker !== 'function' && (
                <div data-testid="marker">{m.popup}</div>
              )}
            </React.Fragment>
          ))}
          <AutoFitBounds buses={activeBuses} />
        </MapContainer>
      </Box>
    </Box>
  );
};

export default MapViewPage;
