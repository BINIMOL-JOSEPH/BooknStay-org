import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import Swal from 'sweetalert2';
import { hotelService } from '../../HotelService';
import ServicesDialog from '../../components/ListAdditionalActivites/ListAdditionalActivites';

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
        FetchAdditionalServices : jest.fn(),
        AddAdditionalServices : jest.fn(),
    }
}));
  
beforeEach(() => {
    jest.clearAllMocks();
});

describe('testing add additional activites components', () => {

    test('render additional activites components', () => {

        render(
            <Router>
                <ServicesDialog/>
            </Router>
        );
    });

    test('should fetch additional services successfully', async () => {
          
        const mockServices = [
            { id: 1, title: 'Gym' },
            { id: 2, title: 'Spa' },
            { id: 3, title: 'Laundry' },
        ];

        hotelService.FetchAdditionalServices.mockResolvedValue({ data: mockServices });
      
        render(
            <Router>
              <ServicesDialog open={true} onClose={() => {}} />
            </Router>
        );
      
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(mockServices.length)
        });

        const dialogComponent = screen.getByTestId('dialog');
        expect(dialogComponent).toBeInTheDocument();

        expect(screen.getByText('Gym')).toBeInTheDocument();
        expect(screen.getByText('Spa')).toBeInTheDocument();
        expect(screen.getByText('Laundry')).toBeInTheDocument();
    });
      
    test('should handle fetch additional services failure', async () => {
        
        const errorMessage = {
            response : {
                data :{
                    message : 'Failed to fetch services'
                },
            },
        };

        hotelService.FetchAdditionalServices.mockRejectedValue(errorMessage);
      
        render(
            <Router>
                <ServicesDialog open={true} onClose={() => {}} />
            </Router>
        );
      
        await waitFor(() => {
            expect(hotelService.FetchAdditionalServices).toHaveBeenCalled();
            expect(Swal.fire).toHaveBeenCalledWith({
                position: 'top',
                icon: 'error',
                title: 'Failed to fetch services',
                showConfirmButton: false,
                timer: 1000,
            });
        });
    }); 

    test('should show success message when service added successfully', async () => {
        const mockServices = [
          { id: 1, title: 'Gym' }
        ];
      
        const mockedResponse = {
          response: {
            data: {
              message: 'Services added successfully',
            },
          },
        };
      
        hotelService.FetchAdditionalServices.mockResolvedValue({ data: mockServices });
      
        hotelService.AddAdditionalServices.mockResolvedValue(mockedResponse);
      
        render(
          <Router>
            <ServicesDialog open={true} onClose={() => {}} />
          </Router>
        );
      
        await waitFor(() => {
          expect(screen.getAllByRole('listitem')).toHaveLength(mockServices.length);
        });
      
        const addButton = screen.getByTestId('add');
        expect(addButton).toBeInTheDocument();
      
        fireEvent.click(addButton);
      
        await waitFor(() => {
            expect(hotelService.AddAdditionalServices).toHaveBeenCalled();
        });
    });

    test('should show error message when service added fails', async () => {
        const mockServices = [
          { id: 1, title: 'Gym' }
        ];
      
        const mockedResponse = {
          response: {
            data: {
              message: 'Failed to add services to rooms',
            },
          },
        };
      
        hotelService.FetchAdditionalServices.mockResolvedValue({ data: mockServices });
      
        hotelService.AddAdditionalServices.mockRejectedValue(mockedResponse);
      
        render(
          <Router>
            <ServicesDialog open={true} onClose={() => {}} />
          </Router>
        );
      
        await waitFor(() => {
          expect(screen.getAllByRole('listitem')).toHaveLength(mockServices.length);
        });
      
        const addButton = screen.getByTestId('add');
        expect(addButton).toBeInTheDocument();
      
        fireEvent.click(addButton);
      
        await waitFor(() => {
            expect(hotelService.AddAdditionalServices).toHaveBeenCalled();
            expect(screen.getByText('Failed to add services to rooms')).toBeInTheDocument();
        });

        await new Promise((resolve) => setTimeout(resolve, 3000));
    
        expect(screen.queryByText('Failed to add services to rooms')).not.toBeInTheDocument();
    });
});