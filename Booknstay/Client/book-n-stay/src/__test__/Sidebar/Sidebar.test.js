import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import CollapsibleSidebar from '../../components/Sidebar/Sidebar';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { hotelService } from '../../HotelService';


beforeAll(() => {
  const localStorageMock = {
    getItem: jest.fn(() => '{"user": {"userType": "hotel", "first_name": "Test"}}'),
  };
  
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
});

jest.setTimeout(20000);

jest.mock('../../HotelService', () => ({
  hotelService: {
     DeleteHotelAccount: jest.fn(),
  },
}));

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));


describe('testing sidebar components', () => {

  test('toggles sidebar when menu icon is clicked', async() => {
   
    render(
      <Router>
        <CollapsibleSidebar/>
      </Router>
    );

    const menuIcon = screen.getByTestId('menuIcon');
    fireEvent.click(menuIcon);

    await waitFor(() => {
      const drawer= screen.getByTestId('drawer');
      expect(drawer).toBeInTheDocument();
    });
  });

  test('should close anchor element', async() => {

    render(
      <Router>
        <CollapsibleSidebar />
      </Router>
    );

    await act(async () => {
      const iconButton = screen.getByTestId('AccountCircleIcon');
      fireEvent.click(iconButton)
    });

    await waitFor(() => {
      userEvent.keyboard('{esc}');
    });
  });

  test('successfully deletes hotel account and navigates to login', async () => {
    hotelService.DeleteHotelAccount.mockResolvedValueOnce();

    render(
      <Router>
        <CollapsibleSidebar />
      </Router>
    );

    await act(async () => {
      const iconButton = screen.getByTestId('AccountCircleIcon');
      fireEvent.click(iconButton)
    });

    await act(async () => {
      const deleteAccountButton = screen.getByTestId('delete-account');
      expect(deleteAccountButton).toBeInTheDocument();
      fireEvent.click(deleteAccountButton);
    });

    await waitFor(() => {
      const dialog = screen.getByTestId('dialog')
      expect(dialog).toBeInTheDocument();

      const deleteButton = screen.getByTestId('deletebutton');
      fireEvent.click(deleteButton);

      expect(hotelService.DeleteHotelAccount).toHaveBeenCalledTimes(1);
    });
  });

  test('handles error during hotel account deletion', async () => {

    const errorMessage = 'Deletion failed!';

    hotelService.DeleteHotelAccount.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    render(
      <Router>
        <CollapsibleSidebar />
      </Router>
    );

    await act(async () => {
      const iconButton = screen.getByTestId('AccountCircleIcon');
      fireEvent.click(iconButton)
    });

    await act(async () => {
      const deleteAccountButton = screen.getByTestId('delete-account');
      expect(deleteAccountButton).toBeInTheDocument();
      fireEvent.click(deleteAccountButton);
    });

    await waitFor(() => {
      const dialog = screen.getByTestId('dialog')
      expect(dialog).toBeInTheDocument();

      const deleteButton = screen.getByTestId('deletebutton');
      fireEvent.click(deleteButton);

      expect(hotelService.DeleteHotelAccount).toHaveBeenCalled();
    });
  });
});
