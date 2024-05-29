import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import Swal from 'sweetalert2';
import { act } from 'react-dom/test-utils';
import RoomType from '../../components/RoomType/RoomType';
import { adminServices } from '../../AdminService';
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

jest.setTimeout(20000);

jest.mock('../../interceptor', () => ({
  axiosPrivate: {
    get: jest.fn(),
  },
}));

jest.mock('../../AdminService', () => ({
  adminServices: {
      AddRoomType : jest.fn(),
      ListRoomType : jest.fn(),
      ListRoomTypeByDate : jest.fn()
  },
}));

  
beforeEach(() => {
    jest.clearAllMocks();
});
  
describe('testing add room types components', () => {
    
    test('render add room types components', () => {
        render(
            <Router>
                <RoomType />
            </Router>
        );

        const stack = screen.getByTestId('stack');
        expect(stack).toBeInTheDocument();

        const input = screen.getByTestId('roomtype');
        expect(input).toBeInTheDocument();

        const button = screen.getByTestId('button');
        expect(button).toBeInTheDocument();
    });

    test('shows success message when form submission pass', async () => {
        jest.spyOn(adminServices, 'AddRoomType').mockResolvedValueOnce({
          data: {
            message: 'Room type added successfully',
          },
        });
      
        render(
          <Router>
            <RoomType />
          </Router>
        );
      
        const input = screen.getByTestId('roomtype');
        const button = screen.getByTestId('button');
      
        expect(button).toBeInTheDocument();
      
        await act(async () => {
          fireEvent.change(input.querySelector('input'), { target: { value: 'Single' } });
          fireEvent.click(button);
          await waitFor(() => {
            expect(adminServices.AddRoomType).toHaveBeenCalledWith({ room_type: 'Single' });
            expect(Swal.fire).toHaveBeenCalledWith({
              position: 'top',
              icon: 'success',
              title: 'Room type added successfully',
              showConfirmButton: false,
              timer: 5000,
            });
          });
        });
    });

    test('shows error message when form submission fails', async () => {
        jest.spyOn(adminServices, 'AddRoomType').mockRejectedValueOnce({
          response: {
              data: {
                room_type: 'Room type adding failed',
            },
          },
        });
      
        render(
          <Router>
            <RoomType />
          </Router>
        );
      
        const input = screen.getByTestId('roomtype');
        const button = screen.getByTestId('button');
      
        expect(button).toBeInTheDocument();
      
        await act(async () => {
            fireEvent.change(input.querySelector('input'), { target: { value: 'Single' } });  
            fireEvent.click(button);
            await waitFor(() => {
                expect(adminServices.AddRoomType).toHaveBeenCalledWith({ room_type: 'Single' });
                expect(Swal.fire).toHaveBeenCalledWith({
                    position: 'top',
                    icon: 'error',
                    title: 'Room type adding failed',
                    showConfirmButton: false,
                    timer: 5000,
                });
            });
        });
    });

    test('shows error message when fetching room type fails', async () => {
      jest.spyOn(adminServices, 'ListRoomType').mockRejectedValueOnce({
        response: {
            data: {
              room_type: 'Room type adding failed',
          },
        },
      });
    
      render(
        <Router>
          <RoomType />
        </Router>
      );
    
      await waitFor(() => {
        expect(adminServices.ListRoomType).toHaveBeenCalled();
      });
    });


    test('should filter room types based on search query', async() => {
        const mockData = [{
          id : 1,
          room_type : 'Single'
        },
        {
          id : 2,
          room_type : 'Deluxe'
        }];

        jest.spyOn(adminServices, 'ListRoomType').mockResolvedValueOnce({
            data: {
                results : mockData
            }
        });

        render(
          <Router>
              <RoomType />
          </Router>
        );

        const search = screen.getByLabelText('Search');
        userEvent.type(search, 'Single');

        await waitFor(() => {
          expect(adminServices.ListRoomType).toHaveBeenCalled();
        });
    });

    test('handle page change on next button', async() => {
      const mockedResponse = {
        results: [
                { id: 1, room_type: 'Single'} ,
                { id: 2, room_type: 'Double'},
                { id: 3, room_type: 'Deluxe'},
                { id: 4, room_type: 'Standard'},
                { id: 5, room_type: 'King room'},
                { id: 5, room_type: 'Suite'},
              ],
                
        next: '/api/next-page',
        previous: '/api/prev-page',
      };

      adminServices.ListRoomType.mockResolvedValue({
        data: mockedResponse,
      });
       
      axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
  
      render(
        <Router>
          <RoomType/>
        </Router>
      );

      await waitFor(() => {
        expect(adminServices.ListRoomType).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Single')).toBeInTheDocument();
        expect(screen.getByText('Double')).toBeInTheDocument();
        expect(screen.getByText('Deluxe')).toBeInTheDocument();
        expect(screen.getByText('Standard')).toBeInTheDocument();
        expect(screen.getByText('King room')).toBeInTheDocument();
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
        expect(screen.getByText('Suite')).toBeInTheDocument(); 
      });
    });

    test('handle page change on previous button', async() => {
      const mockedResponse = {
        results: [
                { id: 1, room_type: 'Single'} ,
                { id: 2, room_type: 'Double'},
                { id: 3, room_type: 'Deluxe'},
                { id: 4, room_type: 'Standard'},
                { id: 5, room_type: 'King room'},
                { id: 5, room_type: 'Suite'},
              ],
                
        next: '/api/next-page',
        previous: '/api/prev-page',
      };

      adminServices.ListRoomType.mockResolvedValue({
        data: mockedResponse,
      });
       
      axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
  
      render(
        <Router>
          <RoomType/>
        </Router>
      );

      await waitFor(() => {
        expect(adminServices.ListRoomType).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Suite')).toBeInTheDocument(); 
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
        expect(screen.getByText('Single')).toBeInTheDocument(); 
      });
    });
});