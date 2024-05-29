import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ListHotels from '../../components/ListHotels/ListHotels';
import '@testing-library/jest-dom';
import { hotelService } from '../../HotelService';
import { axiosPrivate } from '../../interceptor';

const localStorageMock = {
  getItem: jest.fn(()  => '{"user": {"userType": "admin", "first_name": "admin"}}'),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

jest.mock('../../interceptor', () => ({
  axiosPrivate: {
    get: jest.fn(),
  },
}));

jest.mock('../../HotelService', () => ({
  hotelService: {
    FetchHotel: jest.fn(),
    FetchHotelByStatus: jest.fn()
  },
}));

jest.setTimeout(20000);

beforeEach(() => {
    jest.clearAllMocks();
  });

describe('ListHotels', () => {
    it('renders the table with data correctly', async () => {
        jest.spyOn(hotelService, 'FetchHotel').mockResolvedValue({
          data: {
            results: [
              {
                id: 1,
                hotel_name: 'John',
                license_number:'12-1234-1234',
                email: 'john.doe@example.com',
                phone_number: '1234567890',
                date_joined: '2023-01-01',
                status: 'active',
                updated_on: '2023-01-02',
              },
            ],
            next: null,
            previous: null,
          },
        });
    
        render(<MemoryRouter>
            <ListHotels />
          </MemoryRouter>);
        await waitFor(() => {
          expect(screen.getByText('SI. No')).toBeInTheDocument();
          expect(screen.getByText('Hotel Name')).toBeInTheDocument();
          expect(screen.getByText('License Number')).toBeInTheDocument();
          expect(screen.getByText('Email')).toBeInTheDocument();
          expect(screen.getByText('Phone Number')).toBeInTheDocument();
          expect(screen.getByText('Date Joined')).toBeInTheDocument();
          expect(screen.getByText('Status')).toBeInTheDocument();
          expect(screen.getByText('Updated On')).toBeInTheDocument();
          expect(screen.getByText('Action')).toBeInTheDocument();
    
          expect(screen.getByText('John')).toBeInTheDocument();
          expect(screen.getByText('12-1234-1234')).toBeInTheDocument();
          expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
          expect(screen.getByText('1234567890')).toBeInTheDocument();
          expect(screen.getByText('2023-01-01')).toBeInTheDocument();
          expect(screen.getByText('active')).toBeInTheDocument();
          expect(screen.getByText('2023-01-02')).toBeInTheDocument();
    
          expect(screen.getByTestId('view-more-link')).toHaveAttribute('href', '/view-hotel/1');
        });
      });


      it('should handle fetch errors', async () => {
        const errorMessage = 'No hotels found';
        hotelService.FetchHotel = jest.fn().mockRejectedValueOnce({ response: { data: { message: errorMessage } } });
      
        render(<MemoryRouter><ListHotels /></MemoryRouter>);
      
      });


      it('should filter hotels based on search query', async () => {
        const mockData = [{
            id: 1,
            hotel_name: 'John',
            license_number:'12-1234-1234',
            email: 'john@test.com',
            phone_number: '1234567890',
            date_joined: '2023-01-01',
            status: 'active',
            updated_on: '2023-01-02',
          },
          {
            id: 2,
            hotel_name: 'Jane',
            license_number:'12-1234-1234',
            email: 'jane@test.com',
            phone_number: '1234567890',
            date_joined: '2023-01-01',
            status: 'active',
            updated_on: '2023-01-02',
          }];
        hotelService.FetchHotel = jest.fn().mockResolvedValueOnce({ data: { results: mockData } });
      
        render(<MemoryRouter><ListHotels /></MemoryRouter>);
      
        await waitFor(() => {
          const searchInput = screen.getByLabelText('Search');
          userEvent.type(searchInput, 'Jane');
          expect(hotelService.FetchHotel).toHaveBeenCalledTimes(5);
          expect(hotelService.FetchHotel).toHaveBeenLastCalledWith({ query: 'Jane' });
          expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
          expect(screen.getByText('Jane')).toBeInTheDocument();
        });
      });

      it('should display data with the selected filter value', async () => {
        const mockedResponse = {
          results: [{ id: 1, hotel_name: 'John', license_number:'12-1234-1231', email: 'john@test.com' },
                  { id: 2, hotel_name: 'Tommy', license_number: '12-1234-1232', email: 'tommy@test.com' } ,
                  { id: 3, hotel_name: 'Johny', license_number: '12-1234-1233', email: 'johny@test.com' },
                  { id: 4, hotel_name: 'Tom', license_number: '12-1234-1234', email: 'tom@test.com' },
                  { id: 5, hotel_name: 'Jose', license_number: '12-1234-1235', email: 'jose@test.com' },
                  { id: 6, hotel_name: 'Tony', license_number: '12-1234-1236', email: 'tony@test.com' }  ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
        
      };
      hotelService.FetchHotel.mockResolvedValue({
        data: mockedResponse,
      });

        render(<MemoryRouter><ListHotels /></MemoryRouter>);
        
        hotelService.FetchHotelByStatus.mockResolvedValue({
          data: {
            results: [{id: 1, hotel_name: 'John', license_number:'12-1234-1231', email: 'john@test.com' },
                      { id: 2, hotel_name: 'Tommy', license_number: '12-1234-1232', email: 'tommy@test.com' } ,
                      { id: 3, hotel_name: 'Johny', license_number: '12-1234-1233', email: 'johny@test.com' }],
            next: null,
            previous: null,
          },
        });

        await waitFor(() => {
          const selectfield = screen.getByTestId('select-option');
          expect(selectfield).toBeInTheDocument();
          fireEvent.click(selectfield);

          fireEvent.keyDown(selectfield.firstChild, { key: 'ArrowDown' });
        })
        
        await waitFor(() => screen.queryByText('Active'));
        fireEvent.click(screen.getByText('Active'));   
    
        await waitFor(() => {
          expect(hotelService.FetchHotelByStatus).toHaveBeenCalledWith('active');
        });
      });

      it('handles next button click', async () => {
        const mockedResponse = {
          results: [{ id: 1, hotel_name: 'John', license_number:'12-1234-1231', email: 'john@test.com' },
                  { id: 2, hotel_name: 'Tommy', license_number: '12-1234-1232', email: 'tommy@test.com' } ,
                  { id: 3, hotel_name: 'Johny', license_number: '12-1234-1233', email: 'johny@test.com' },
                  { id: 4, hotel_name: 'Tom', license_number: '12-1234-1234', email: 'tom@test.com' },
                  { id: 5, hotel_name: 'Jose', license_number: '12-1234-1235', email: 'jose@test.com' },
                  { id: 6, hotel_name: 'Tony', license_number: '12-1234-1236', email: 'tony@test.com' }  ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
        
      };
      hotelService.FetchHotel.mockResolvedValue({
        data: mockedResponse,
      });
         
        axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
    
        render(<MemoryRouter><ListHotels /></MemoryRouter>);

        await waitFor(() => {
          expect(hotelService.FetchHotel).toHaveBeenCalled();
        });
    
        await waitFor(() => {
            expect(screen.getByText('Hotel Name')).toBeInTheDocument();
            expect(screen.getByText('John')).toBeInTheDocument();
        });

        expect(screen.getByTestId('navigate-stack')).toBeInTheDocument();
        await waitFor(async () => {
          const nextButton = await screen.findByTestId('next');          
          expect(nextButton).toBeInTheDocument();       
          fireEvent.click(nextButton);
        },{ timeout: 5000 });
        
        await waitFor(() => {
          expect(axiosPrivate.get).toHaveBeenCalled();
        });
    
        await waitFor(() => {
          expect(axiosPrivate.get).toHaveBeenCalledWith('/api/next-page');
          expect(screen.getByText('Jose')).toBeInTheDocument(); 
        });
      });

      it('handles previous button click', async () => {
        const mockedResponse = {
          results: [{ id: 1, hotel_name: 'John', license_number:'12-1234-1231', email: 'john@test.com' },
                  { id: 2, hotel_name: 'Tommy', license_number: '12-1234-1232', email: 'tommy@test.com' } ,
                  { id: 3, hotel_name: 'Johny', license_number: '12-1234-1233', email: 'johny@test.com' },
                  { id: 4, hotel_name: 'Tom', license_number: '12-1234-1234', email: 'tom@test.com' },
                  { id: 5, hotel_name: 'Jose', license_number: '12-1234-1235', email: 'jose@test.com' },
                  { id: 6, hotel_name: 'Tony', license_number: '12-1234-1236', email: 'tony@test.com' }  ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
        
      };
      hotelService.FetchHotel.mockResolvedValue({
        data: mockedResponse,
      });
         
        axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
    
        render(<MemoryRouter><ListHotels /></MemoryRouter>);

        await waitFor(() => {
          expect(hotelService.FetchHotel).toHaveBeenCalled();
        });
    
        await waitFor(() => {
            expect(screen.getByText('Hotel Name')).toBeInTheDocument();
            expect(screen.getByText('Jose')).toBeInTheDocument();
        });

        expect(screen.getByTestId('navigate-stack')).toBeInTheDocument();
        await waitFor(async () => {
          const previousButton = await screen.findByTestId('previous');          
          expect(previousButton).toBeInTheDocument();       
          fireEvent.click(previousButton);
        },{ timeout: 5000 });
        
        await waitFor(() => {
          expect(axiosPrivate.get).toHaveBeenCalled();
        });
    
        await waitFor(() => {
          expect(axiosPrivate.get).toHaveBeenCalledWith('/api/prev-page');
          expect(screen.getByText('John')).toBeInTheDocument(); 
        });
      });

      it('should display error message with the selected filter value', async () => {
        const mockedResponse = {
          results: [{ id: 1, hotel_name: 'John', license_number:'12-1234-1231', email: 'john@test.com' },
                  { id: 2, hotel_name: 'Tommy', license_number: '12-1234-1232', email: 'tommy@test.com' } ,
                  { id: 3, hotel_name: 'Johny', license_number: '12-1234-1233', email: 'johny@test.com' },
                  { id: 4, hotel_name: 'Tom', license_number: '12-1234-1234', email: 'tom@test.com' },
                  { id: 5, hotel_name: 'Jose', license_number: '12-1234-1235', email: 'jose@test.com' },
                  { id: 6, hotel_name: 'Tony', license_number: '12-1234-1236', email: 'tony@test.com' }  ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
        
      };
      hotelService.FetchHotel.mockResolvedValue({
        data: mockedResponse,
      });

        render(<MemoryRouter><ListHotels /></MemoryRouter>);
        const errorMessage = 'No active hotels found';
        hotelService.FetchHotelByStatus = jest.fn().mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

        await waitFor(() => {
          const selectfield = screen.getByTestId('select-option');         
          expect(selectfield).toBeInTheDocument();       
          fireEvent.click(selectfield);
          
          fireEvent.keyDown(selectfield.firstChild, { key: 'ArrowDown' });
        })
       
        await waitFor(() => screen.queryByText('Active'));
        fireEvent.click(screen.getByText('Active'));   
    
        await waitFor(() => {
          expect(hotelService.FetchHotelByStatus).toHaveBeenCalledWith('active');
        });

    
      });

    });