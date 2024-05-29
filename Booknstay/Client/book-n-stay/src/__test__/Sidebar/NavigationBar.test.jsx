import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

jest.setTimeout(20000);


describe('testing navigation bar components', () => {

  test('render navigation bar when menu icon is clicked', async() => {
   
    render(
      <Router>
        <NavigationBar/>
      </Router>
    );


    await waitFor(() => {
      const login= screen.getByTestId('login-button');
      expect(login).toBeInTheDocument();

      const register= screen.getByTestId('register-button');
      expect(register).toBeInTheDocument();
    });
  });

  test('successfully open pop over', async () => {

    render(
      <Router>
        <NavigationBar />
      </Router>
    );

    await act(async () => {
      const registerButton = screen.getByTestId('register-button');
      expect(registerButton).toBeInTheDocument();
      fireEvent.click(registerButton);
    });

    await waitFor(() => {
      const popover = screen.getByTestId('popover')
      expect(popover).toBeInTheDocument();

      const customer = screen.getByTestId('customer');
      fireEvent.click(customer);
      const hotel = screen.getByTestId('hotel');
      fireEvent.click(hotel);


    });
  });
});
