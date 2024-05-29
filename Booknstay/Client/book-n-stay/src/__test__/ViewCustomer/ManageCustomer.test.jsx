import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import ManageResource from '../../components/ViewCustomer/ManageResource';

jest.mock('../../AdminService', () => ({
  adminServices: {
    ActivateCustomer: jest.fn(() => Promise.resolve()), 
  },
}));
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

it("should handle 'activate' action successfully", async () => {
  const navigateMock = jest.fn();
  require('react-router-dom').useNavigate.mockReturnValue(navigateMock);

  const { getByTestId } = render(
    <MemoryRouter initialEntries={["/resource/customer/123"]}>
      <Routes>
        <Route path="/resource/:resourceType/:resource_id" element={<ManageResource />} />
      </Routes>
    </MemoryRouter>
  );

  fireEvent.click(getByTestId('confirm'));
});
