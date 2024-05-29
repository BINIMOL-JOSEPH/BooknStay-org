import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Swal from 'sweetalert2';
import DeleteSuperVisor from '../../components/DeleteSuperVisor/DeleteSuperVisor';
import { adminServices } from '../../AdminService';
jest.mock("../../AdminService", () => ({
    adminServices: {
    DeleteSuperVisor: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(() => jest.fn()),
}));

describe('Delete Room supervisor Component', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('handles delete success', async () => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ supervisorId: '123' });
    render(
      <MemoryRouter initialEntries={['/delete-supervisor/123']}>
        <DeleteSuperVisor />
      </MemoryRouter>
    );

    expect(screen.getByText('Delete SuperVisor')).toBeInTheDocument();
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);
    fireEvent.click(screen.getByText('Confirm'));
    fireEvent.click(screen.getByTestId('confirm'));
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Supervisor deleted successfully',
        showConfirmButton: false,
      });
    });
  });


  it('handles delete failure', async () => {
    jest.spyOn(adminServices, 'DeleteSuperVisor').mockRejectedValueOnce(new Error('Delete failed'));
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ supervisorId: '456' });
    render(
      <MemoryRouter initialEntries={['/delete-supervisor/456']}>
        <DeleteSuperVisor />
      </MemoryRouter>
    );

    expect(screen.getByText('Delete SuperVisor')).toBeInTheDocument();
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);
    fireEvent.click(screen.getByText('Confirm'));
    fireEvent.click(screen.getByTestId('confirm'));
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while deleting supervisor.',
      });
    });
  });
});
it('cancels the deletion and navigates to /list-supervisor', async () => {
  const navigateMock = jest.fn();
  jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ supervisorId: '789' });
  jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

  render(
    <MemoryRouter initialEntries={['/delete-supervisor/789']}>
      <DeleteSuperVisor />
    </MemoryRouter>
  );

  expect(screen.getByText('Delete SuperVisor')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('Cancel'));

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith('/list-supervisor');
  });
});
