import React from 'react';
import { render, waitFor, fireEvent, screen, getByText } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewRoomDetails from '../../components/ViewRoomDetails/ViewRoomDetails';
import { hotelService } from '../../HotelService';
import { BrowserRouter as Router } from 'react-router-dom';

const localStorageMock = {
  getItem: jest.fn(() => '{"user": {"userType": "admin", "first_name": "admin"}}'),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../components/Loading/Loading', () => ({
  __esModule: true,
  default: jest.fn(() => 'Loading component mock'),
}));

jest.mock('../../HotelService', () => ({
  hotelService: {
    ListHotelRoomDetails: jest.fn(() => Promise.reject(new Error('API Error'))),
    ListHotelRoomDetails: jest.fn(() =>
      Promise.resolve({
        data: {
          next: 'fakeNext',
          previous: 'fakePrevious',
          results: [
            {
              id: 1,
              room_type_name: 'Single',
              number_of_rooms: 10,
              rate: '100.00',
              room_facilities: 'WiFi',
              available_rooms: 10,
              booked_rooms: 0,
              status: 'active',
              image1: 'fakeImage1',
              image2: 'fakeImage2',
              image3: 'fakeImage3',
            },
          ],
        },
      })
    ),
  },
}));

describe('HotelRoomDetails', () => {
 
  it('renders room details after loading', async () => {
    const { getByText, getByTestId } = render(<Router><ViewRoomDetails /></Router>);
    await waitFor(() => {});

    expect(getByText('Single')).toBeInTheDocument();
    expect(getByText('Number of Rooms: 10')).toBeInTheDocument();
    expect(getByText('Rate: $100.00')).toBeInTheDocument();
    expect(getByText('Facilities: WiFi')).toBeInTheDocument();
    expect(getByTestId('navigate-stack')).toBeInTheDocument();

    expect(getByTestId('view-service')).toBeInTheDocument();
    fireEvent.click(getByTestId('view-service'));

    await waitFor(()=>{
      expect(getByTestId('dialog')).toBeInTheDocument();
    })
  });

  it('handles next button clicks', async () => {
    const { getByTestId } = render(<Router><ViewRoomDetails /></Router>);
    await waitFor(() => {});

    const axiosPrivateGetMock = jest.spyOn(require('../../interceptor').axiosPrivate, 'get');
    axiosPrivateGetMock.mockResolvedValueOnce({
      data: {
        next: null,
        previous: null,
        results: [
          {
            id: 2,
            room_type_name: 'Double',
            number_of_rooms: 20,
            rate: '150.00',
            room_facilities: 'AC',
            available_rooms: 20,
            booked_rooms: 0,
            image1: 'fakeImage2',
          },
        ],
      },
    });

    fireEvent.click(getByTestId('next'));

    expect(axiosPrivateGetMock).toHaveBeenCalledWith('fakeNext');

    await waitFor(() => {});

    expect(getByTestId('navigate-stack')).toBeInTheDocument();
    expect(getByTestId('total-rooms')).toBeInTheDocument();
    expect(getByTestId('rate')).toBeInTheDocument();
    expect(getByTestId('facilities')).toBeInTheDocument();
  });

  it('handles error in previous button click', async () => {
    const { getByTestId } = render(<Router><ViewRoomDetails /></Router>);

    await waitFor(() => {
      expect(hotelService.ListHotelRoomDetails).toHaveBeenCalled();
    });

    fireEvent.click(getByTestId('previous'));
  });

  it('handles error in next button click', async () => {
    const { getByTestId } = render(<Router><ViewRoomDetails /></Router>);

    await waitFor(() => {
      expect(hotelService.ListHotelRoomDetails).toHaveBeenCalled();
    });

    const axiosPrivateGetMock = jest.spyOn(require('../../interceptor').axiosPrivate, 'get');
    axiosPrivateGetMock.mockRejectedValueOnce(new Error('API Error'));
    fireEvent.click(getByTestId('next'));
  });

  it('handles  previous button clicks', async () => {
    const { getByTestId } = render(<Router><ViewRoomDetails /></Router>);
    await waitFor(() => {});

    const axiosPrivateGetMock = jest.spyOn(require('../../interceptor').axiosPrivate, 'get');
    axiosPrivateGetMock.mockResolvedValueOnce({
      data: {
        next: null,
        previous: null,
        results: [
          {
            id: 2,
            room_type_name: 'Double',
            number_of_rooms: 20,
            rate: '150.00',
            room_facilities: 'AC',
            available_rooms: 20,
            booked_rooms: 0,
            image1: 'fakeImage2',
          },
        ],
        },
      },
    )
    fireEvent.click(getByTestId('previous'));
    expect(axiosPrivateGetMock).toHaveBeenCalledWith('fakePrevious');
    await waitFor(() => {});
    expect(getByTestId('navigate-stack')).toBeInTheDocument();
    expect(getByTestId('total-rooms')).toBeInTheDocument();
    expect(getByTestId('rate')).toBeInTheDocument();
    expect(getByTestId('facilities')).toBeInTheDocument();
});


it('should navigate to edit-room-details with the correct roomId', async () => {
  const roomId = 1;
  const { getByTestId } = render(<Router><ViewRoomDetails /></Router>);
  await waitFor(() => expect(getByTestId('total-rooms')).toBeInTheDocument());
  fireEvent.click(getByTestId('edit'));
  expect(mockNavigate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith(`/edit-room-details/${roomId}`);
});
it('should navigate to add-room-details =', async () => {
  const { getByTestId } = render(<Router><ViewRoomDetails /></Router>);
  await waitFor(() => expect(getByTestId('total-rooms')).toBeInTheDocument());
  fireEvent.click(getByTestId('add'));
  expect(mockNavigate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith(`/room-details/`);
});
it('should navigate to delete-room-details with the correct roomId', async () => {
  const roomId = 1;
  const { getByTestId } = render(<Router><ViewRoomDetails /></Router>);
  await waitFor(() => expect(getByTestId('total-rooms')).toBeInTheDocument());
  fireEvent.click(getByTestId('delete'));
  expect(mockNavigate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith(`/delete-room-details/${roomId}`);
});

it('add services to the room', async () => {
  const roomId = 1;
  const { getByTestId } = render(<Router><ViewRoomDetails /></Router>);
  await waitFor(() => expect(getByTestId('total-rooms')).toBeInTheDocument());
  fireEvent.click(getByTestId('view-more'));
  await waitFor(()=>{
    expect(getByTestId('dialog')).toBeInTheDocument();
  })
});

});
