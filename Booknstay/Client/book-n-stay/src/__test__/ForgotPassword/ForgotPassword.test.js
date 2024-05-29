import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPassword from '../../components/ForgotPassword/ForgotPassword';
import { userService } from '../../UserService';
import Swal from 'sweetalert2';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('sweetalert2');
jest.mock('../../UserService');

describe('ForgotPassword component', () => {
  test('renders the component', () => {
    render( <Router><ForgotPassword /></Router>);
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
  });

  test('submits the form with valid data', async () => {
    render(<Router><ForgotPassword /></Router>);

    const emailInput = screen.getByLabelText(/Email Address/i);
    userEvent.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(userService.ForgotPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
    expect(Swal.fire).toHaveBeenCalledWith({
      position: 'center',
      icon: 'success',
      title: 'Password reset link has been sent to your email',
      showConfirmButton: false,
      timer: 5000
    });
  });

  test('handles unexpected error and displays a sweetalert', async () => {
    userService.ForgotPassword.mockRejectedValueOnce({
      response: undefined,
    });

    render(<Router><ForgotPassword /></Router>);

    const emailInput = screen.getByLabelText(/Email Address/i);
    userEvent.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(userService.ForgotPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    expect(Swal.fire).toHaveBeenCalledWith({
      position: 'center',
      icon: 'error',
      title: 'Unexpected Error',
      text: 'An unexpected error occurred. Please try again later.',
      showConfirmButton: true,
    });
  });
});
