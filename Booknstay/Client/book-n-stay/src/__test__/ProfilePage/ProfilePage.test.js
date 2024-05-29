import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import ProfilePage from '../../components/ProfilePage/ProfilePage';
import { userService } from '../../UserService';

const localStorageMock = {
    getItem: jest.fn(() => '{"user": {"userType": "customer", "first_name": "customer"}}'),
    removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

jest.mock('../../UserService', () => ({
    userService: {
        GetEditUser: jest.fn(),
    },
}));

describe('testing profile page components', () => {

    test('render profile page components', () => {
        render(
            <Router>
                <ProfilePage />
            </Router>
        );

        expect(screen.getByTestId('stack')).toBeInTheDocument();
    });

    test("fetch user details", async () => {
        const mockResponse = {
            data : [{ first_name: "customer", last_name: "customer", phone_number: "1234567890", },]
        };

        userService.GetEditUser.mockResolvedValue({mockResponse});

        render(
            <Router>
                <ProfilePage />
            </Router>
        );

        await waitFor(() => {
            expect(userService.GetEditUser).toHaveBeenCalled();

            expect(screen.getByTestId('edit-button')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('edit-button'));

            expect(screen.getByTestId('dialog')).toBeInTheDocument();

            expect(screen.getByTestId('cancelbutton')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('cancelbutton'));
        });
    });

    test('Logout and navigate to login on logout button click', async () => {
        render(
          <Router>
            <ProfilePage />
          </Router>
        );
    
        expect(screen.getByText('Logout')).toBeInTheDocument();
    
        fireEvent.click(screen.getByText('Logout'));
    
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
        
        expect(window.location.pathname).toEqual('/login');
    });
});
