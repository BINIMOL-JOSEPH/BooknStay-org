import React from 'react';
import { render, screen} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { adminServices } from '../../AdminService';
import SupervisorDashboard from '../../components/Sidebar/SupervisorDashboard';
import "@testing-library/jest-dom";
jest.mock('../../AdminService', () => ({
  adminServices: {
    CountListHotels: jest.fn(),
    HotelBookingGraph: jest.fn(),
    CountListSupervisor: jest.fn(),
  },
}));

describe('SupervisorDashboard', () => {
  test('renders without error', async () => {
    render(
      <MemoryRouter>
        <SupervisorDashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId('menuIcon')).toBeInTheDocument();
    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
  });
});
test('renders error message when CountList API call fails', async () => {
  adminServices.CountListHotels.mockRejectedValueOnce(new Error('CountList API error'));

  render(
    <MemoryRouter>
      <SupervisorDashboard />
    </MemoryRouter>
  );

  expect(screen.queryByTestId('loading')).toBeNull();
});

test('renders error message when HotelBookingGraph API call fails', async () => {
  adminServices.HotelBookingGraph.mockRejectedValueOnce(new Error('HotelBookingGraph API error'));

  render(
    <MemoryRouter>
      <SupervisorDashboard />
    </MemoryRouter>
  );
   expect(screen.queryByTestId('loading')).toBeNull();
});
