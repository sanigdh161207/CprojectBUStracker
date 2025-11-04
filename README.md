# AU Bus - Real-Time Bus Location Tracking System

A real-time bus location tracking web application that allows bus and students drivers to broadcast their GPS locations and displays all active buses on an interactive map.

  Usually everyday students share thier live location on whatsapp which is good but the upper hand my app provodies is even if you miss your bus if anyone from nearby bus is broadcasting you can get on to their bus or in such similar  cases

## Features

- **Real-Time GPS Tracking**: Bus drivers can broadcast their live location
- **Interactive Map View**: View all active buses on a real-time interactive map
- **Anonymous Authentication**: Automatic sign-in using Firebase Anonymous Auth
- **Persistent State**: Broadcasting state persists across page reloads
- **Clean UI**: Simple, intuitive interface with Material-UI components
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19.1.1 with Vite
- **UI Library**: Material-UI (MUI) 7.3.4
- **Maps**: Leaflet 1.9.4 with React-Leaflet 5.0.0
- **Backend**: Firebase 12.5.0
  - Firestore (Real-time database)
  - Firebase Authentication (Anonymous)
  - Firebase Hosting
- **Routing**: React Router DOM 7.9.5

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aubus
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Enable Anonymous Authentication
   - Copy your Firebase config to `src/Firebase.js`

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

### For Bus Drivers (Broadcast Page)

1. Navigate to the home page (`/`)
2. Enter your Bus Number and Driver Name
3. Click "Start Broadcasting" to begin sharing your location
4. The app will use your device's GPS to track your location
5. Click "Stop Broadcasting" when done

### For Passengers (Map View)

1. Navigate to the Map View page (`/map`)
2. See all active buses displayed on the interactive map
3. Click on any bus marker to see bus number and driver name
4. The sidebar shows a list of all active buses

## Project Structure

```
aubus/
├── src/
│   ├── context/
│   │   └── BusContext.jsx       # Centralized state management
│   ├── App.jsx                  # Main app with routing
│   ├── BroadcastPage.jsx        # Driver interface for broadcasting
│   ├── MapViewPage.jsx          # Interactive map view
│   ├── NavBar.jsx               # Navigation bar
│   ├── ErrorBoundary.jsx        # Error handling
│   ├── Firebase.js              # Firebase configuration
│   └── main.jsx                 # App entry point
├── firebase.json                # Firebase hosting config
├── firestore.rules              # Firestore security rules
├── package.json                 # Dependencies
└── vite.config.js               # Vite configuration
```

## Architecture

### State Management

The app uses React Context (`BusContext`) for centralized state management:
- Single Firestore listener for all components
- Automatic authentication handling
- Persistent localStorage for user preferences

### Data Flow

1. **Broadcasting**: Driver starts broadcasting → GPS/simulation updates location → Context writes to Firestore
2. **Viewing**: Context listens to Firestore → Updates activeBuses state → Components re-render with new data

### Firebase Collections

- **locations**: Stores active bus locations
  - Document ID: User's Firebase Auth UID
  - Fields: `busNo`, `driverName`, `latitude`, `longitude`, `timestamp`, `isSimulated`

## Security

Firestore security rules ensure:
- Anyone can read bus locations
- Only authenticated users can create/update their own location
- Users cannot modify other users' locations

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest
- `npm run deploy` - Build and deploy to Firebase Hosting

## Deployment

### Firebase Hosting

```bash
npm run deploy
```

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

## Environment Variables

Firebase configuration is directly in `src/Firebase.js`. For production, consider using environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Issues

- GPS tracking requires HTTPS in production
- Browser must have location permissions enabled
- Firestore free tier has usage limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- OpenStreetMap for map tiles
- Material-UI for UI components
- Firebase for backend services
- Leaflet for map functionality
