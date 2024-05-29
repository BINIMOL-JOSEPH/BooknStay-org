import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import { hotelService } from '../../HotelService';
import ListServicesToRoomsHotels from '../../components/ListAddedServicesHotel/ListAddedServiceHotel';

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

jest.mock('../../HotelService', () => ({
    hotelService : {
        ListServicesAddedToRooms : jest.fn(),
        DeleteServicesAddedToRooms : jest.fn()
    }
}));
  
beforeEach(() => {
    jest.clearAllMocks();
});

describe('test list services added to rooms by hotels', () => {

    test('render list components' , () => {
        render(
            <Router>
                <ListServicesToRoomsHotels/>
            </Router>
        );
    });

    test('should fetch added services successfully', async () => {
        const mockServices = [
            { additional_activites_details: { id: 1, title: 'Gym', description: 'Gym facilities for guest', price: 1200, status: 'active' } },
            { additional_activites_details: { id: 2, title: 'Spa', description: 'Spa facilities for guest', price: 1250, status: 'active' } },
            { additional_activites_details: { id: 3, title: 'Laundry', description: 'Laundry facilities for guest', price: 1000, status: 'active' } },
        ];
      
        hotelService.ListServicesAddedToRooms.mockResolvedValue({ data: mockServices });
      
        render(
          <Router>
            <ListServicesToRoomsHotels isOpen={true} onClose={() => {}} />
          </Router>
        );
      
        await waitFor(() => {
          expect(screen.getByTestId('table')).toBeInTheDocument(); 
          expect(screen.getByText('Gym')).toBeInTheDocument();
        });
    });   

    test('should display error message when fetching added services fails', async() => {

        const errorMessage = {
            response : {
                data :{
                    message : 'Failed to fetch added services'
                },
            },
        };

        hotelService.ListServicesAddedToRooms.mockRejectedValue(errorMessage);

        render(
            <Router>
              <ListServicesToRoomsHotels isOpen={true} onClose={() => {}} />
            </Router>
        );

        await waitFor(() => {
            expect(hotelService.ListServicesAddedToRooms).toHaveBeenCalled();
            expect(screen.getByText('Failed to fetch added services')).toBeInTheDocument();
        });
    });

    test('should delete services successfully', async () => {
        const mockServices = [
            { additional_activites_details: { id: 1, title: 'Gym', description: 'Gym facilities for guest', price: 1200, status: 'active' } }
        ];
      
        hotelService.ListServicesAddedToRooms.mockResolvedValue({ data: mockServices });
      
        render(
          <Router>
            <ListServicesToRoomsHotels isOpen={true} onClose={() => {}} />
          </Router>
        );
      
        await waitFor(() => {
          expect(screen.getByTestId('table')).toBeInTheDocument(); 
        });

        expect(screen.getByText('Gym')).toBeInTheDocument();

        expect(screen.getByTestId('delete')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('delete'));

        await waitFor(() => {
            expect(hotelService.DeleteServicesAddedToRooms).toHaveBeenCalled();
        });
    });  

    test('should display error message when deleting services fails', async() => {
      const errorMessage = {
        response: {
          data: {
            message: 'Failed to delete services'
          },
        },
      };
    
      const mockServices = [
        { additional_activites_details: { id: 1, title: 'Gym', description: 'Gym facilities for guest', price: 1200, status: 'active' } }
      ];
    
      hotelService.ListServicesAddedToRooms.mockResolvedValue({ data: mockServices });
    
      hotelService.DeleteServicesAddedToRooms.mockRejectedValue(errorMessage);
    
      render(
        <Router>
          <ListServicesToRoomsHotels isOpen={true} onClose={() => {}} />
        </Router>
      );
    
      await waitFor(() => {
        expect(screen.getByTestId('table')).toBeInTheDocument();
      });
    
      expect(screen.getByText('Gym')).toBeInTheDocument();
      expect(screen.getByTestId('delete')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('delete'));
      
      await waitFor(() => {
        expect(hotelService.DeleteServicesAddedToRooms).toHaveBeenCalled();
        expect(screen.getByText('Failed to delete services')).toBeInTheDocument();
      });
    
      await new Promise((resolve) => setTimeout(resolve, 3000));
    
      expect(screen.queryByText('Failed to delete services')).not.toBeInTheDocument();
    });
    
});