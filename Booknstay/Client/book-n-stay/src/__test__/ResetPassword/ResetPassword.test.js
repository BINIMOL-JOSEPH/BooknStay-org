import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPassword from '../../components/ResetPassword/ResetPassword';
import { userService } from '../../UserService';
import Swal from 'sweetalert2';

jest.mock('../../UserService'); 
jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
  }));
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
  }));
describe('ResetPassword component', () => {
const token = 'mockToken';

beforeEach(() => {
userService.CheckTokenExpired.mockResolvedValue({ data: { isExpired: false } });
});

test('renders the component correctly', async () => {
render(
<MemoryRouter initialEntries={[`/resetpassword/${token}`]}>
<Routes>
<Route path="/resetpassword/:token" element={<ResetPassword />} />
</Routes>
</MemoryRouter>
);

expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
expect(screen.getByTestId('new_password')).toBeInTheDocument();
expect(screen.getByTestId('confirm_password')).toBeInTheDocument();
expect(screen.getByTestId('reset-password')).toBeInTheDocument();
});

test('handles expired link correctly', async () => {
userService.CheckTokenExpired.mockResolvedValue({ data: { isExpired: true } });

render(
<MemoryRouter initialEntries={[`/resetpassword/${token}`]}>
<Routes>
<Route path="/resetpassword/:token" element={<ResetPassword />} />
</Routes>
</MemoryRouter>
);

await waitFor(() => {
expect(screen.getByText(/Password Reset Link Expired/i)).toBeInTheDocument();
});
});

test('toggles password visibility', () => {
render(
<MemoryRouter>
<ResetPassword token={token} />
</MemoryRouter>
);
const passwordToggle = screen.getByTestId('password-toggle');
fireEvent.click(passwordToggle);
const passwordInput = screen.getByTestId('new_password');
expect(passwordInput)
fireEvent.click(passwordToggle);
expect(passwordInput)
});

test('toggles confirm password visibility', () => {
render(
<MemoryRouter>
<ResetPassword token={token} />
</MemoryRouter>
);
const passwordToggle = screen.getByTestId('password-toggle-confirm');
fireEvent.click(passwordToggle);
const confirmPasswordInput = screen.getByTestId('confirm_password');
console.log('Confirm Password Input:', confirmPasswordInput);
expect(confirmPasswordInput).not.toBeNull();
expect(confirmPasswordInput)
fireEvent.click(passwordToggle);
expect(confirmPasswordInput)
});
test('handles reset password correctly', async () => {
  const resetPasswordMock = jest.spyOn(userService, 'ResetPassword').mockResolvedValue({});

  render(
    <MemoryRouter initialEntries={[`/resetpassword/${token}`]}>
      <Routes>
        <Route path="/resetpassword/:token" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByTestId('new_password').querySelector('input'), { target: { value: 'newPassword123' } });
  fireEvent.change(screen.getByTestId('confirm_password').querySelector('input'), { target: { value: 'newPassword123' } });
  fireEvent.submit(screen.getByTestId('reset-password'));

  await waitFor(() => {
    expect(resetPasswordMock).toHaveBeenCalledWith(token, {
      new_password: 'newPassword123',
      confirm_password: 'newPassword123',
    });
  });
});



test('handles reset password failure and shows error message', async () => {
  const resetPasswordMock = jest.spyOn(userService, 'ResetPassword').mockRejectedValueOnce({});

  render(
    <MemoryRouter initialEntries={[`/resetpassword/${token}`]}>
      <Routes>
        <Route path="/resetpassword/:token" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByTestId('new_password').querySelector('input'), { target: { value: 'newPassword123' } });
  fireEvent.change(screen.getByTestId('confirm_password').querySelector('input'), { target: { value: 'newPassword123' } });
  fireEvent.submit(screen.getByTestId('reset-password'));

  await waitFor(() => {
    expect(resetPasswordMock).toHaveBeenCalledWith(token, {
      new_password: 'newPassword123',
      confirm_password: 'newPassword123',
    });

    expect(Swal.fire).toHaveBeenCalledWith({
      position: 'center',
      icon: 'error',
      title: 'Password reset failed. Please try again.',
      showConfirmButton: true,
    });
  });
});
});