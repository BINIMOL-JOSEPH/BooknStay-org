import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import BookingRooms from '../../components/BookingRooms/BookingRooms';
import Swal from 'sweetalert2';
import { hotelService } from '../../HotelService';
import { act } from 'react-dom/test-utils'; 
import '@testing-library/jest-dom';
import { userService } from '../../UserService';

const localStorageMock = {
    getItem: jest.fn(()  => '{"user": {"userType": "customer", "first_name": "customer"}}'),
    removeItem: jest.fn(),
  };
  
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));
jest.setTimeout(20000);

beforeEach(() => {
  jest.clearAllMocks();
});


jest.mock('../../HotelService', () => ({
    hotelService: {
        BookHotelRoom : jest.fn(),
        GetCustomerBookings : jest.fn(),
        ListServicesAddedToRooms : jest.fn()
    },
  }));

  jest.mock('../../UserService', () => ({
    userService: {
      GetUserData : jest.fn(),
    },
  }));

  describe('Hotel room booking', () => {
    it('renders booking form ', async () => {
      const mockServices = [
        { additional_activites_details: { id: 1, title: 'Gym', description: 'Gym facilities for guest', price: 1200, status: 'active' } },
      ];
      const mockUserData = {first_name:'Test',last_name:'name',phone_number:'8743675764',email:'test@test.cf'}

    hotelService.ListServicesAddedToRooms.mockResolvedValue({ data: mockServices });
    userService.GetUserData.mockResolvedValue({ data: mockUserData });

      render(<Router><BookingRooms /></Router>);
  
      const guestNameInput = screen.getByLabelText(/Full Name/i);
      const addressInput = screen.getByTestId('address');
      const emailInput = screen.getByLabelText(/Email Address/i);
      const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
      const aadharNumberInput = screen.getByLabelText(/Aadhar Number/i);
  
      userEvent.type(guestNameInput, 'John');
      userEvent.type(addressInput, 'Doe');
      userEvent.type(emailInput, 'john.doe@example.com');
      userEvent.type(phoneNumberInput, '1234567890');
      userEvent.type(aadharNumberInput, '123123123123');

      await waitFor(() => {
        expect(hotelService.ListServicesAddedToRooms).toHaveBeenCalled();
      });
      expect(screen.getByText('Gym')).toBeInTheDocument();

      const checkbox = screen.getByTestId('service');
      expect(checkbox).toBeInTheDocument();
      fireEvent.click(checkbox);

      fireEvent.click(checkbox);

    });

    it('error message while selecting past dated for check in and check out', async () => {
    
      render(<Router><BookingRooms /></Router>);

      const addressInput = screen.getByTestId('address').querySelector('input');    
      fireEvent.change(addressInput, { target: { value: ' ' } });  

      await waitFor(() => {
          const addressError = screen.getByText('Please enter your address.')
          expect(addressError).toBeInTheDocument();
      });

  });

  it('error message for aadhar number validation', async () => {
    
    render(<Router><BookingRooms /></Router>);

    const aadharInput = screen.getByTestId('aadhar').querySelector('input');    
    fireEvent.change(aadharInput, { target: { value: ' ' } });  

    await waitFor(() => {
      const aadharError = screen.getByText('Please enter your aadhar number.')
      expect(aadharError).toBeInTheDocument();
    });

    fireEvent.change(aadharInput, { target: { value: 'adcfg' } });  

    await waitFor(() => {
      const aadharError = screen.getByText('Invalid characters in aadhar number. Only digits are allowed.')
      expect(aadharError).toBeInTheDocument();
    });

    fireEvent.change(aadharInput, { target: { value: '12345' } });  

    await waitFor(() => {
      const aadharError = screen.getByText('Invalid aadhar number. Must be 12 digits.')
      expect(aadharError).toBeInTheDocument();
    });
    fireEvent.change(aadharInput, { target: { value: '123456789012' } });  
  });

  it('submits the form and shows success message', async () => {
    hotelService.BookHotelRoom.mockResolvedValueOnce({
      data: {
        id: '2',
      },
    });
    hotelService.GetCustomerBookings.mockResolvedValueOnce({
      data: {
        id: '2',
        guest_name:'cust',
        check_in_date:'2025-10-10',
        check_out_date:'2025-10-13'
      },
    });

    render(<Router><BookingRooms /></Router>);

    const checkInInput = screen.getByTestId('check-in-date').querySelector('input');    
      fireEvent.change(checkInInput, { target: { value: '2025-10-10' } }); 
    const adultInput = screen.getByTestId('adults').querySelector('input');    
      fireEvent.change(adultInput, { target: { value: '2' } });  
    const childrenInput = screen.getByTestId('children').querySelector('input');    
      fireEvent.change(childrenInput, { target: { value: '2' } });  
    const roomInput = screen.getByTestId('rooms').querySelector('input');    
      fireEvent.change(roomInput, { target: { value: '2' } });  

    
    const bookButton = screen.getByRole('button', { name: /Book Now/i });
    fireEvent.click(bookButton)
    await act(async () => {
      fireEvent.submit(screen.getByTestId('form-submit'));
      expect(hotelService.BookHotelRoom).toHaveBeenCalled();
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith({
          position: 'top',
          icon: 'success',
          title: 'You Have successfully reserved the room.',
          showConfirmButton: false,
          timer: 3000,
        });
      });
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      await waitFor(()=>{
        expect(hotelService.GetCustomerBookings).toHaveBeenCalledTimes(0);
      })
    });

  });

  it('submits the form and shows error message', async () => {
    render(<Router><BookingRooms /></Router>);

    const bookButton = screen.getByRole('button', { name: /Book Now/i });
    fireEvent.click(bookButton)
    jest.spyOn(hotelService, 'BookHotelRoom').mockRejectedValueOnce({ response: { data: { message: "failed" } } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId('form-submit'));
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith({
          position: 'top',
          icon: 'error',
          title: 'Reservation Failed. Please make sure you have valid data',
          showConfirmButton: false,
          timer: 3000,
        });
      });
    });
  });

  it('renders booking form ', async () => {
    const errorMessage = {
      response : {
          data :{
              message : 'Failed to fetch added services'
          },
      },
    };
    const userDataError = {
      response : {
          data :{
              message : 'Failed to fetch user data'
          },
      },
    };

    hotelService.ListServicesAddedToRooms.mockRejectedValue(errorMessage);
    userService.GetUserData.mockRejectedValue(userDataError);

    render(<Router><BookingRooms /></Router>);

    await waitFor(() => {
      expect(hotelService.ListServicesAddedToRooms).toHaveBeenCalled();
      expect(userService.GetUserData).toHaveBeenCalled();
    });
    expect(screen.getByText('Failed to fetch added services')).toBeInTheDocument();

  });


  });
