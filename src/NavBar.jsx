// src/NavBar.jsx
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { LocationOn, Map, Visibility } from '@mui/icons-material';

export default function NavBar() {
  return (
    <AppBar
      position="static"
      sx={{
        // FIX: Use the softer primary gradient
        background: 'linear-gradient(135deg, #ff6b6b 0%, #4d79ff 100%)',
        boxShadow: 'none'
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AU Bus Tracking
        </Typography>
        <Button color="inherit" component={RouterLink} to="/" startIcon={<LocationOn />}>
          Broadcast
        </Button>
        <Button color="inherit" component={RouterLink} to="/map" startIcon={<Map />}>
          Map View
        </Button>
        <Button color="inherit" component={RouterLink} to="/listener" startIcon={<Visibility />}>
          Bus List
        </Button>
      </Toolbar>
    </AppBar>
  );
}