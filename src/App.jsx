// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import BroadcastPage from './BroadcastPage';
import MapViewPage from './MapViewPage';
import NavBar from './NavBar';
import ErrorBoundary from './ErrorBoundary';
import { BusProvider } from './context/BusContext';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <BusProvider>
          <Router>
            <NavBar />
            <Routes>
              <Route path="/" element={<BroadcastPage />} />
              <Route path="/map" element={<MapViewPage />} />
            </Routes>
          </Router>
        </BusProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
