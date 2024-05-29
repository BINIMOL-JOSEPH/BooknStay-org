import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import { adminServices } from '../../AdminService';
import { axiosPrivate } from '../../interceptor';
import ListRoomDetails from '../../components/AdminViewRoomDetails/AdminViewRoomDetails';

const localStorageMock = {
  getItem: jest.fn(()  => '{"user": {"userType": "admin", "first_name": "admin"}}'),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

jest.mock('../../AdminService', () => ({
    adminServices: {
        ListRoomDetails: jest.fn(),
        ListRoomDetailsById: jest.fn(),
        ListAdditionalServices: jest.fn()
    },
}));

jest.mock('../../interceptor', () => ({
    axiosPrivate: {
      get: jest.fn(),
    },
}));
  

beforeEach(() => {
    jest.clearAllMocks();
});

describe('testing view room details components', () => {

  test('render view details components', async() => {
    const mockedResponse = {
      results: [
        {
          room_detail: { id: 1, room_type_name: "Single", hotel_name: "Hotels", number_of_rooms: 12 },
          booked_rooms: 0,
          available_rooms: 12
        },
        {
          room_detail: { id: 3, room_type_name: "Double", hotel_name: "Hotels", number_of_rooms: 12 },
          booked_rooms: 0,
          available_rooms: 10
        },
      ],
      next: '/api/next-page',
      previous: '/api/prev-page',
    };

    adminServices.ListRoomDetails.mockResolvedValue({
      data: mockedResponse,
    });
     
    axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });

      render(
          <Router>
              <ListRoomDetails/>
          </Router>
      );

      await waitFor(() => {
        expect(adminServices.ListRoomDetails).toHaveBeenCalled();
      });

      const card = screen.getByTestId('card_element');
      expect(card).toBeInTheDocument();

      const searchInput = screen.getByLabelText('Search');
      userEvent.type(searchInput, 'Single');

      await waitFor(() => {
        expect(adminServices.ListRoomDetails).toHaveBeenCalledTimes(7);
        expect(adminServices.ListRoomDetails).toHaveBeenLastCalledWith({ query: 'Single' });
      });

      const table = screen.getByTestId('table_container');
      expect(table).toBeInTheDocument();
  });

    test('handle page change on next button', async() => {
        const mockedResponse = {
          results: [
            {
              room_detail: { id: 1, room_type_name: "Single", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 12
            },
            {
              room_detail: { id: 3, room_type_name: "Double", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 10
            },
            {
              room_detail: { id: 4, room_type_name: "Deluxe", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 12
            },
            {
              room_detail: { id: 5, room_type_name: "Standard", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 12
            },
            {
              room_detail: { id: 5, room_type_name: "King room", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 12
            },
          ],

          next: '/api/next-page',
          previous: '/api/prev-page',
        };
  
        adminServices.ListRoomDetails.mockResolvedValue({
          data: mockedResponse,
        });
         
        axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
    
        render(
          <Router>
            <ListRoomDetails/>
          </Router>
        );
  
        await waitFor(() => {
          expect(adminServices.ListRoomDetails).toHaveBeenCalled();
        });
  
        await waitFor(() => {
          expect(screen.getByTestId('next')).toBeInTheDocument();
          fireEvent.click(screen.getByTestId('next'));
        });
  
        await waitFor(() => {
          expect(axiosPrivate.get).toHaveBeenCalled();
        });
    
        await waitFor(() => {
          expect(axiosPrivate.get).toHaveBeenCalledWith('/api/next-page');
        });
    });

    test('handle page change on previous button', async() => {
        const mockedResponse = {
          results: [
            {
              room_detail: { id: 1, room_type_name: "Single", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 12
            },
            {
              room_detail: { id: 3, room_type_name: "Double", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 10
            },
            {
              room_detail: { id: 4, room_type_name: "Deluxe", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 12
            },
            {
              room_detail: { id: 5, room_type_name: "Standard", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 12
            },
            {
              room_detail: { id: 5, room_type_name: "King room", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 12
            },
          ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
        };
  
        adminServices.ListRoomDetails.mockResolvedValue({
            data: mockedResponse,
        });
           
        axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
    
        render(
          <Router>
            <ListRoomDetails/>
          </Router>
        );
  
        await waitFor(() => {
          expect(adminServices.ListRoomDetails).toHaveBeenCalled();
        });
  
        await waitFor(() => {
          expect(screen.getByTestId('previous')).toBeInTheDocument();
          fireEvent.click(screen.getByTestId('previous'));
        });
  
        await waitFor(() => {
          expect(axiosPrivate.get).toHaveBeenCalled();
        });
    
        await waitFor(() => {
          expect(axiosPrivate.get).toHaveBeenCalledWith('/api/prev-page');
        });
    });

    test('should handle fetch errors', async () => {
        const errorMessage = 'No room details found';

        adminServices.ListRoomDetails.mockRejectedValueOnce(
            { response: 
                { data: 
                    { message: errorMessage } 
                } 
            }
        );
      
        render(
            <Router>
                <ListRoomDetails />
            </Router>
        );

        await waitFor(() => {
          expect(screen.getByText('Oops! No data found')).toBeInTheDocument();
        })
    });


    test('should open the dialog box when the more icon is clicked', async() => {
        
        const mockedResponse = {
          results: [
            {
              room_detail: { id: 1, room_type_name: "Single", hotel_name: "Hotels", number_of_rooms: 12 },
              booked_rooms: 0,
              available_rooms: 12
            },
          ],
          next: '/api/next-page',
          previous: '/api/prev-page',
        };
    
        adminServices.ListRoomDetails.mockResolvedValue({
              data: mockedResponse,
        });
      
        render(
            <Router>
              <ListRoomDetails/>
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByTestId('view-more-icon')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('view-more-icon'));
        });

        await waitFor(() => {
            const roomDetailsTextElements = screen.getByRole('dialog');
            expect(roomDetailsTextElements).toBeInTheDocument();

            expect(adminServices.ListRoomDetailsById).toHaveBeenCalled();
            expect(adminServices.ListAdditionalServices).toHaveBeenCalled();
        });
    });

    test('should handle fetch errors for room details by id', async () => {

      const mockedResponse = {
        results: [
          {
            room_detail: { id: 1, room_type_name: "Single", hotel_name: "Hotels", number_of_rooms: 12 },
            booked_rooms: 0,
            available_rooms: 12
          },
        ],
        next: '/api/next-page',
        previous: '/api/prev-page',
      };

      adminServices.ListRoomDetails.mockResolvedValue({
          data: mockedResponse,
      });

      const errorMessage = 'No room details found';

      adminServices.ListRoomDetailsById.mockRejectedValueOnce(
          { response: 
              { data: 
                  { message: errorMessage } 
              } 
          }
      );
    
      render(
          <Router>
              <ListRoomDetails />
          </Router>
      );

      await waitFor(() => {
        expect(screen.getByTestId('view-more-icon')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('view-more-icon'));
      });

      await waitFor(() => {
        const roomDetailsTextElements = screen.getByRole('dialog');
        expect(roomDetailsTextElements).toBeInTheDocument();

        expect(adminServices.ListRoomDetailsById).toHaveBeenCalled();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('should handle fetch additional services error', async() => {
        
      const mockedResponse = {
        results: [
          {
            room_detail: { id: 1, room_type_name: "Single", hotel_name: "Hotels", number_of_rooms: 12 },
            booked_rooms: 0,
            available_rooms: 12
          },
        ],
        next: '/api/next-page',
        previous: '/api/prev-page',
      };

      const errorMessage = 'Error fetching additional services';
  
      adminServices.ListRoomDetails.mockResolvedValue({
            data: mockedResponse,
      });

      adminServices.ListAdditionalServices.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });
    
      render(
          <Router>
            <ListRoomDetails/>
          </Router>
      );

      await waitFor(() => {
          expect(screen.getByTestId('view-more-icon')).toBeInTheDocument();
          fireEvent.click(screen.getByTestId('view-more-icon'));
      });

      await waitFor(() => {
          const roomDetailsTextElements = screen.getByRole('dialog');
          expect(roomDetailsTextElements).toBeInTheDocument();

          expect(adminServices.ListRoomDetailsById).toHaveBeenCalled();
          expect(adminServices.ListAdditionalServices).toHaveBeenCalled();

          expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
    
    test('should display additional services details', async () => {

      const mockedResponse = {
        results: [
          {
            room_detail: { id: 1, room_type_name: "Single", hotel_name: "Hotels", number_of_rooms: 12 },
            booked_rooms: 0,
            available_rooms: 12
          },
        ],
        next: '/api/next-page',
        previous: '/api/prev-page',
      };
      
      const additionalServicesData = [
        { additional_activites_details: { title: 'Service 1', description: 'Description 1', price: 10 } },
        { additional_activites_details: { title: 'Service 2', description: 'Description 2', price: 20 } }
      ];
    
      adminServices.ListRoomDetails.mockResolvedValue({
        data: mockedResponse,
      });

      adminServices.ListAdditionalServices.mockResolvedValueOnce({
        data: additionalServicesData
      });
    
      render(
        <Router>
          <ListRoomDetails/>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByTestId('view-more-icon')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('view-more-icon'));
      });
    
      await waitFor(() => {
        expect(adminServices.ListRoomDetailsById).toHaveBeenCalled();
        expect(adminServices.ListAdditionalServices).toHaveBeenCalled();
      });
    });    
});