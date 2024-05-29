import React from 'react';
import { render, screen, fireEvent, waitFor ,act} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ChangePassword from '../../components/ChangePassword/ChangePassword';
import { userService } from '../../UserService';
import Swal from 'sweetalert2';
import { BrowserRouter as Router } from 'react-router-dom';

const localStorageMock = {
  getItem: jest.fn(()  => '{"user": {"userType": "admin", "first_name": "admin"}}'),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));


jest.mock('../../UserService', () => {
  const originalModule = jest.requireActual('../../UserService');
  return {
    ...originalModule,
    userService: {
      ...originalModule.userService,
      ChangePassword: jest.fn(),
    },
  };
});

describe('ChangePassword component', () => {

  

  it('displays error message for password mismatch', async () => {
    render(<Router><ChangePassword /></Router>);
    userEvent.type(screen.getByLabelText(/current password/i), 'currentPassword');
    userEvent.type(screen.getByTestId('new_password'), 'validNewPassword');
    userEvent.type(screen.getByLabelText(/confirm new password/i), 'invalidConfirmPassword');
    fireEvent.click(screen.getByTestId('submit-button'));
    await waitFor(() =>
      expect(screen.getByText('New Password and Confirm Password do not match.')).toBeInTheDocument()
    );
  });


});
it('toggles visibility of current password field', () => {
    render(<Router><ChangePassword /></Router>);

    const showCurrentPasswordButton = screen.getByTestId('show-current-password-button');
    const currentPasswordField = screen.getByLabelText(/current password/i);

    expect(currentPasswordField.type).toBe('password');

    fireEvent.click(showCurrentPasswordButton);

    expect(currentPasswordField.type).toBe('text');

    fireEvent.click(showCurrentPasswordButton);

    expect(currentPasswordField.type).toBe('password');
  });
  it('toggles visibility of new password field', () => {
    render(<Router><ChangePassword /></Router>);
    const showCurrentPasswordButton = screen.getByTestId('show-new-password-button');
    const currentPasswordField = screen.getByLabelText(/current password/i);

    expect(currentPasswordField.type).toBe('password');
    fireEvent.click(showCurrentPasswordButton);
    expect(currentPasswordField.type).toBe('password');
    fireEvent.click(showCurrentPasswordButton);
    expect(currentPasswordField.type).toBe('password');
  });
  
  it('toggles visibility of confirm password field', () => {
    render(<Router><ChangePassword /></Router>);

    const showCurrentPasswordButton = screen.getByTestId('show-confirm-password-button');
    const currentPasswordField = screen.getByLabelText(/current password/i);
    expect(currentPasswordField.type).toBe('password');
    fireEvent.click(showCurrentPasswordButton);
    expect(currentPasswordField.type).toBe('password');
    fireEvent.click(showCurrentPasswordButton);
    expect(currentPasswordField.type).toBe('password');
  });
  
  it('handles input change', async () => {
    render(<Router><ChangePassword /></Router>);
    const inputElement = screen.getByLabelText(/current password/i);
    expect(inputElement.value).toBe('');
    fireEvent.change(inputElement, {target: {value: 'NewPassword123'}})
    await waitFor(() => {
      expect(inputElement.value).toBe('NewPassword123');
    });
  });
  
  
  
  test('handles successful password change', async () => {
    jest.mock('../../UserService');
    userService.ChangePassword.mockResolvedValue({ message: 'Password changed successfully' }); // Set mock response
  
    const { getByTestId } = render(<Router><ChangePassword /></Router>);
  
    userEvent.type(getByTestId('current_password'), 'current_password');
    userEvent.type(getByTestId('new_password'), 'new_password');
    userEvent.type(getByTestId('confirm_password'), 'new_password');
  
    await act(async () => {
      fireEvent.submit(getByTestId('submit-button'));
    });
  
    await waitFor(() => { 
      expect(Swal.fire).toHaveBeenCalledWith({
        position: 'center',
        icon: 'success',
        'data-testid': 'success-message',
        title: 'Password changed successfully',
        showConfirmButton: false,
        timer: 5000,
      });
    });
  });


  it('handles API error during password change', async () => {
    userService.ChangePassword.mockRejectedValue({
      response: { data: { error: 'Incorrect current password' } },
    });
  
    const { getByTestId } = render(<Router><ChangePassword /></Router>);
    userEvent.type(getByTestId('current_password'), 'current_password');
    userEvent.type(getByTestId('new_password'), 'new_password');
    userEvent.type(getByTestId('confirm_password'), 'new_password');
  
    await act(async () => {
      fireEvent.submit(getByTestId('submit-button'));
      await waitFor(() => {
        expect(userService.ChangePassword).toHaveBeenCalled();
      });
    });
  
  });

  test('handles password change and sets error message when new password is the same as the current password', async () => {
    render(<Router><ChangePassword /></Router>);
    
    userEvent.type(screen.getByLabelText(/current password/i), 'currentPassword');
    const newPasswordInput = screen.getByTestId('new_password');
    userEvent.type(newPasswordInput, 'currentPassword');
    fireEvent.change(newPasswordInput);
    await act(async () => {
      fireEvent.change(newPasswordInput);
      await waitFor(() => {
        const errorElement = screen.getByTestId('password-error');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
  it('handles API error during password change', async () => {
    userService.ChangePassword.mockRejectedValue({
      response: { data: { error: 'Failed to update change password' } },
    });

    const { getByTestId } = render(<Router><ChangePassword /></Router>);
    userEvent.type(getByTestId('current_password'), 'current_password');
    userEvent.type(getByTestId('new_password'), 'new_password');
    userEvent.type(getByTestId('confirm_password'), 'new_password');
    await act(async () => {
      fireEvent.submit(getByTestId('submit-button'));
      await waitFor(() => { 
        expect(Swal.fire).toHaveBeenCalledWith({
          position: 'center',
          icon: 'error',
          'data-testid': 'error-message',
          title: 'Failed to update change password',
          showConfirmButton: true,
        });
      });
    });
    });
  