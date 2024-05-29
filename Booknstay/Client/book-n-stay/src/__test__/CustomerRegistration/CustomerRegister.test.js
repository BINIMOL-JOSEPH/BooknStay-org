import React from 'react';
import { act } from 'react-dom/test-utils'; 
import { render, screen, waitFor,fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom'; 
import userEvent from '@testing-library/user-event';
import { userService } from '../../UserService';
import Swal from 'sweetalert2';
import CustomerRegistration,{validatePassword} from '../../components/CustomerRegistration/CustomerRegistration';
import { toast } from 'react-toastify';

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));
jest.setTimeout(20000);
const formData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'johndoe@example.com',
};
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));
jest.setTimeout(20000);

beforeEach(() => {
  jest.clearAllMocks();
});
describe('CustomerRegistration', () => {
  it('renders registration form and handles form submission', async () => {
    render(
      <Router>
        <CustomerRegistration />
      </Router>
    );

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

    userEvent.type(firstNameInput, 'John');
    userEvent.type(lastNameInput, 'Doe');
    userEvent.type(emailInput, 'john.doe@example.com');
    userEvent.type(phoneNumberInput, '1234567890');
    userEvent.type(passwordInput, 'Password123!');
    userEvent.type(confirmPasswordInput, 'Password123!');
    await waitFor(() => {
    });
  });

  it('toggles the showConfirmPassword state', () => {
    render(
      <Router>
        <CustomerRegistration />
      </Router>
    );
    const showConfirmPasswordButton = screen.getByTestId('password-toggle-confirm');   
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    expect(confirmPasswordInput.type).toBe('password');
    userEvent.click(showConfirmPasswordButton);
    expect(confirmPasswordInput.type).toBe('text');
  });

  it('displays error message for invalid last name - length out of range', async () => {
    render(
      <Router>
        <CustomerRegistration />
      </Router>
    );

    const lastNameInput = screen.getByLabelText(/Last Name/i);
    userEvent.type(lastNameInput, 'D');
    userEvent.clear(lastNameInput);
    userEvent.type(lastNameInput, 'ThisIsAReallyLongLastNameThatIsMoreThanFiftyCharacters');

  });

  it('displays error message for invalid last name - contains numbers', async () => {
    render(
      <Router>
        <CustomerRegistration />
      </Router>
    );
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    userEvent.type(lastNameInput, 'Doe123');
  });


  it('displays error message for missing phone number', async () => {
    render(
      <Router>
        <CustomerRegistration />
      </Router>
    );
    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    userEvent.clear(phoneNumberInput);
  });

  it('displays error message for invalid characters in phone number', async () => {
    render(
      <Router>
        <CustomerRegistration />
      </Router>
    );

    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    userEvent.type(phoneNumberInput, 'Invalid123');
  });

  it('displays error message for "Please enter your phone number."', async () => {
    render(
      <Router>
        <CustomerRegistration />
      </Router>
    );
    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    userEvent.clear(phoneNumberInput);
   
  });

it('disables submit button while submitting', async () => {
  render(      <Router>
    <CustomerRegistration />
  </Router>);
  const submitButton = screen.getByRole('button', { name: /Sign Up/i });
  fireEvent.submit(screen.getByRole('form'));
  expect(submitButton).toBeDisabled();
  jest.advanceTimersByTime(0);
  await waitFor(() => {});
  render(      <Router>
    <CustomerRegistration />
  </Router>);
  expect(submitButton).toBeDisabled();
});

  it('submits the form and shows success message', async () => {
    render(
      <Router>
        <CustomerRegistration />
      </Router>
    );
    screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.submit(screen.getByRole('form'));
    jest.spyOn(userService, 'CustomerRegistration').mockResolvedValueOnce();
    await act(async () => {
      fireEvent.submit(screen.getByRole('form'));
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith({
          position: 'center',
          icon: 'success',
          title: 'Registration Successful. Verification email has been sent to the registered email.',
          showConfirmButton: false,
          timer: 5000,
        });
      });
    });
  });

it('should show validation error for invalid email', async () => {
  render(      <Router>
    <CustomerRegistration />
  </Router>);
  
  const emailInput = screen.getByLabelText(/Email Address/i);
  userEvent.type(emailInput,'12');

  await waitFor(() => {
    const errorText = screen.getByText(/Enter a valid email address./i);
    expect(errorText).toBeInTheDocument();
  });

  const blankEmailName = screen.getAllByRole('textbox');
  fireEvent.change(blankEmailName[2], { target: { value: ' ' } });
  const errorMessage = screen.getByTestId('emailerror');
  expect(errorMessage).toBeInTheDocument();

});
it('should show validation error for invalid phone number', async () => {
  render(      <Router>
    <CustomerRegistration />
  </Router>);
  
  const phoneInput = screen.getByLabelText(/Phone Number/i);
  userEvent.type(phoneInput,'12');
  userEvent.type(phoneInput,'12char');
  await waitFor(() => {
    const errorText = screen.getByTestId('phone-error');
    expect(errorText).toBeInTheDocument();
  });

  const blankInput = screen.getAllByRole('textbox');
  fireEvent.change(blankInput[3], { target: { value: ' ' } });
  
});

it('display error message when first name is not entered', () => {
render(<Router>
  <CustomerRegistration />
</Router>);

const nameInput = screen.getAllByRole('textbox');
fireEvent.change(nameInput[0], { target: { value: ' ' } });
const errorMessage = screen.getByTestId('first-name-error');
expect(errorMessage).toBeInTheDocument();
});


it('should show validation error for password mismatch', async () => {
  render(      <Router>
    <CustomerRegistration />
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


it('display error message when password is not entered', () => {
  const {getByTestId} =  render(<Router> <CustomerRegistration /> </Router>);
  const password = getByTestId('password').querySelector('input');    
  fireEvent.change(password, { target: { value: 'Kochi' } }); 
  const errorMessage = screen.getByTestId('password-error');
  expect(errorMessage).toBeInTheDocument();

  fireEvent.change(password, { target: { value: ' ' } }); 
  const blankError = screen.getByText(/Please enter a password./i)
  expect(blankError).toBeInTheDocument();
});
});

it('handles emailError and displays toast error', async () => {
  render(
    <Router>
      <CustomerRegistration />
    </Router>
  );

  jest.spyOn(userService, 'CustomerRegistration').mockRejectedValueOnce({
    response: {
      data: {
        email: ['Email is already taken.'],
      },
    },
  });

  await act(async () => {
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {});
  });
  expect(toast.error).toHaveBeenCalledWith('Email is already taken.');
});
