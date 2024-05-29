import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom'

import NotFound from '../components/NotFound/NotFound';
const mockLocalStorage = {
    getItem: jest.fn(),
  };
  jest.spyOn(global, 'localStorage', 'get').mockImplementation(() => mockLocalStorage);

describe('NotFound', () => {

  it('renders the 404 page with correct messages and links when the user is logged in', () => {
    jest.spyOn(global.localStorage, 'getItem').mockReturnValue('fakeToken');
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({});

    render(
      <Router>
        <NotFound />
      </Router>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Oops! Page not found.')).toBeInTheDocument();
    expect(screen.getByText('The page you are looking for might be unavailable or does not exist.')).toBeInTheDocument();
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });

  it('redirects to /login when "Go back to Login" link is clicked', () => {
    jest.spyOn(global.localStorage, 'getItem').mockReturnValue(null);

    const { getByText } = render(
      <Router>
        <NotFound />
      </Router>
    );

    fireEvent.click(getByText('Go back to Login'));

    expect(window.location.href).toBe('http://localhost/login');
  });

  it('redirects to /supervisor-dashboard when "Go to Home" link is clicked for admin user', () => {
    jest.spyOn(global.localStorage, 'getItem').mockReturnValue('fakeToken');
    jest.spyOn(JSON, 'parse').mockReturnValueOnce({ userType: 'admin' });
  
    const { getByText } = render(
      <Router>
        <NotFound />
      </Router>
    );
  
    fireEvent.click(getByText('Go to Home'));
    expect(window.location.href).toBe('http://localhost/supervisor-dashboard');
  });
});  

it('redirects to /supervisor-dashboard when "Go to Home" link is clicked for supervisor user', () => {
  jest.spyOn(global.localStorage, 'getItem').mockReturnValue('fakeToken');
  jest.spyOn(JSON, 'parse').mockReturnValueOnce({ userType: 'supervisor' });

  const { getByText } = render(
    <Router>
      <NotFound />
    </Router>
  );

  fireEvent.click(getByText('Go to Home'));
  expect(window.location.href).toBe('http://localhost/supervisor-dashboard');
});

it('redirects to /hotel-dashboard when "Go to Home" link is clicked for hotel user', () => {
  jest.spyOn(global.localStorage, 'getItem').mockReturnValue('fakeToken');
  jest.spyOn(JSON, 'parse').mockReturnValueOnce({ userType: 'hotel' });

  const { getByText } = render(
    <Router>
      <NotFound />
    </Router>
  );

  fireEvent.click(getByText('Go to Home'));
  expect(window.location.href).toBe('http://localhost/hotel-dashboard');
});

it('redirects to /customer-dashboard when "Go to Home" link is clicked for customer user', () => {
  jest.spyOn(global.localStorage, 'getItem').mockReturnValue('fakeToken');
  jest.spyOn(JSON, 'parse').mockReturnValueOnce({ userType: 'customer' });

  const { getByText } = render(
    <Router>
      <NotFound />
    </Router>
  );

  fireEvent.click(getByText('Go to Home'));
  expect(window.location.href).toBe('http://localhost/select-hotels');
});
