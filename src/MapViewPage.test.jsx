import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MapViewPage from './MapViewPage';
import { useBus } from './context/BusContext';

// Mock Material-UI icons to prevent file handle issues
vi.mock('@mui/icons-material', () => ({
  DirectionsBus: () => <div data-testid="directions-bus-icon">BusIcon</div>,
}));

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer"></div>,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: vi.fn(() => ({
    fitBounds: vi.fn(),
    setView: vi.fn(),
  })),
}));

// Mock leaflet to prevent file handle issues
vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
    latLngBounds: vi.fn((coords) => ({
      isValid: () => true,
    })),
    map: vi.fn(),
  },
}));

vi.mock('./context/BusContext', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useBus: vi.fn(),
  };
});

describe('MapViewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "No active buses" when list is empty', () => {
    useBus.mockReturnValue({ activeBuses: [] });
    render(<MapViewPage />);
    expect(screen.getByText('No active buses')).toBeInTheDocument();
    expect(screen.getByText(/Active Buses \(0\)/)).toBeInTheDocument();
    expect(screen.queryByTestId('marker')).not.toBeInTheDocument();
  });

  it('renders markers and bus list for active buses', () => {
    const mockBuses = [
      { id: '1', latitude: 17, longitude: 78, busNo: '101', driverName: 'Driver A' },
      { id: '2', latitude: 17.1, longitude: 78.1, busNo: '102', driverName: 'Driver B' },
    ];
    useBus.mockReturnValue({ activeBuses: mockBuses });
    render(<MapViewPage />);

    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
    expect(screen.getByText(/Active Buses \(2\)/)).toBeInTheDocument();
    expect(screen.getByText('Bus 101')).toBeInTheDocument();
    expect(screen.getByText('Bus 102')).toBeInTheDocument();
    expect(screen.getByText('Driver A')).toBeInTheDocument();
    expect(screen.getByText('Driver B')).toBeInTheDocument();
  });

  it('filters out invalid coordinates', () => {
    const mockBuses = [
      { id: '1', latitude: 17, longitude: 78, busNo: '101', driverName: 'A' },
      { id: '2', latitude: NaN, longitude: 78.1, busNo: '102', driverName: 'B' },
      { id: '3', latitude: 17.2, longitude: null, busNo: '103', driverName: 'C' },
    ];
    useBus.mockReturnValue({ activeBuses: mockBuses });
    render(<MapViewPage />);

    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(1);
  });
});

