import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import HotelRegistration, {validatePassword}from '../../components/HotelRegistration/HotelRegistration';
import Swal from 'sweetalert2';
import { hotelService } from '../../HotelService';
import { act } from 'react-dom/test-utils'; 
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));
jest.setTimeout(20000);

beforeEach(() => {
  jest.clearAllMocks();
});
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

  describe('HotelRegistration', () => {
  
    it('renders registration form', async () => {
      render(
        <Router>
          <HotelRegistration />
        </Router>
      );
  
      const hotelNameInput = screen.getByLabelText(/Hotel Name/i);
      const addressInput = screen.getByTestId(/address/i);
      const cityNameInput = screen.getByLabelText(/City Name/i);
      const districtNameInput = screen.getByLabelText(/District Name/i);
      const stateInput = screen.getByLabelText(/State Name/i);
      const pincodeInput = screen.getByLabelText(/PIN code/i);
      const descriptionInput = screen.getByLabelText(/Hotel Description/i);
      const serviceInput = screen.getByLabelText(/Service Charge/i);
      const emailInput = screen.getByLabelText(/Email Address/i);
      const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
      const passwordInput = screen.getByTestId('password');
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      expect(submitButton).toBeInTheDocument();
      
      userEvent.type(hotelNameInput, 'John');
      userEvent.type(addressInput, 'Doe');
      userEvent.type(cityNameInput, 'John');
      userEvent.type(districtNameInput, 'Doe');
      userEvent.type(stateInput, 'john');
      userEvent.type(pincodeInput, '123456');
      userEvent.type(descriptionInput, 'Password123!');
      userEvent.type(serviceInput, '123.87');
      userEvent.type(emailInput, 'john.doe@example.com');
      userEvent.type(phoneNumberInput, '1234567890');
      userEvent.type(passwordInput, 'Password123!');
      userEvent.type(confirmPasswordInput, 'Password123!');
      await waitFor(() => {
      });
    });

    it('should show validation error for invalid hotel name', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);

      const blankHotelName = screen.getAllByRole('textbox');
      fireEvent.change(blankHotelName[0], { target: { value: ' ' } });
      const errorMessage = screen.getByText(/Please enter your hotel name./i);
      expect(errorMessage).toBeInTheDocument();

    });

    it('should show validation error for invalid email', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      userEvent.type(emailInput,'12');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Enter a valid email address./i);
        expect(errorText).toBeInTheDocument();
      });

      const blankHotelName = screen.getAllByRole('textbox');
      fireEvent.change(blankHotelName[1], { target: { value: ' ' } });
      const errorMessage = screen.getByText(/Please enter an email address./i);
      expect(errorMessage).toBeInTheDocument();

    });

    it('should show validation error for invalid city', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);

      const cityInput = screen.getByLabelText(/City Name/i);
      userEvent.type(cityInput,'123');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Please enter a valid city name./i);
        expect(errorText).toBeInTheDocument();
      });

      const blankCity = screen.getAllByRole('textbox');
      fireEvent.change(blankCity[3], { target: { value: ' ' } });
      const errorMessage = screen.getByText(/Please enter your city./i);
      expect(errorMessage).toBeInTheDocument();

    });

    it('should show validation error for invalid district', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);
      
      const districtInput = screen.getByLabelText(/District Name/i);
      userEvent.type(districtInput,'123');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Please enter a valid district name./i);
        expect(errorText).toBeInTheDocument();
      });

      const blankInput = screen.getAllByRole('textbox');
      fireEvent.change(blankInput[4], { target: { value: ' ' } });
      const errorMessage = screen.getByText(/Please enter your district./i);
      expect(errorMessage).toBeInTheDocument();


    });

    it('should show validation error for invalid state', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);
      
      const stateInput = screen.getByLabelText(/State Name/i);
      userEvent.type(stateInput,'123');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Please enter a valid state name./i);
        expect(errorText).toBeInTheDocument();
      });

      const blankInput = screen.getAllByRole('textbox');
      fireEvent.change(blankInput[5], { target: { value: ' ' } });
      const errorMessage = screen.getByText(/Please enter your state./i);
      expect(errorMessage).toBeInTheDocument();

    });

    it('should show validation error for invalid phone number', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);
      
      const phoneInput = screen.getByLabelText(/Phone Number/i);
      userEvent.type(phoneInput,'12');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Invalid phone number. Must be 10 digits./i);
        expect(errorText).toBeInTheDocument();
      });

      userEvent.type(phoneInput,'12char');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Invalid characters in phone number. Only digits are allowed./i);
        expect(errorText).toBeInTheDocument();
      });

      const blankInput = screen.getAllByRole('textbox');
      fireEvent.change(blankInput[7], { target: { value: ' ' } });
      const errorMessage = screen.getByText(/Please enter your phone number./i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should show validation error for invalid pincode', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);
      
      const pincodeInput = screen.getByLabelText(/PIN code/i);
      userEvent.type(pincodeInput,'12');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Invalid pincode. Must be 6 digits./i);
        expect(errorText).toBeInTheDocument();
      });

      userEvent.type(pincodeInput,'12char');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Invalid characters in pincode. Only digits are allowed./i);
        expect(errorText).toBeInTheDocument();
      });

      const blankInput = screen.getAllByRole('textbox');
      fireEvent.change(blankInput[6], { target: { value: ' ' } });
      const errorMessage = screen.getByText(/Please enter your pincode./i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should show validation error for invalid license number', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);
      
      const licenseInput = screen.getByLabelText(/License Number/i);
      userEvent.type(licenseInput,'12-char-986');
  
      await waitFor(() => {
        const errorText = screen.getByTestId('license-error')
        expect(errorText).toBeInTheDocument();
      });

      const blankInput = screen.getAllByRole('textbox');
      fireEvent.change(blankInput[8], { target: { value: ' ' } });
      const errorMessage =  screen.getByTestId('license-error')
      expect(errorMessage).toBeInTheDocument();
    });

    it('should show validation error for invalid service charge', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);
      
      const serviceInput = screen.getByLabelText(/Service Charge/i);
      userEvent.type(serviceInput,'12.');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Rate should be numeric value with atmost 2 decimal place./i);
        expect(errorText).toBeInTheDocument();
      });

      const blankInput = screen.getAllByRole('textbox');
      fireEvent.change(blankInput[10], { target: { value: ' ' } });
      const errorMessage = screen.getByText(/Please enter the rate./i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('should show validation error for password mismatch', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);
      
      const passwordInput = screen.getByTestId('password');
      userEvent.type(passwordInput,'Testpswd@123');

      const cpasswordInput = screen.getByLabelText(/Confirm Password/i);
      userEvent.type(cpasswordInput,'Test');
  
      await waitFor(() => {
        const errorText = screen.getByText(/Password and Confirm Password do not match./i);
        expect(errorText).toBeInTheDocument();
      });
    });

    it('toggles the showConfirmPassword state', () => {
      render(
        <Router>
          <HotelRegistration />
        </Router>
      );
      const showConfirmPasswordButton = screen.getByTestId('password-toggle-confirm');   
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      userEvent.click(showConfirmPasswordButton);
      expect(confirmPasswordInput.type).toBe('text');
    });

    it('toggles the showPassword state', () => {
      render(
        <Router>
          <HotelRegistration />
        </Router>
      );
      const showPasswordButton = screen.getByTestId('password-toggle');   
      const passwordInput = screen.getByTestId('password');
      userEvent.click(showPasswordButton);
      expect(passwordInput.type).not.toBe('password');
    });

    it('disables submit button while submitting', async () => {
      render(<Router>
        <HotelRegistration />
      </Router>);
      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      fireEvent.submit(screen.getByTestId('form-submit'));
      expect(submitButton).toBeDisabled();
      jest.advanceTimersByTime(0);
      await waitFor(() => {});
      render(<Router>
        <HotelRegistration />
      </Router>);
      expect(submitButton).toBeDisabled();
    });
    
    it('submits the form and shows success message', async () => {
      render(
        <Router>
          <HotelRegistration />
        </Router>
      );
      const submitButton = screen.getByRole('button', { name: /Sign Up/i });
      expect(submitButton).toBeInTheDocument();
      fireEvent.submit(screen.getByTestId('form-submit'));
      jest.spyOn(hotelService, 'HotelRegistration').mockResolvedValueOnce();
      await act(async () => {
        fireEvent.submit(screen.getByTestId('form-submit'));
        await waitFor(() => {
          expect(Swal.fire).toHaveBeenCalledWith({
            position: 'top',
            icon: 'success',
            title: 'Registartion Successfull, Wait for mail to confirm the approval from Admin',
            showConfirmButton: false,
            timer: 5000,
          });
        });
      });
    });

  it('display error message when address is not entered', () => {
    render(<Router>
      <HotelRegistration />
    </Router>);
  
    const addressInput = screen.getAllByRole('textbox');
    fireEvent.change(addressInput[2], { target: { value: ' ' } });
    const errorMessage = screen.getByText(/Please enter your address./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('display error message when description is not entered', () => {
    render(<Router>
      <HotelRegistration />
    </Router>);
  
    const descriptionInput = screen.getAllByRole('textbox');
    fireEvent.change(descriptionInput[9], { target: { value: ' ' } });
    const errorMessage = screen.getByText(/Please enter hotel description./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('display error message when password is not entered', () => {
      const {getByTestId} =  render(<Router> <HotelRegistration /> </Router>);
      const password = getByTestId('password').querySelector('input');    
      fireEvent.change(password, { target: { value: 'Kochi' } }); 
      const errorMessage = screen.getByTestId('password-error');
      expect(errorMessage).toBeInTheDocument();
  
      fireEvent.change(password, { target: { value: ' ' } }); 
      const blankError = screen.getByText(/Please enter a password./i)
      expect(blankError).toBeInTheDocument();
  });
  
  it('display error message when link is not entered', () => {
      render(<Router>
          <HotelRegistration />
        </Router>);
      
      const addressInput = screen.getAllByRole('textbox');
      fireEvent.change(addressInput[11], { target: { value: ' ' } });
      const errorMessage = screen.getByText(/Please enter the location link./i);
      expect(errorMessage).toBeInTheDocument();
        
      fireEvent.change(addressInput[11], { target: { value: 'dfdsg' } });
      const invalidError = screen.getByText(/Please provide valid url/i);
      expect(invalidError).toBeInTheDocument();
  });
   
});

it('handles registration failure with email and license error messages', async () => {
  render(
    <Router>
      <HotelRegistration />
    </Router>
  );

  const submitButton = screen.getByRole('button', { name: /Sign Up/i });
  fireEvent.submit(screen.getByTestId('form-submit'));

  jest.spyOn(hotelService, 'HotelRegistration').mockRejectedValueOnce({
    response: {
      data: {
        email: ['Email is already taken.'],
      },
    },
  });

  await act(async () => {
    fireEvent.submit(screen.getByTestId('form-submit'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email is already taken.');
    });
  });
});

it('handles registration failure with email and license error messages', async () => {
  render(
    <Router>
      <HotelRegistration />
    </Router>
  );

  const submitButton = screen.getByRole('button', { name: /Sign Up/i });
  fireEvent.submit(screen.getByTestId('form-submit'));

  jest.spyOn(hotelService, 'HotelRegistration').mockRejectedValueOnce({
    response: {
      data: {
        license_number: ['License number is invalid.'],
      },
    },
  });

  await act(async () => {
    fireEvent.submit(screen.getByTestId('form-submit'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('License number is invalid.');
    });
  });
});
