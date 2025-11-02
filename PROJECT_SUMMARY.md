# AU Bus - Real-Time Bus Location Tracking System

## Project Overview
AU Bus is a real-time bus location tracking web application built with React and Firebase. It allows bus drivers to broadcast their GPS locations and displays all active buses on an interactive map. The application supports both real GPS tracking and simulated movement for testing purposes.

## Tech Stack
- **Frontend Framework**: React 19.1.1 with Vite 5.1.6
- **Routing**: React Router DOM 7.9.5
- **UI Components**: Material-UI (MUI) 7.3.4 with Emotion styling
- **Maps**: Leaflet 1.9.4 (with custom icon fixes)
- **Backend/Database**: Firebase 12.5.0
  - Firestore (NoSQL database for location data)
  - Firebase Authentication (Anonymous sign-in)
  - Firebase Hosting (Deployment)
- **Build Tool**: Vite with React plugin
- **Language**: JavaScript (ES6 modules)

## Project Structure
```
AUbus/
├── src/
│   ├── main.jsx              # React entry point with ErrorBoundary
│   ├── App.jsx              # Main app component with routing
│   ├── NavBar.jsx           # Navigation bar component
│   ├── BroadcastPage.jsx    # Page for drivers to start/stop broadcasting
│   ├── MapViewPage.jsx      # Interactive map showing all buses
│   ├── LocationsListener.jsx # List view of all active buses
│   ├── Firebase.js          # Firebase configuration and initialization
│   ├── ErrorBoundary.jsx    # Error handling component
│   ├── constants.js         # Default coordinates and simulation parameters
│   ├── index.css            # Global CSS styles
│   └── App.css              # App-specific CSS
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies and scripts
├── firebase.json            # Firebase Hosting configuration
└── .firebaserc              # Firebase project configuration
```

## Key Features

### 1. Broadcast Page (`BroadcastPage.jsx`)
- **Purpose**: Allows bus drivers to broadcast their location
- **Features**:
  - Input fields for Bus Number (persisted in localStorage)
  - Input field for Driver Name (persisted in localStorage)
  - Toggle switch to enable/disable simulated movement
  - Start/Stop broadcasting buttons
  - Real-time status display when broadcasting
- **Location Tracking**:
  - **Real GPS**: Uses `navigator.geolocation.watchPosition()` with:
    - `enableHighAccuracy: true`
    - `maximumAge: 0` (always fresh data)
    - `timeout: 5000` (5 seconds)
  - **Simulated Movement**: Random movement around default coordinates
    - Updates every 3 seconds
    - Uses `DEFAULT_COORDINATES` from constants.js
    - Applies `SIMULATION_STEP` (0.001 degrees) for movement
- **State Management**:
  - Uses `localStorage` to persist:
    - `busNo`, `driverName`, `isBroadcasting`, `userId`, `simulateMovement`
  - Automatically restores broadcasting state on page reload/navigation
  - Uses `useRef` for `watchIdRef` and `simulationIntervalIdRef` to persist across navigation

### 2. Map View Page (`MapViewPage.jsx`)
- **Purpose**: Interactive map displaying all active bus locations in real-time
- **Features**:
  - Leaflet map initialized with default coordinates
  - Real-time bus count sidebar (left side, 250px wide)
    - Shows live count of active buses
    - Status chip (Active/No Active Buses)
    - Sticky positioning
  - Dynamic markers for each active bus
    - Updates position in real-time via Firestore listener
    - Popup shows: "Bus {busNo} - {driverName}"
    - Markers removed when bus stops broadcasting
- **Real-time Updates**:
  - Uses Firestore `onSnapshot` listener
  - Updates markers within `requestAnimationFrame` for smooth rendering
  - Processes all documents from snapshot immediately (no throttling)
  - Tracks existing vs current marker IDs to add/update/remove markers

### 3. Locations Listener Page (`LocationsListener.jsx`)
- **Purpose**: List view showing all active buses with details
- **Features**:
  - Material-UI styled card layout
  - List of all active buses showing:
    - Bus number
    - Driver name
    - Coordinates (latitude, longitude)
    - Timestamp
    - "Simulated" badge if using simulated movement
  - Empty state when no buses are broadcasting
  - Active bus count badge in header
- **Real-time Updates**: Uses Firestore `onSnapshot` to update list automatically

### 4. Navigation Bar (`NavBar.jsx`)
- **Purpose**: App-wide navigation
- **Routes**:
  - `/` - Broadcast Page
  - `/map` - Map View Page
  - `/listener` - Locations Listener Page
- **Styling**: Red/blue gradient background matching app theme

## Firebase Configuration

### Project Details
- **Project ID**: `aubus-dba10`
- **Firestore Collection**: `locations`
  - Document ID: User ID (from anonymous authentication)
  - Document Fields:
    - `busNo`: string
    - `driverName`: string
    - `latitude`: number
    - `longitude`: number
    - `timestamp`: Firestore Timestamp
    - `isSimulated`: boolean

### Firestore Operations
- **Write**: `setDoc()` - Updates location document (non-blocking, uses `.catch()`)
- **Read**: `onSnapshot()` - Real-time listener for location updates
- **Delete**: `deleteDoc()` - Removes location when broadcasting stops

### Authentication
- **Method**: Anonymous sign-in (`signInAnonymously`)
- **User ID**: Stored in localStorage and used as Firestore document ID
- **Persistence**: User ID persists across sessions via localStorage

## Data Flow

### Broadcasting Flow
1. User enters Bus Number on Broadcast Page
2. Clicks "Start Broadcasting"
3. System signs in anonymously (or uses existing userId from localStorage)
4. If simulated: Starts interval (3 seconds) to update position randomly
5. If real GPS: Starts `watchPosition` with geolocation API
6. Each update calls `updateLocation()` which writes to Firestore
7. Firestore document structure: `locations/{userId}`

### Map/Listener Flow
1. Components mount and set up Firestore `onSnapshot` listener
2. Listener receives real-time updates when any location document changes
3. Map: Updates marker positions or creates/removes markers
4. Listener: Updates list of buses
5. Bus Count: Updates count from snapshot.docs.length

### State Persistence
- **localStorage keys**:
  - `busNo`: Bus number input
  - `driverName`: Driver name input
  - `isBroadcasting`: Boolean string ('true'/'false')
  - `userId`: Firebase anonymous user ID
  - `simulateMovement`: Boolean string ('true'/'false')
- **Restoration**: On mount, BroadcastPage checks localStorage and restores broadcasting if was active

## Constants & Configuration

### Default Coordinates (`constants.js`)
- **DEFAULT_COORDINATES**: 
  - latitude: 17.43065300129256 (Hyderabad, India)
  - longitude: 78.53042705991402
- **COORDINATE_VARIATION**: 0.02 (for initial random position in simulation)
- **SIMULATION_STEP**: 0.001 (movement increment per update, ~100-300m)

## Styling & UI

### Color Scheme
- **Theme**: Red/Blue gradient throughout
  - Primary gradient: `linear-gradient(135deg, #ff6b6b 0%, #4d79ff 100%)`
  - NavBar: `linear-gradient(135deg, #ff0000 0%, #0000ff 100%)`
  - Cards/Buttons: Red/Blue gradient accents

### Material-UI Components Used
- AppBar, Toolbar, Button, Box, TextField, Card, CardContent
- Avatar, CircularProgress, Switch, FormControlLabel
- Typography, Paper, List, ListItem, ListItemAvatar, ListItemText
- Chip, IconButton

## Leaflet Map Configuration

### Icon Fix
- Leaflet default icons don't load correctly with Vite
- Fixed by setting CDN URLs for marker icons:
  - `iconRetinaUrl`: marker-icon-2x.png
  - `iconUrl`: marker-icon.png
  - `shadowUrl`: marker-shadow.png

### Map Initialization
- Container: div with ref (`mapRef`)
- Initial view: DEFAULT_COORDINATES at zoom level 13
- Tile layer: OpenStreetMap
- Cleanup: Properly removes map instance and markers on unmount

## Error Handling

### ErrorBoundary Component
- Wraps App and all routes
- Catches JavaScript errors in component tree
- Displays fallback UI (implementation not detailed in summary)

### Try-Catch Blocks
- Firestore operations wrapped in try-catch
- Geolocation errors handled in watchPosition error callback
- Map marker operations have error handling

## Known Implementation Details

### Performance Optimizations
- Firestore writes are non-blocking (no await, uses `.catch()`)
- Map updates use `requestAnimationFrame` for smooth rendering
- No throttling on Firestore listeners (immediate updates)
- Uses `useRef` for map instance and markers to avoid re-initialization

### Potential Issues to Check
1. **Memory leaks**: Ensure all intervals and listeners are cleaned up
2. **Map re-initialization**: Should only initialize once (check for `_leaflet_id`)
3. **Geolocation permissions**: Browser may block real GPS tracking
4. **Firestore quota**: Large number of writes may hit free tier limits
5. **Network issues**: Firestore listener may fail silently on network errors
6. **State synchronization**: localStorage vs Firestore state consistency

## Deployment

### Firebase Hosting
- **Hosting URL**: https://aubus-dba10.web.app
- **Build command**: `npm run build` (outputs to `dist/`)
- **Deploy command**: `npm run deploy` (builds + deploys)

### Local Development
- **Command**: `npm run dev`
- **Port**: Usually http://localhost:5173 (Vite default)

## Dependencies Summary

### Production
- React 19.1.1, React DOM 19.1.1
- React Router DOM 7.9.5
- Material-UI 7.3.4 (core, icons, emotion)
- Firebase 12.5.0
- Leaflet 1.9.4
- React-Leaflet 5.0.0 (installed but not used - MapViewPage uses raw Leaflet)

### Development
- Vite 5.1.6
- ESLint plugins
- TypeScript types for React

## File-by-File Breakdown

### `src/main.jsx`
- Entry point, renders App with ErrorBoundary and StrictMode

### `src/App.jsx`
- Sets up React Router with 3 routes
- Wraps app in Material-UI ThemeProvider
- Includes CssBaseline for consistent styling

### `src/BroadcastPage.jsx`
- Main broadcasting interface (~330 lines)
- Handles user input, authentication, geolocation, simulation
- Manages state persistence and restoration

### `src/MapViewPage.jsx`
- Leaflet map with real-time Firestore listener (~225 lines)
- Manages marker lifecycle (create/update/remove)
- Displays bus count sidebar

### `src/LocationsListener.jsx`
- Material-UI list component showing all active buses
- Real-time Firestore listener updates list

### `src/NavBar.jsx`
- Simple navigation bar with 3 route buttons

### `src/Firebase.js`
- Firebase app initialization
- Exports `database` (Firestore) and `auth` (Authentication)

### `src/constants.js`
- Configuration values for coordinates and simulation

### `src/ErrorBoundary.jsx`
- React error boundary (implementation not detailed)

## Testing Considerations

1. **Real GPS**: Requires browser geolocation permission
2. **Simulation**: Works without permissions, uses random coordinates
3. **Multiple Buses**: Test with multiple browser tabs/windows
4. **Navigation**: Test state persistence when navigating between pages
5. **Network**: Test behavior with slow/interrupted network
6. **Firestore Rules**: Ensure read/write permissions are configured

## Security Notes

- Firebase API keys are exposed in client code (standard for client-side apps)
- Uses anonymous authentication (no user identification)
- No input validation visible (should check bus numbers, names)
- Firestore security rules should restrict writes to authenticated users only

