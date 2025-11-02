import React from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Chip,
  Box,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { useBus } from './context/BusContext';

const LocationsListener = () => {
  const { activeBuses } = useBus();

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff6b6b 0%, #4d79ff 100%)",
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h4" component="h1">
              Active Buses
            </Typography>
            <Badge badgeContent={activeBuses.length} color="primary">
              <DirectionsBusIcon fontSize="large" />
            </Badge>
          </Box>
          {activeBuses.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ p: 4 }}>
              No buses are currently broadcasting.
            </Typography>
          ) : (
            <List>
              {activeBuses.map((bus) => (
                <ListItem
                  key={bus.id}
                  divider
                  secondaryAction={
                    bus.isSimulated && <Chip label="Simulated" size="small" color="warning" />
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        background: "linear-gradient(135deg, #ff0000 0%, #0000ff 100%)",
                      }}
                    >
                      <DirectionsBusIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Bus ${bus.busNo || 'Unknown'} - ${bus.driverName || 'Driver'}`}
                    secondary={
                      bus.latitude && bus.longitude
                        ? `Coords: ${bus.latitude.toFixed(5)}, ${bus.longitude.toFixed(5)}`
                        : 'No coordinates'
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default LocationsListener;
