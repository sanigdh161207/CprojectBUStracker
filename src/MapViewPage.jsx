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
import { DEFAULT_COORDINATES } from './constants';
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

const MapViewPage = () => {
  const { activeBuses } = useBus();
  const busCount = activeBuses.length;

  const markers = useMemo(
    () =>
      activeBuses
        .filter((bus) => bus.latitude && bus.longitude && 
          !isNaN(bus.latitude) && !isNaN(bus.longitude))
        .map((bus) => (
          <Marker key={bus.id} position={[bus.latitude, bus.longitude]}>
            <Popup>
              Bus {bus.busNo || 'Unknown'} - {bus.driverName || 'Driver'}
              {bus.isSimulated && ' (Simulated)'}
            </Popup>
          </Marker>
        )),
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
          {markers}
          <AutoFitBounds buses={activeBuses} />
        </MapContainer>
      </Box>
    </Box>
  );
};

export default MapViewPage;
