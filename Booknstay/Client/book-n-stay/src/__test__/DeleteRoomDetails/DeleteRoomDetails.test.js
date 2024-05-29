import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import DeleteRoomDetails from '../../components/DeleteRoomDetails/DeleteRoomDetails';
import { hotelService } from '../../HotelService';
import Swal from 'sweetalert2';


jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));
jest.mock('../../HotelService', () => ({
  hotelService: {
    DeleteRoomDetails: jest.fn(() => Promise.resolve()),  
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({ roomId: 'mockedRoomId' })),
  useNavigate: jest.fn(() => jest.fn()),
}));

describe('DeleteRoomDetails Component', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

 

  it('handles delete failure', async () => {
    hotelService.DeleteRoomDetails.mockRejectedValueOnce({ response: { data: { detail: 'Error Message' } } });

    render(
      <MemoryRouter initialEntries={['/delete-room-details/123']}>
        <DeleteRoomDetails />
      </MemoryRouter>
    );
    expect(screen.getByText('Delete Room Details')).toBeInTheDocument();

    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm'));
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Error Message',
      });
    });
    expect(screen.queryByText('Cannot Delete Room Details')).not.toBeInTheDocument();
  });
});
