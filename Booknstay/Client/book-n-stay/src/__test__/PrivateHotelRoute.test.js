import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivateHotelRoute from '../components/PrivateHotelRoutePath';

const mockLocalStorage = {
  getItem: jest.fn(),
};
jest.spyOn(global, 'localStorage', 'get').mockImplementation(() => mockLocalStorage);

describe('PrivateHotelRoute', () => {

  it('renders the child element when user is logged in and userType is hotel', () => {
    const mockUser = {
      userType: 'hotel',
    };
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));

    const mockNavigate = jest.fn();

    render(
      <MemoryRouter>
        <PrivateHotelRoute element={<div data-testid="child-element" />} />
      </MemoryRouter>,
      { wrapper: ({ children }) => React.cloneElement(children, { navigate: mockNavigate }) }
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
