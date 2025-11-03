// src/NavBar.jsx
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { LocationOn, Map, Visibility } from '@mui/icons-material';

export default function NavBar() {
  return (
    <AppBar
      position="static"
      sx={{
        background: '#1976d2',
        boxShadow: 'none'
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
          AU Bus Tracking
        </Typography>
        <Button
          color="inherit"
          component={RouterLink}
          to="/"
          startIcon={<LocationOn />}
          sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, px: { xs: 0.5, md: 1 } }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Broadcast</Box>
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/map"
          startIcon={<Map />}
          sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, px: { xs: 0.5, md: 1 } }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Map View</Box>
        </Button>
      </Toolbar>
    </AppBar>
  );
}