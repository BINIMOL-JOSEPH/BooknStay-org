import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavBar from '../../components/NavBar/NavBar';

describe('NavBar Component', () => {
  it('renders with the correct title', () => {
    const { getByTestId } = render(<NavBar />);
    const titleElement =  getByTestId('title')
    expect(titleElement).toBeInTheDocument();
  });

  it('renders username when user is logged in', () => {
    const mockLocalStorage = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'token') {
          return 'fakeToken';
        } else if (key === 'user') {
          return JSON.stringify({ first_name: 'John' });
        }
        return null;
      }),
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    const { getByText } = render(<NavBar />);
    const usernameElement = getByText(/John/i);
    expect(usernameElement).toBeInTheDocument();
  });

});