import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Swal from 'sweetalert2';
import { userService } from '../../UserService';
import DeleteCustomerAccount from '../../components/DeleteCustomerAccount/DeleteCustomerAccount';
jest.mock('../../UserService', () => ({
  userService: {
    DeleteCustomerAccount: jest.fn(() => Promise.resolve()),  
  },
}));

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('DeleteCustomer Component', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('handles delete success', async () => {
    render(
      <MemoryRouter initialEntries={['/delete-customer-account/']}>
        <DeleteCustomerAccount isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Delete Account')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('deletebutton'));

    await waitFor(() => {
      expect(userService.DeleteCustomerAccount).toHaveBeenCalledTimes(1);
      expect(Swal.fire).toHaveBeenCalledWith({
        position: 'success',
        icon: 'success',
        title: 'Account Deleted Successfully',
        showConfirmButton: false,
        timer: 5000,
      });
    });
  });

  it('handles delete failure', async () => {
    userService.DeleteCustomerAccount.mockRejectedValueOnce({ response: { data: { detail: 'Error Message' } } });

    render(
      <MemoryRouter initialEntries={['/delete-customer-account/']}>
        <DeleteCustomerAccount isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Delete Account')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('deletebutton'));

    await waitFor(() => {
      expect(userService.DeleteCustomerAccount).toHaveBeenCalledTimes(1);
      expect(Swal.fire).toHaveBeenCalledWith({
        position: 'top',
        icon: 'error',
        title: 'Error Message',
        showConfirmButton: false,
        timer: 5000,
      });
    });
  });
});
it('handles delete success', async () => {

  const onCloseMock = jest.fn();
  render(
    <MemoryRouter initialEntries={['/delete-customer-account/']}>
      <DeleteCustomerAccount isOpen={true} onClose={onCloseMock} />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByTestId('cancelbutton'));
  await waitFor(() => {
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
