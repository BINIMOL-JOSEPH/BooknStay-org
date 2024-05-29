import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import DeleteRoomServices from '../../components/DeleteRoomServices/DeleteRoomServices';
import { hotelService } from '../../HotelService';
import Swal from 'sweetalert2';

jest.mock("../../HotelService", () => ({
  hotelService: {
    DeleteRoomServices: jest.fn(() => Promise.resolve()),
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

describe('Delete Room Service Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('handles delete success', async () => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ roomserviceId: '123' });

    render(
      <MemoryRouter initialEntries={['/delete-room-services/123']}>
        <DeleteRoomServices />
      </MemoryRouter>
    );

    expect(screen.getByText('Delete Room Services')).toBeInTheDocument();

    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    fireEvent.click(screen.getByText('Confirm'));
    fireEvent.click(screen.getByTestId('confirm'));
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Room Services deleted successfully',
        showConfirmButton: false,
        timer: 1000,
      });
    });
    expect(screen.queryByText('Cannot Delete Room Services')).not.toBeInTheDocument();
  });

  it('handles delete failure', async () => {
    hotelService.DeleteRoomServices.mockRejectedValueOnce({ response: { data: { detail: 'Error Message' } } });
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ roomserviceId: '456' });

    render(
      <MemoryRouter initialEntries={['/delete-room-services/456']}>
        <DeleteRoomServices />
      </MemoryRouter>
    );

    expect(screen.getByText('Delete Room Services')).toBeInTheDocument();

    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    fireEvent.click(screen.getByText('Confirm'));
    fireEvent.click(screen.getByTestId('confirm'));
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Error Message',
      });
    });
    expect(screen.queryByText('Room Services deleted successfully')).not.toBeInTheDocument();
  });
});
it('cancels the deletion and navigates to /view-room-services', async () => {
  const navigateMock = jest.fn();
  jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ roomserviceId: '789' });
  jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

  render(
    <MemoryRouter initialEntries={['/delete-room-services/789']}>
      <DeleteRoomServices />
    </MemoryRouter>
  );

  expect(screen.getByText('Delete Room Services')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('Cancel'));

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith('/view-room-services');
  });
});

