import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BroadcastPage from './BroadcastPage';
import { BusProvider, useBus } from './context/BusContext';

// Mock the context
vi.mock('./context/BusContext', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useBus: vi.fn(),
  };
});

const mockActions = {
  updateBusDetails: vi.fn(),
  startBroadcasting: vi.fn(),
  stopBroadcasting: vi.fn(),
  updateLocation: vi.fn(),
};

const mockUseBusReturn = {
  isBroadcasting: false,
  busDetails: { busNo: '', driverName: '', simulateMovement: false },
  error: null,
  actions: mockActions,
};

// Mock geolocation API
const mockGeolocation = {
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('BroadcastPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBus.mockReturnValue(mockUseBusReturn);
  });

  afterEach(() => {
    // Ensure timers are restored if a test uses fake timers
    try {
      vi.useRealTimers();
    } catch (e) { }
  });

  it('renders and validates empty fields', async () => {
    render(
      <BusProvider>
        <BroadcastPage />
      </BusProvider>
    );

    const startButton = screen.getByText('Start Broadcasting');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(
        screen.getByText('Bus Number and Driver Name cannot be empty.')
      ).toBeInTheDocument();
    });
    expect(mockActions.updateBusDetails).not.toHaveBeenCalled();
  });

  it('calls updateBusDetails when inputs are valid and simulation is selected', async () => {
    render(
      <BusProvider>
        <BroadcastPage />
      </BusProvider>
    );

    fireEvent.change(screen.getByLabelText('Bus Number'), {
      target: { value: '101A' },
    });
    fireEvent.change(screen.getByLabelText('Driver Name'), {
      target: { value: 'Test Driver' },
    });

    const startButton = screen.getByText('Start Broadcasting');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Bus Number and Driver Name cannot be empty.')
      ).not.toBeInTheDocument();
    });
    expect(mockActions.updateBusDetails).toHaveBeenCalledWith({
      busNo: '101A',
      driverName: 'Test Driver',
      simulateMovement: false,
    });
  });

  it('shows "Stop Broadcasting" button when active', async () => {
    useBus.mockReturnValue({
      ...mockUseBusReturn,
      isBroadcasting: true,
      busDetails: { busNo: '101A', driverName: 'Test', simulateMovement: false },
    });

    render(
      <BusProvider>
        <BroadcastPage />
      </BusProvider>
    );

    const stopButton = screen.getByText('Stop Broadcasting');
    expect(stopButton).toBeInTheDocument();
    fireEvent.click(stopButton);
    await waitFor(() => {
      expect(mockActions.stopBroadcasting).toHaveBeenCalled();
    });
  });

  it('disables inputs when broadcasting', () => {
    useBus.mockReturnValue({
      ...mockUseBusReturn,
      isBroadcasting: true,
      busDetails: { busNo: '101A', driverName: 'Test', simulateMovement: false },
    });

    render(
      <BusProvider>
        <BroadcastPage />
      </BusProvider>
    );

    expect(screen.getByLabelText('Bus Number')).toBeDisabled();
    expect(screen.getByLabelText('Driver Name')).toBeDisabled();
  });


});

