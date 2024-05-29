import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import Swal from 'sweetalert2';
import { act } from 'react-dom/test-utils';
import AddSupervisor from '../../components/AddSupervisor/AddSupervisor';
import { adminServices } from '../../AdminService';


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

jest.setTimeout(20000);
  
beforeEach(() => {
    jest.clearAllMocks();
});
  
describe('testing add supervisor components', () => {
    
    test('render add supervisor components', () => {
        render(
            <Router>
                <AddSupervisor/>
            </Router>
        );

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email Address/i);   
        const submitButton = screen.getByRole('button', { name: /Create/i });

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
    });

    test('show error message for blank name field', async() => {
        render(
            <Router>
                <AddSupervisor/>
            </Router>
        );

        const blankName = screen.getAllByRole('textbox');
        fireEvent.change(blankName[0], { target: { value: ' ' } });
        const errorMessage = screen.getByText(/Please fill this field./i);
        
        expect(errorMessage).toBeInTheDocument();
    });

    test('show error message for invalid email', async () => {
        render(
            <Router>
                <AddSupervisor/>
            </Router>
        );

        const emailInput = screen.getByLabelText(/Email Address/i);
        userEvent.type(emailInput,'12');
    
        await waitFor(() => {
          const errorText = screen.getByText(/Enter a valid email address./i);
          expect(errorText).toBeInTheDocument();
        });
    });

    test('toggles the showPassword state', () => {
        render(
          <Router>
            <AddSupervisor />
          </Router>
        );
        const showPasswordButton = screen.getByTestId('password-toggle');   
        const passwordInput = screen.getByTestId('password');
        userEvent.click(showPasswordButton);
        expect(passwordInput.type).not.toBe('password');
    });


    test('shows error message when form submission fails', async () => {
      jest.spyOn(adminServices, 'CreateSupervisor').mockRejectedValueOnce({
        response: {
          data: {
            message: 'Failed to create supervisor',
          },
        },
      });
    
      render(
        <Router>
          <AddSupervisor />
        </Router>
      );
    
      const submitButton = screen.getByRole('button', { name: /Create/i });
      expect(submitButton).toBeInTheDocument();
    
      const formData = {
        first_name: 'John',
        email: 'john@example.com',
        password: 'Password@123',
      };
    
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: formData.first_name } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: formData.email } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: formData.password } });
    
      await act(async () => {
        fireEvent.submit(screen.getByTestId('form-submit'));
        await waitFor(() => {
          expect(adminServices.CreateSupervisor).toHaveBeenCalledWith(formData);
          expect(Swal.fire).toHaveBeenCalledWith({
            position: 'top',
            icon: 'error',
            title: 'Failed to create supervisor',
            showConfirmButton: false,
            timer: 3000,
          });
        });
      });
    });

    test('shows success message when form submission passes', async () => {
      jest.spyOn(adminServices, 'CreateSupervisor').mockResolvedValue({
          data: {
            message: 'Supervisor created successfully',
          },
      });
    
      render(
        <Router>
          <AddSupervisor />
        </Router>
      );
    
      const submitButton = screen.getByRole('button', { name: /Create/i });
      expect(submitButton).toBeInTheDocument();
    
      const formData = {
        first_name: 'John',
        email: 'john@example.com',
        password: 'Password@123',
      };
    
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: formData.first_name } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: formData.email } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: formData.password } });
    
      await act(async () => {
        fireEvent.submit(screen.getByTestId('form-submit'));
        await waitFor(() => {
          expect(adminServices.CreateSupervisor).toHaveBeenCalledWith(formData);
          expect(Swal.fire).toHaveBeenCalledWith({
            position: 'top',
            icon: 'success',
            title: 'Supervisor created successfully',
            showConfirmButton: false,
            timer: 3000,
          });
        });
      });
    });
});
