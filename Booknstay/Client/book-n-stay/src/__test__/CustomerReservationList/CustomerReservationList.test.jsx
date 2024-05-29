import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { hotelService } from '../../HotelService';
import { userService } from '../../UserService';
import { axiosPrivate } from '../../interceptor';
import Swal from 'sweetalert2';
import CustomerReservationList from '../../components/CustomerReservationList/CustomerReservationList';

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

jest.mock('../../HotelService', () => ({
  hotelService: {
    ReservationList: jest.fn(),
    SortCustomerReservation: jest.fn(),
  },
}));

jest.mock('../../UserService', () => ({
  userService: {
    CancelBooking: jest.fn(),
  },
}));

jest.mock('../../interceptor', () => ({
  axiosPrivate: {
    get: jest.fn(),
  },
}));

jest.setTimeout(20000);

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ListCustomerBookings', () => {
  it('renders the page with data correctly', async () => {
    jest.spyOn(hotelService, 'ReservationList').mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            guest_name: 'John',
            address: 'adbcs',
            email: 'john.doe@example.com',
            phone_number: '1234567890',
            check_in_date: '2023-01-01',
            status: 'confirmed',
            booked_at: '2023-01-02',
          },
        ],
        next: null,
        previous: null,
      },
    });

    render(<MemoryRouter><CustomerReservationList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByTestId('search-field')).toBeInTheDocument();
    });
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'No Bookings yet !';
    hotelService.ReservationList = jest.fn().mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    render(<MemoryRouter><CustomerReservationList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('fetches active hotels in invalid data format on component mount', async () => {
    jest.spyOn(hotelService, 'ReservationList').mockResolvedValue({
      data: {
        results:
        {
          id: 1,
          guest_name: 'John',
          address: 'adbcs',
          email: 'john.doe@example.com',
          phone_number: '1234567890',
          check_in_date: '2023-01-01',
          status: 'confirmed',
          booked_at: '2023-01-02',
        },

        next: null,
        previous: null,
      },
    });

    render(<MemoryRouter><CustomerReservationList /></MemoryRouter>);

    await waitFor(() => {
      expect(require('../../HotelService').hotelService.ReservationList).toHaveBeenCalled();
    });
  });

  it('handles previous button click', async () => {
    const mockedResponse = {
      results: [
        { id: 1, guest_name: 'John', address: 'adbcs', email: 'john.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02' },
        { id: 2, guest_name: 'Tom', address: 'adbcs', email: 'tom.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02', },
        { id: 3, guest_name: 'anu', address: 'adbcs', email: 'anu.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02', },
        { id: 4, guest_name: 'boby', address: 'adbcs', email: 'boby.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02', },
        { id: 5, guest_name: 'minu', address: 'adbcs', email: 'minu.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02', },
        { id: 6, guest_name: 'baby', address: 'adbcs', email: 'baby.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02', },
      ],
      next: '/api/next-page',
      previous: '/api/prev-page',
    };

    hotelService.ReservationList.mockResolvedValue({
      data: mockedResponse,
    });

    axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });

    render(<MemoryRouter><CustomerReservationList /></MemoryRouter>);

    await waitFor(async () => {
      expect(screen.getByTestId('navigate-stack')).toBeInTheDocument();
      const previousButton = await screen.findByTestId('previous');
      expect(previousButton).toBeInTheDocument();
      fireEvent.click(previousButton);
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(axiosPrivate.get).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(axiosPrivate.get).toHaveBeenCalledWith('/api/prev-page');
    });
  });

  it('handles next button click', async () => {
    const mockedResponse = {
      results: [
        { id: 1, guest_name: 'John', address: 'adbcs', email: 'john.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02' },
        { id: 2, guest_name: 'Tom', address: 'adbcs', email: 'tom.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02', },
        { id: 3, guest_name: 'anu', address: 'adbcs', email: 'anu.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'cancelled', booked_at: '2023-01-02', },
        { id: 4, guest_name: 'boby', address: 'adbcs', email: 'boby.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02', },
        { id: 5, guest_name: 'minu', address: 'adbcs', email: 'minu.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'in progress', booked_at: '2023-01-02', },
        { id: 6, guest_name: 'baby', address: 'adbcs', email: 'baby.doe@example.com', phone_number: '1234567890', check_in_date: '2023-01-01', status: 'confirmed', booked_at: '2023-01-02', },
      ],
      next: '/api/next-page',
      previous: '/api/prev-page',

    };

    hotelService.ReservationList.mockResolvedValue({
      data: mockedResponse,
    });

    axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });

    render(<MemoryRouter><CustomerReservationList /></MemoryRouter>);

    await waitFor(async () => {
      expect(screen.getByTestId('navigate-stack')).toBeInTheDocument();
      const nextButton = await screen.findByTestId('next');
      expect(nextButton).toBeInTheDocument();
      fireEvent.click(nextButton);
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(axiosPrivate.get).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(axiosPrivate.get).toHaveBeenCalledWith('/api/next-page');
    });
  });

  it('cancel the booking successfully', async () => {
    jest.spyOn(hotelService, 'ReservationList').mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            guest_name: 'John',
            address: 'adbcs',
            email: 'john.doe@example.com',
            phone_number: '1234567890',
            check_in_date: '2023-01-01',
            status: 'in progress',
            booked_at: '2023-01-02',
          },
        ],
        next: null,
        previous: null,
      },
    });

    userService.CancelBooking.mockResolvedValueOnce({
      data: {
        message: 'success'
      },
    });

    render(<MemoryRouter><CustomerReservationList /></MemoryRouter>);

    await waitFor(() => {

      expect(screen.getByTestId('detail-card')).toBeInTheDocument();

      const cancelButton = screen.getByTestId('cancel');
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton);

      const dialogBox = screen.getByTestId('dialog');
      expect(dialogBox).toBeInTheDocument();

    });

    await act(async () => {
      const confirmButton = screen.getByTestId('confirmbutton');
      expect(confirmButton).toBeInTheDocument();
      fireEvent.click(confirmButton);

      expect(userService.CancelBooking).toHaveBeenCalled();

      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith({
          position: 'center',
          icon: 'success',
          title: 'Booking cancelled successfully',
          showConfirmButton: false,
          timer: 2000,
        });
      });
    });
  });

  it('renders and click close button in dialog box', async () => {
    jest.spyOn(hotelService, 'ReservationList').mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            guest_name: 'John',
            address: 'adbcs',
            email: 'john.doe@example.com',
            phone_number: '1234567890',
            check_in_date: '2023-01-01',
            status: 'in progress',
            booked_at: '2023-01-02',
          },
        ],
        next: null,
        previous: null,
      },
    });

    userService.CancelBooking.mockResolvedValueOnce({
      data: {
        message: 'success'
      },
    });

    render(<MemoryRouter><CustomerReservationList /></MemoryRouter>);

    await waitFor(() => {

      expect(screen.getByTestId('detail-card')).toBeInTheDocument();

      const cancelButton = screen.getByTestId('cancel');
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton);

      const dialogBox = screen.getByTestId('dialog');
      expect(dialogBox).toBeInTheDocument();

      const closeButton = screen.getByTestId('closebutton');
      expect(closeButton).toBeInTheDocument();
      fireEvent.click(closeButton);
    });
  });
});