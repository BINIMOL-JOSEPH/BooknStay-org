import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../components/Login/Login';
import { userService } from '../../UserService';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';

jest.mock('../../UserService', () => ({
  userService: {
    LoginUser: jest.fn(),
  },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));
test('renders login form successfully', () => {
  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const toggleButton = screen.getByTestId('toggle-password');
  const button = screen.getByTestId('login');

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toHaveAttribute('type', 'password');
  expect(button).toBeInTheDocument();

  fireEvent.change(emailInput, { target: { value: 'test1@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
  fireEvent.click(button);
  fireEvent.click(toggleButton);
  expect(passwordInput).toHaveAttribute('type', 'text');
});

test('handles successful login', async () => {
  userService.LoginUser.mockResolvedValue({
    data: {
      accessToken: 'fakeToken',
      userType: 'customer',
      id: 'fakeUserId',
      accountId: 'fakeAccountId',
    },
  });

  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const button = screen.getByTestId('login');
  fireEvent.change(emailInput, { target: { value: 'test1@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
  fireEvent.click(button);
  expect(screen.queryByText('Incorrect password.')).toBeNull();
  expect(screen.queryByText('Login failed. Please check your email and password.')).toBeNull();
  expect(screen.queryByTestId('dashboard-navigation-element')).toBeNull();
});


test('handles unsuccessful login with incorrect password', async () => {
  const errorMessage = 'Invalid credentials.';
  userService.LoginUser.mockRejectedValue({
    response: {
      data: {
        error: errorMessage,
      },
    },
  });

  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const button = screen.getByTestId('login');
  fireEvent.change(emailInput, { target: { value: 'test1@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'IncorrectPassword' } });
  fireEvent.click(button);
  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  expect(screen.queryByText('Login failed. Please check your email and password.')).toBeNull();
  expect(screen.queryByTestId('dashboard-navigation-element')).toBeNull();
});

test('navigates to supervisor dashboard for admin user', async () => {
  const navigateMock = jest.fn();
  require('react-router-dom').useNavigate.mockReturnValue(navigateMock);

  userService.LoginUser.mockResolvedValue({
    data: {
      accessToken: 'fakeToken',
      userType: 'admin',
      id: 'fakeUserId',
      accountId: 'fakeAccountId',
    },
  });

  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const button = screen.getByTestId('login');

  fireEvent.change(emailInput, { target: { value: 'test1@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith('/supervisor-dashboard');
  });
});
test('navigates to supervisor dashboard for supervisor user', async () => {
  const navigateMock = jest.fn();
  require('react-router-dom').useNavigate.mockReturnValue(navigateMock);

  userService.LoginUser.mockResolvedValue({
    data: {
      accessToken: 'fakeToken',
      userType: 'supervisor',
      id: 'fakeUserId',
      accountId: 'fakeAccountId',
    },
  });

  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const button = screen.getByTestId('login');

  fireEvent.change(emailInput, { target: { value: 'test1@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith('/supervisor-dashboard');
  });
});
test('navigates to hotel dashboard for hotel user', async () => {
  const navigateMock = jest.fn();
  require('react-router-dom').useNavigate.mockReturnValue(navigateMock);

  userService.LoginUser.mockResolvedValue({
    data: {
      accessToken: 'fakeToken',
      userType: 'hotel',
      id: 'fakeUserId',
      accountId: 'fakeAccountId',
    },
  });

  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const button = screen.getByTestId('login');

  fireEvent.change(emailInput, { target: { value: 'test1@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith('/hotel-dashboard');
  });
});
test('navigates to customer dashboard for customer user', async () => {
  const navigateMock = jest.fn();
  require('react-router-dom').useNavigate.mockReturnValue(navigateMock);

  userService.LoginUser.mockResolvedValue({
    data: {
      accessToken: 'fakeToken',
      userType: 'customer',
      id: 'fakeUserId',
      accountId: 'fakeAccountId',
    },
  });

  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const button = screen.getByTestId('login');

  fireEvent.change(emailInput, { target: { value: 'test1@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith('/select-hotels');
  });
});
test('navigates based on user type and storage data', async () => {
  const navigateMock = jest.fn();
  require('react-router-dom').useNavigate.mockReturnValue(navigateMock);

  userService.LoginUser.mockResolvedValue({
    data: {
      accessToken: 'fakeToken',
      userType: 'customer',
      id: 'fakeUserId',
      accountId: 'fakeAccountId',
    },
  });
  localStorage.setItem('checkInDate', 'fakeCheckInDate');
  localStorage.setItem('checkOutDate', 'fakeCheckOutDate');

  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const button = screen.getByTestId('login');

  fireEvent.change(emailInput, { target: { value: 'test1@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith('/select-hotels');
  });

});
test('handles login with invalid userType', async () => {
  const invalidUserTypeResponse = {
    data: {
      accessToken: 'fakeToken',
      userType: 'invalidUserType',
      id: 'fakeUserId',
      first_name: 'John',
    },
  };

  userService.LoginUser.mockResolvedValue(invalidUserTypeResponse);

  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const button = screen.getByTestId('login');

  fireEvent.change(emailInput, { target: { value: 'test1@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
  fireEvent.click(button);

  await waitFor(() => {
    const errorElements = screen.queryAllByText('User type not allowed.');
    expect(errorElements).toHaveLength(2);
  });
});
test('handles login error with status 500', async () => {
  const errorResponse = {
    response: {
      status: 500,
    },
  };

  userService.LoginUser.mockRejectedValue(errorResponse);

  render(<MemoryRouter><Login /></MemoryRouter>);

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const button = screen.getByTestId('login');

  userEvent.type(emailInput, 'test1@gmail.com');
  userEvent.type(passwordInput, 'Password@123');
  userEvent.click(button);

  await waitFor(() => {
    const errorMessages = screen.queryAllByText('An error occurred during login. Please try again.');
    expect(errorMessages).toHaveLength(1);
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Login Failed',
      text: 'An error occurred during login. Please try again.',
    });
  });
});
