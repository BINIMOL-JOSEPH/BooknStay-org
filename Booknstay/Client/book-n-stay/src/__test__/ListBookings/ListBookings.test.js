import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { hotelService } from '../../HotelService';
import { axiosPrivate } from '../../interceptor';
import ListBookings from '../../components/ListBookings/ListBookings';

jest.mock('../../interceptor', () => ({
  axiosPrivate: {
    get: jest.fn(),
  },
}));

jest.mock('../../HotelService', () => ({
    hotelService: {
        ListBookings: jest.fn(),
        SortBookings: jest.fn(),
        FetchPaymentDetails: jest.fn(),
        CancelIncompleteBooking: jest.fn(),
    },
}));

describe('testing list booking components', () => {

    const localStorageMock = {
        getItem: jest.fn(),
    };  

    beforeEach(() => {
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock,
        });
    });

    test('rendering list booking components', () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'admin', first_name: 'admin' }));

        render(
            <Router>
                <ListBookings />
            </Router>
        );
    });

    test('should display error when no data found', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'admin', first_name: 'admin' }));

        const mockErrorResponse = {
            response: {
                data: {
                    message: 'No Bookings Found !'
                }
            }
        };

        hotelService.ListBookings.mockRejectedValueOnce(mockErrorResponse);

        render(
            <Router>
                <ListBookings />
            </Router>
        );

        await waitFor(() => {
          expect(screen.getByText('No Bookings Found !')).toBeInTheDocument();
        });
    });

    test('should fetch booking details successfully', async() => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'admin', first_name: 'admin' }));

        const mockResponse = {
            data : {
                results : [
                    {id: 1, guest_name: 'Guest1', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                ],
                next: null,
                previous: null,
            }
        };

        hotelService.ListBookings.mockResolvedValue(mockResponse);

        render(
            <Router>
                <ListBookings/>
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByTestId('table')).toBeInTheDocument();
            expect(screen.getByTestId('view-payment')).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('view-payment'));
            expect(hotelService.FetchPaymentDetails).toHaveBeenCalled();
            expect(screen.getByTestId('dialog')).toBeInTheDocument();
        });
    });

    test('handle page change on next button', async() => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'admin', first_name: 'admin' }));

        const mockResponse = {
            data : {
                results : [
                    {id: 1, guest_name: 'Guest1', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 2, guest_name: 'Guest2', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 3, guest_name: 'Guest3', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 4, guest_name: 'Guest4', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 5, guest_name: 'Guest5', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 6, guest_name: 'Guest6', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                ],
                next: '/api/next-page',
                previous: '/api/prev-page',
            }
        };

        hotelService.ListBookings.mockResolvedValue(mockResponse);

        render(
            <Router>
                <ListBookings/>
            </Router>
        );

        axiosPrivate.get.mockResolvedValueOnce(mockResponse);

        await waitFor(() => {
            expect(hotelService.ListBookings).toHaveBeenCalled();

            expect(screen.getByTestId('next')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('next'));

            expect(axiosPrivate.get).toHaveBeenCalled();
            expect(axiosPrivate.get).toHaveBeenCalledWith('/api/next-page');
        });
    });

    test('handle page change on previous button', async() => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'admin', first_name: 'admin' }));

        const mockResponse = {
            data : {
                results : [
                    {id: 1, guest_name: 'Guest1', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 2, guest_name: 'Guest2', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 3, guest_name: 'Guest3', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 4, guest_name: 'Guest4', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 5, guest_name: 'Guest5', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 6, guest_name: 'Guest6', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                ],
                next: '/api/next-page',
                previous: '/api/prev-page',
            }
        };

        hotelService.ListBookings.mockResolvedValue(mockResponse);

        render(
            <Router>
                <ListBookings/>
            </Router>
        );

        axiosPrivate.get.mockResolvedValueOnce(mockResponse);

        await waitFor(() => {
            expect(hotelService.ListBookings).toHaveBeenCalled();

            expect(screen.getByTestId('previous')).toBeInTheDocument();
            fireEvent.click(screen.getByTestId('previous'));

            expect(axiosPrivate.get).toHaveBeenCalled();
            expect(axiosPrivate.get).toHaveBeenCalledWith('/api/prev-page');
        });
    });

    test('should sort details successfully for admin', async() => {

        localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'admin', first_name: 'admin' }));

        const mockResponse = {
            data : {
                results : [
                    {id: 1, guest_name: 'Guest1', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                ],
                next: '/api/next-page',
                previous: '/api/prev-page',
            }
        };  
        
        hotelService.ListBookings.mockResolvedValue(mockResponse);

        render(
            <Router>
                <ListBookings/>
            </Router>
        );

        const mockSortResponse = {
            data : {
                results : [
                    {id: 2, guest_name: 'Guest2', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                ],
                next: '/api/next-page',
                previous: '/api/prev-page',
            }
        };  

        hotelService.SortBookings.mockResolvedValue(mockSortResponse);

        await waitFor(() => {
            expect(hotelService.ListBookings).toHaveBeenCalled();
            expect(screen.getByText('Guest Name ↑↓')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Guest Name ↑↓'));
            expect(hotelService.SortBookings).toHaveBeenCalled();

            expect(screen.getByText('Check In ↑↓')).toBeInTheDocument();
            fireEvent.click(screen.getByText('Check In ↑↓'));
            expect(hotelService.SortBookings).toHaveBeenCalled();

            expect(screen.getByText('Booked At ↑↓')).toBeInTheDocument();
            fireEvent.click(screen.getByText('Booked At ↑↓'));
            expect(hotelService.SortBookings).toHaveBeenCalled();

            expect(screen.getByText('Status ↑↓')).toBeInTheDocument();
            fireEvent.click(screen.getByText('Status ↑↓'));
            expect(hotelService.SortBookings).toHaveBeenCalled();
        });
    });

    test('should display sort error', async() => {

        localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'admin', first_name: 'admin' }));

        const mockResponse = {
            data : {
                results : [
                    {id: 1, guest_name: 'Guest1', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                ],
                next: '/api/next-page',
                previous: '/api/prev-page',
            }
        };  
        
        hotelService.ListBookings.mockResolvedValue(mockResponse);

        render(
            <Router>
                <ListBookings/>
            </Router>
        );

        const mockSortErrorResponse = {
            response : {
                data : {
                    message : 'Error occured while sorting'
                }
            }
        };  

        hotelService.SortBookings.mockRejectedValueOnce(mockSortErrorResponse);

        await waitFor(() => {
            expect(hotelService.ListBookings).toHaveBeenCalled();
            expect(screen.getByText('Guest Name ↑↓')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Guest Name ↑↓'));
            expect(hotelService.SortBookings).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByText('Error occured while sorting')).toBeInTheDocument();
        });
    });

    test('should filter booking details based on search query', async() => {

        localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'admin', first_name: 'admin' }));

        const mockResponse = {
            data : {
                results : [
                    {id: 1, guest_name: 'Guest1', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 2, guest_name: 'Guest2', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 3, guest_name: 'Guest3', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 4, guest_name: 'Guest4', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 5, guest_name: 'Guest5', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                    {id: 6, guest_name: 'Guest6', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
                ],
                next: '/api/next-page',
                previous: '/api/prev-page',
            }
        };

        hotelService.ListBookings.mockResolvedValue(mockResponse);

        render(
            <Router>
                <ListBookings/>
            </Router>
        );

        await waitFor(() => {
            const search = screen.getByTestId('search');
            userEvent.type(search, 'Guest1');

            expect(hotelService.ListBookings).toHaveBeenCalledTimes(1);
        });
    });

    test('should sort details successfully for hotel', async() => {

      localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'hotel', first_name: 'hotel' }));

      const mockResponse = {
          data : {
              results : [
                  {id: 1, guest_name: 'Guest1', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
              ],
              next: '/api/next-page',
              previous: '/api/prev-page',
          }
      };  
      
      hotelService.ListBookings.mockResolvedValue(mockResponse);

      render(
          <Router>
              <ListBookings/>
          </Router>
      );

      const mockSortResponse = {
          data : {
              results : [
                  {id: 2, guest_name: 'Guest2', check_in_date: '2024-03-12', check_out_date: '2024-02-15', status: 'confirmed'},
              ],
              next: '/api/next-page',
              previous: '/api/prev-page',
          }
      };  

      hotelService.SortBookings.mockResolvedValue(mockSortResponse);

      await waitFor(() => {
          expect(hotelService.ListBookings).toHaveBeenCalled();

          expect(screen.getByText('Guest Name ↑↓')).toBeInTheDocument();
          fireEvent.click(screen.getByText('Guest Name ↑↓'));
          expect(hotelService.SortBookings).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(hotelService.ListBookings).toHaveBeenCalled();

        expect(screen.getByText('Check IN ↑↓')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Check IN ↑↓'));
        expect(hotelService.SortBookings).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(hotelService.ListBookings).toHaveBeenCalled();

        expect(screen.getByText('Booked At ↑↓')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Booked At ↑↓'));
        expect(hotelService.SortBookings).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(hotelService.ListBookings).toHaveBeenCalled();

        expect(screen.getByText('Status ↑↓')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Status ↑↓'));
        expect(hotelService.SortBookings).toHaveBeenCalled();
      });
    });

    test('should cancel booking successfully', async() => {

      localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'hotel', first_name: 'hotel' }));

      const mockResponse = {
          data : {
              results : [
                  {id: 1, guest_name: 'Guest1', check_in_date: '2024-03-12', check_out_date: '2024-02-15', booked_at: '2024-03-12', status: 'in progress'},
              ],
              next: '/api/next-page',
              previous: '/api/prev-page',
          }
      };  
      
      hotelService.ListBookings.mockResolvedValue(mockResponse);

      render(
          <Router>
              <ListBookings/>
          </Router>
      );

      await waitFor(() => {
          expect(hotelService.ListBookings).toHaveBeenCalled();

          expect(screen.getByText('Cancel booking')).toBeInTheDocument();
          fireEvent.click(screen.getByText('Cancel booking'));

          expect(hotelService.CancelIncompleteBooking).toHaveBeenCalled();
      });
    });

    test('should display cancel booking error', async() => {

      localStorageMock.getItem.mockReturnValue(JSON.stringify({ userType: 'hotel', first_name: 'hotel' }));

      const mockResponse = {
        data : {
            results : [
                {id: 1, guest_name: 'Guest1', check_in_date: '2024-03-12', check_out_date: '2024-02-15', booked_at: '2024-03-12', status: 'in progress'},
            ],
            next: '/api/next-page',
            previous: '/api/prev-page',
        }
      };  

      const mockErrorResponse = {
        response: {
            data: {
                message: 'Cancel Booking Failed !'
            }
        }
      }; 
      
      hotelService.ListBookings.mockResolvedValue(mockResponse);
      hotelService.CancelIncompleteBooking.mockRejectedValue(mockErrorResponse)

      render(
          <Router>
              <ListBookings/>
          </Router>
      );

      await waitFor(() => {
          expect(hotelService.ListBookings).toHaveBeenCalled();

          expect(screen.getByText('Cancel booking')).toBeInTheDocument();
          fireEvent.click(screen.getByText('Cancel booking'));

          expect(hotelService.CancelIncompleteBooking).toHaveBeenCalled();
          expect(screen.getByText('Cancel Booking Failed !')).toBeInTheDocument();
      });
    });
});
