import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivateSupervisorRoute from '../components/PrivateSupervisorRoutePath';
const mockLocalStorage = {
  getItem: jest.fn(),
};
jest.spyOn(global, 'localStorage', 'get').mockImplementation(() => mockLocalStorage);

describe('PrivateAdminSupervisorRoute', () => {

  it('renders the child element when user is logged in and userType is hotel', () => {
    const mockUser = {
      userType: 'supervisor',
    };
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));

    const mockNavigate = jest.fn();

    render(
      <MemoryRouter>
        <PrivateSupervisorRoute element={<div data-testid="child-element" />} />
      </MemoryRouter>,
      { wrapper: ({ children }) => React.cloneElement(children, { navigate: mockNavigate }) }
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});