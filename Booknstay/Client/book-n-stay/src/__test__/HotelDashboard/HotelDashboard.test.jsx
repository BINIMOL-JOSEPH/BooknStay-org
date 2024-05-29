import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import Swal from 'sweetalert2';
import { hotelService } from '../../HotelService';
import HotelDashboard from '../../components/HotelDashboard/HotelDashbard';
import ApexCharts from 'react-apexcharts';


const localStorageMock = {
    getItem: jest.fn(()  => '{"user": {"userType": "hotel", "first_name": "hotel"}}'),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));
jest.mock('react-apexcharts', () => {
    return {
      __esModule: true,
      default: () => {
        return <div />;
      },
    };
  });
  
jest.setTimeout(20000);

jest.mock('../../HotelService', () => ({
    hotelService: {
        GetHotelDetails : jest.fn(),
        GettodayHotelDetails : jest.fn(),
        GetPayementPercentage : jest.fn(),
        BookingWeeklyGraph : jest.fn(),
        RecentReview : jest.fn(),
        RoomAndServicesCount : jest.fn()
    },
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('test hotel dashboard components', () => {
    test('rendering dashboard components', () => {

        render(
            <Router>
                <HotelDashboard/>
            </Router>
        );

        const profileCard = screen.getByTestId('profile-card');
        expect(profileCard).toBeInTheDocument();
        const count = screen.getByTestId('count');
        expect(count).toBeInTheDocument();
        const booking = screen.getByTestId('todaybooking');
        expect(booking).toBeInTheDocument();
        const reviews = screen.getByTestId('reviews');
        expect(reviews).toBeInTheDocument();
        
    });

    test('navigate to edit profile page', async() => {

        render(
            <Router>
                <HotelDashboard/>
            </Router>
        );

        const editProfileButton = screen.getByTestId('edit-profile');
        expect(editProfileButton).toBeInTheDocument();

        fireEvent.click(editProfileButton);

        await waitFor(() => {
            expect(window.location.pathname).toEqual('/edit-hotel-details');
        });
    }); 

    test('navigate to booking page while clicking on booking card', async() => {

        render(
            <Router>
                <HotelDashboard/>
            </Router>
        );

        const bookingCard = screen.getByTestId('todaybooking');
        expect(bookingCard).toBeInTheDocument();

        fireEvent.click(bookingCard);

       
    });

    test('navigate to room details while clicking on rooms card', async() => {

        render(
            <Router>
                <HotelDashboard/>
            </Router>
        );

        const roomsCard = screen.getByTestId('roomsCard');
        expect(roomsCard).toBeInTheDocument();

        fireEvent.click(roomsCard);

    });

    test('navigate to services page while clicking on service card', async() => {

        render(
            <Router>
                <HotelDashboard/>
            </Router>
        );

        const servicesCard = screen.getByTestId('servicesCard');
        expect(servicesCard).toBeInTheDocument();

        fireEvent.click(servicesCard);

      
    });
});
test('fetch room services count', async () => {
    const mockRoomAndServicesCount = {
      data: {
        room_count: 5,
        service_count: 10,
      },
    };

    hotelService.RoomAndServicesCount.mockResolvedValueOnce(mockRoomAndServicesCount);

    render(
      <Router>
        <HotelDashboard />
      </Router>
    );

    await waitFor(() => {
      expect(hotelService.RoomAndServicesCount).toHaveBeenCalled();
    });

    const roomCountElement = screen.getByText(/Rooms Available/i);
    expect(roomCountElement).toBeInTheDocument();
    expect(screen.getByText(/5/i)).toBeInTheDocument(); 
    const servicesCountElement = screen.getByText(/Services/i);
    expect(servicesCountElement).toBeInTheDocument();
    expect(screen.getByText(/10/i)).toBeInTheDocument(); 
});

