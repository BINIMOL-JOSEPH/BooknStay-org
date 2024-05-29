
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../components/Dashboard/Dashboard';

describe('Dashboard Component', () => {
  const localStorageMock = {
    getItem: jest.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  test('renders customer dashboard for customer user', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ userType: 'customer', first_name: 'Customer' }));
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    const dashboardTitle = screen.getByTestId('title');
    expect(dashboardTitle).toBeInTheDocument();
    expect(dashboardTitle).toHaveTextContent(/BooknStay/i);
  });
});
