import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { hotelService } from '../../HotelService';
import ViewRoomServices from '../../components/ViewRoomServices/ViewRoomServices';



const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('../../HotelService', () => ({
  hotelService: {
    ListRoomServices: jest.fn(() => Promise.reject(new Error('API Error'))),
    ListRoomServices: jest.fn(() =>
      Promise.resolve({
        data: {
          next: 'fakeNext',
          previous: 'fakePrevious',
          results: [
            {
              id: 1,
              title: 'gym',
              description: "ffdgdfg",
              price: '100.00',
              status: 'active'
            },
          ],
        },
      })
    ),
  },
}));
describe('Room Services', () => {

});
it('handles next button clicks', async () => {
    const { getByTestId } = render(<Router><ViewRoomServices /></Router>);
    await waitFor(() => {});

    const axiosPrivateGetMock = jest.spyOn(require('../../interceptor').axiosPrivate, 'get');
    axiosPrivateGetMock.mockResolvedValueOnce({
      data: {
        next: null,
        previous: null,
        results: [
            {
              id: 2,
              title: 'breakfast',
              description: "ffdgdfg",
              price: '100.00',
            },
          ],
        },
      },
    )

    fireEvent.click(getByTestId('next'));

    expect(axiosPrivateGetMock).toHaveBeenCalledWith('fakeNext');

    await waitFor(() => {});

    expect(getByTestId('title')).toBeInTheDocument();
    expect(getByTestId('description')).toBeInTheDocument();
    expect(getByTestId('price')).toBeInTheDocument();
  });
it('handles next button clicks', async () => {
    const { getByTestId } = render(<Router><ViewRoomServices /></Router>);
    await waitFor(() => {});

    const axiosPrivateGetMock = jest.spyOn(require('../../interceptor').axiosPrivate, 'get');
    axiosPrivateGetMock.mockResolvedValueOnce({
      data: {
        next: null,
        previous: null,
        results: [
            {
              id: 2,
              title: 'breakfast',
              description: "ffdgdfg",
              price: '100.00',
            },
          ],
        },
      },
    )

    fireEvent.click(getByTestId('next'));

    expect(axiosPrivateGetMock).toHaveBeenCalledWith('fakeNext');

    await waitFor(() => {});

    expect(getByTestId('title')).toBeInTheDocument();
    expect(getByTestId('description')).toBeInTheDocument();
    expect(getByTestId('price')).toBeInTheDocument();
  });
  it('handles  previous button clicks', async () => {
    const { getByTestId } = render(<Router><ViewRoomServices /></Router>);
    await waitFor(() => {});

    const axiosPrivateGetMock = jest.spyOn(require('../../interceptor').axiosPrivate, 'get');
    axiosPrivateGetMock.mockResolvedValueOnce({
      data: {
        next: null,
        previous: null,
        results: [
            {
              id: 2,
              title: 'breakfast',
              description: "ffdgdfg",
              price: '100.00',
            },
          ],
        },
      },
    )
    fireEvent.click(getByTestId('previous'));
    expect(axiosPrivateGetMock).toHaveBeenCalledWith('fakePrevious');
    await waitFor(() => {});
    expect(getByTestId('title')).toBeInTheDocument();
    expect(getByTestId('description')).toBeInTheDocument();
    expect(getByTestId('price')).toBeInTheDocument();
});


 
  it('handles search input', async () => {
     render(<Router><ViewRoomServices /></Router>);
    await waitFor(() => {});
    const searchField = screen.getByPlaceholderText('Search Room Services');
    fireEvent.change(searchField, { target: { value: 'breakfast' } });
    expect(searchField.value).toBe('breakfast');
  });
  it('should navigate to edit-room-service with the correct id', async () => {
    const serviceId = 1;
    const { getByTestId } = render(<Router><ViewRoomServices /></Router>);
    await waitFor(() => {});
    expect(getByTestId('title')).toBeInTheDocument();
    expect(getByTestId('description')).toBeInTheDocument();
    expect(getByTestId('price')).toBeInTheDocument();    
    fireEvent.click(getByTestId('edit'));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/edit-room-services/${serviceId}`);
  });
  it('should navigate to add-room-services =', async () => {
    const { getByTestId } = render(<Router><ViewRoomServices /></Router>);
    await waitFor(() => {});
    expect(getByTestId('title')).toBeInTheDocument();
    expect(getByTestId('description')).toBeInTheDocument();
    expect(getByTestId('price')).toBeInTheDocument();    
    fireEvent.click(getByTestId('add'));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/add-room-services/`);
  });
  it('should navigate to delete-room-services =', async () => {
    const serviceId = 1;
    const { getByTestId } = render(<Router><ViewRoomServices /></Router>);
    await waitFor(() => {});
    expect(getByTestId('title')).toBeInTheDocument();
    expect(getByTestId('description')).toBeInTheDocument();
    expect(getByTestId('price')).toBeInTheDocument();    
    fireEvent.click(getByTestId('delete'));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/delete-room-services/${serviceId}`);
  });
    