// src/NavBar.jsx
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  Box,
} from '@mui/material';
import { LocationOn, Map, Menu as MenuIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function NavBar() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #4d79ff 100%)',
        boxShadow: 'none',
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AU Bus Tracking
        </Typography>
        {isSmall ? (
          <Box>
            <IconButton color="inherit" onClick={handleOpenMenu} aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleCloseMenu}>
              <MenuItem component={RouterLink} to="/" onClick={handleCloseMenu}>
                <LocationOn sx={{ mr: 1 }} /> Broadcast
              </MenuItem>
              <MenuItem component={RouterLink} to="/map" onClick={handleCloseMenu}>
                <Map sx={{ mr: 1 }} /> Map View
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/" startIcon={<LocationOn />}>
              Broadcast
            </Button>
            <Button color="inherit" component={RouterLink} to="/map" startIcon={<Map />}>
              Map View
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}