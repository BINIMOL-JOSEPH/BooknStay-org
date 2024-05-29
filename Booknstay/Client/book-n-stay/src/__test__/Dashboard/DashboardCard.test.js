import React from 'react';
import { render, screen } from '@testing-library/react';
import { HotelCard,AdminCard,SupervisorCard,CustomerCard } from '../../components/DashboardCard/DashboardCards';
import '@testing-library/jest-dom'
describe('Card Components', () => {
    test('renders HotelCard correctly', () => {
      render(<HotelCard />);
      const hotelCardTitle = screen.getByText('Hotel Card');
      expect(hotelCardTitle).toBeInTheDocument();
    });
  
    test('renders CustomerCard correctly', () => {
      render(<CustomerCard />);
      const customerCardTitle = screen.getByText('Customer Card');
      expect(customerCardTitle).toBeInTheDocument();
    });
  
    test('renders SupervisorCard correctly', () => {
      render(<SupervisorCard />);
      const supervisorCardTitle = screen.getByText('Supervisor Card');
      expect(supervisorCardTitle).toBeInTheDocument();
    });
  
    test('renders AdminCard correctly', () => {
      render(<AdminCard />);
      const adminCardTitle = screen.getByText('Admin Card');
      expect(adminCardTitle).toBeInTheDocument();
    });
  

});
