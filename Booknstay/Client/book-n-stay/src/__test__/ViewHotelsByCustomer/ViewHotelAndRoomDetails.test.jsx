import React from 'react';
import { fireEvent, render, screen, waitFor,} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ViewHotelRooms from '../../components/ViewHotelsByCustomer/ViewHotelAndRoomDetails';
import '@testing-library/jest-dom';
import { hotelService } from '../../HotelService';

const localStorageMock = {
    getItem: jest.fn(()  => '{"user": {"userType": "customer", "first_name": "admin"}}'),
    setItem: jest.fn()
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

jest.mock('../../HotelService', () => ({
    hotelService: {
        ViewHotel: jest.fn(),
        FetchHotelRoom: jest.fn(),
        ServicesById: jest.fn(),
        FetchReview: jest.fn()
    },
  }));
  
jest.setTimeout(20000);
  
beforeEach(() => {
    jest.clearAllMocks();
});

const mockHotelData = [
    {
      'hotel_details':{
        id: 1,
        hotel_name: 'Motel6',
        email: 'motel6@test.com',
      }
       
    },
];

const mockRoomData = [
  {"room":{
    room_details_id:1,
    room_type_name:'Deluxe'
  },
  "image":{
      room_details_id:1,
      image1:"/room_images/img.jpg"
  },
  "additional_services_details":[{
    id:1,
    title:'Gym',
    description: 'Excellent gym equipments and services for guests'
  }]
  }

]
afterEach(() => {
    jest.restoreAllMocks();
  });

describe('Detailed Hotel and room view', () => {
    it('should handle fetch errors', async () => {
        const errorMessage = 'No active hotels found';
        hotelService.ViewHotel = jest.fn().mockRejectedValueOnce({ response: { data: { message: errorMessage } } });
      
        render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
      
        await waitFor(() => {
          expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });
    
    it('fetches hotel details in invalid data format on component mount', async () => {
        hotelService.ViewHotel.mockResolvedValue({ data: {
            id: 1,
            hotel_name: 'Motel6',
            email: 'motel6@test.com',
        } })
    
        render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
        await waitFor(() => {
          expect(require('../../HotelService').hotelService.ViewHotel).toHaveBeenCalled();
        });

        await waitFor(() => {
            const errorMessage = screen.getByText('Data is not received in the correct format')
            expect(errorMessage).toBeInTheDocument();
        });
    });

    it('should handle fetch room details errors', async () => {
        const errorMessage = 'Unable to find room details';
        hotelService.FetchHotelRoom = jest.fn().mockRejectedValueOnce({ response: { data: { message: errorMessage } } });
      
        render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
      
        await waitFor(() => {
          expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('fetches hotel room details in invalid data format on component mount', async () => {
        hotelService.FetchHotelRoom.mockResolvedValue({ data: {
            id: 1,
            hotel_name: 'Motel6',
            email: 'motel6@test.com',
        } })
    
        render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
        await waitFor(() => {
          expect(require('../../HotelService').hotelService.FetchHotelRoom).toHaveBeenCalled();
        });

        await waitFor(() => {
            const errorMessage = screen.getByText('Data is not received in the correct format')
            expect(errorMessage).toBeInTheDocument();
        });
    });

    it('fetches hotel details on component mount and navigate to review page', async () => {
        hotelService.ViewHotel.mockResolvedValue({ data: mockHotelData})

        const hotel_id = 1;

        render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
        await waitFor(() => {
          expect(require('../../HotelService').hotelService.ViewHotel).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByText('Motel6')).toBeInTheDocument();
            expect(screen.getByTestId('manage-review')).toBeInTheDocument();
        });

        await waitFor(()=>{
          fireEvent.click(screen.getByTestId('manage-review'));
        })
    });

    it('should fetches room details on component mount', async () => {
        const mockedResponse = {
          data: [
            {
              room: {
                id: 6,
                room_type_name: 'Single',
                hotel_name: 'Hotels',
                number_of_rooms: 12,
                rate: '1400.90',
                room_facilities: 'WiFi, TV, AC',
              },
              additional_services_details: [
                { id: 1, title: 'Laundry', description: 'Excellent laundry services for guests' },
              ],
              image: {
                room_details_id: 6,
                image1: 'http://localhost:8000/media/room_images/room1.jpeg',
                image2: 'http://localhost:8000/media/room_images/room2.jpg',
                image3: 'http://localhost:8000/media/room_images/room3.jpeg'
              }
            }
          ]
        };

        const mockServices = {
            data : {
                id: 1, title: 'Laundry', description: 'Excellent laundry services for guests' 
            }
        }
    
        hotelService.FetchHotelRoom.mockResolvedValueOnce(mockedResponse);
    
        render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
        await waitFor(() => {
            expect(screen.getByText('Room Details')).toBeInTheDocument();
            expect(screen.getByTestId('services-link')).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('services-link'));
        });

        expect(screen.getByTestId('dialog')).toBeInTheDocument();

        hotelService.ServicesById.mockResolvedValueOnce(mockServices);
        expect(hotelService.ServicesById).toHaveBeenCalled();
    });

    it('should display an error when fetching service details fails', async () => {
        const mockedResponse = {
          data: [
            {
              room: {
                id: 6,
                room_type_name: 'Single',
                hotel_name: 'Hotels',
                number_of_rooms: 12,
                rate: '1400.90',
                room_facilities: 'WiFi, TV, AC',
              },
              additional_services_details: [
                { id: 1, title: 'Laundry', description: 'Excellent laundry services for guests' },
              ],
              image: {
                room_details_id: 6,
                image1: 'http://localhost:8000/media/room_images/room1.jpeg',
                image2: 'http://localhost:8000/media/room_images/room2.jpg',
                image3: 'http://localhost:8000/media/room_images/room3.jpeg'
              }
            }
          ]
        };

        const mockServices = {
            response : {
                data : {
                    message : 'Error occured while fetching service details'
                }
            }
        }
    
        hotelService.FetchHotelRoom.mockResolvedValueOnce(mockedResponse);
    
        render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
        await waitFor(() => {
            expect(screen.getByText('Room Details')).toBeInTheDocument();
            expect(screen.getByTestId('services-link')).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('services-link'));
        });

        expect(screen.getByTestId('dialog')).toBeInTheDocument();

        hotelService.ServicesById.mockRejectedValueOnce(mockServices);
        expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });

    it('should display reviews of hotels', async() => {
      const mockedResponse = {
        data: [
          {
            room: {
              id: 6,
              room_type_name: 'Single',
              hotel_name: 'Hotels',
              number_of_rooms: 12,
              rate: '1400.90',
              room_facilities: 'WiFi, TV, AC',
            },
            additional_services_details: [
              { id: 1, title: 'Laundry', description: 'Excellent laundry services for guests' },
            ],
            image: {
              room_details_id: 6,
              image1: 'http://localhost:8000/media/room_images/room1.jpeg',
              image2: 'http://localhost:8000/media/room_images/room2.jpg',
              image3: 'http://localhost:8000/media/room_images/room3.jpeg'
            }
          }
        ]
      };

      const mockReview = {
          data : {
              id: 1, title: 'Wonderful stay', comment: 'Excellent hotel with good staff and services'
          }
      }
  
      hotelService.FetchHotelRoom.mockResolvedValueOnce(mockedResponse);
  
      render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
      await waitFor(() => {
          expect(screen.getByText('Room Details')).toBeInTheDocument();
          expect(screen.getByText('User Reviews & Ratings')).toBeInTheDocument();
      });

      hotelService.FetchReview.mockResolvedValueOnce(mockReview);
      expect(hotelService.FetchReview).toHaveBeenCalled();
    });

    it('should display no reviews of hotels', async() => {
      const errorMessage = 'No reviews added yet'
  
      hotelService.FetchReview = jest.fn().mockRejectedValueOnce({ response: { data: { message: errorMessage } } });
  
      render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
      await waitFor(() => {
          expect(screen.getByText('Room Details')).toBeInTheDocument();
          expect(screen.getByText('User Reviews & Ratings')).toBeInTheDocument();
      });
  
      expect(hotelService.FetchReview).toHaveBeenCalled();
  
      await waitFor(()=>{
        expect(screen.getByText('No reviews available')).toBeInTheDocument();
      })
    });

    it('fetches hotel room details and navigate to booking page', async () => {
      hotelService.FetchHotelRoom.mockResolvedValue({ data: mockRoomData})
  
      render(<MemoryRouter><ViewHotelRooms /></MemoryRouter>);
      await waitFor(() => {
        expect(require('../../HotelService').hotelService.FetchHotelRoom).toHaveBeenCalled();
      });
      await waitFor(()=>{
        expect(screen.getByTestId('room-detail-card')).toBeInTheDocument();
        expect(screen.getByText('Deluxe')).toBeInTheDocument();
      })

      await waitFor(()=>{
        expect(screen.getByTestId('book-room')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('book-room'));
      })

  });
});
