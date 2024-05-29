import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import Supervisor from '../../components/ListSupervisor/ListSupervisors';
import { adminServices } from '../../AdminService';
import { axiosPrivate } from '../../interceptor';

const localStorageMock = {
  getItem: jest.fn(()  => '{"user": {"userType": "admin", "first_name": "admin"}}'),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

jest.setTimeout(20000)

jest.mock('../../AdminService', () => ({
    adminServices: {
        ListSupervisor : jest.fn(),
        DeleteSuperVisor: jest.fn()
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
  
describe('testing list supervisor components', () => {
    
    test('render list supervisor components', async() => {
        render(
            <Router>
                <Supervisor />
            </Router>
        );
        await waitFor(() => {
          const noDataMessage = screen.getByText('No Supervisors added !')
          expect(noDataMessage).toBeInTheDocument();
        });
    });

    test('listing supervisors', async() => {

        const mockedResponse = {
            results: [
                    { id: 1, first_name: 'Supervisor1', email : 'supervisor1@test.com', status : 'active'},
                    { id: 2, first_name: 'Supervisor2', email : 'supervisor2@test.com', status : 'active'},
                    { id: 3, first_name: 'Supervisor3', email : 'supervisor3@test.com', status : 'inactive'},
                    { id: 4, first_name: 'Supervisor4', email : 'supervisor4@test.com', status : 'active'},
                    { id: 5, first_name: 'Supervisor5', email : 'supervisor5@test.com', status : 'active'},
                ],
                    
            next: '/api/next-page',
            previous: '/api/prev-page',
        };
    
        adminServices.ListSupervisor.mockResolvedValue({
            data: mockedResponse,
        });

        render(
            <Router>
                <Supervisor/>
            </Router>
        );

        await waitFor(() => {
            const table = screen.getByTestId('table');
            expect(table).toBeInTheDocument();
        });
    });

    test('handle page change on next button', async() => {
        const mockedResponse = {
          results: [
                    { id: 1, first_name: 'Supervisor1', email : 'supervisor1@test.com', status : 'active'},
                    { id: 2, first_name: 'Supervisor2', email : 'supervisor2@test.com', status : 'active'},
                    { id: 3, first_name: 'Supervisor3', email : 'supervisor3@test.com', status : 'inactive'},
                    { id: 4, first_name: 'Supervisor4', email : 'supervisor4@test.com', status : 'active'},
                    { id: 5, first_name: 'Supervisor5', email : 'supervisor5@test.com', status : 'active'},
                ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
        };
  
        adminServices.ListSupervisor.mockResolvedValue({
            data: mockedResponse,
        });
         
        axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
    
        render(
            <Router>
                <Supervisor/>
            </Router>
        );
  
        await waitFor(() => {
          expect(adminServices.ListSupervisor).toHaveBeenCalled();
        });
  
        await waitFor(() => {
          expect(screen.getByText('Supervisor1')).toBeInTheDocument();
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
          expect(screen.getByText('Supervisor5')).toBeInTheDocument();
        });
    });

    test('handle page change on previous button', async() => {
        const mockedResponse = {
          results: [
                    { id: 1, first_name: 'Supervisor1', email : 'supervisor1@test.com', status : 'active'},
                    { id: 2, first_name: 'Supervisor2', email : 'supervisor2@test.com', status : 'active'},
                    { id: 3, first_name: 'Supervisor3', email : 'supervisor3@test.com', status : 'inactive'},
                    { id: 4, first_name: 'Supervisor4', email : 'supervisor4@test.com', status : 'active'},
                    { id: 5, first_name: 'Supervisor5', email : 'supervisor5@test.com', status : 'active'},
                ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
        };
  
        adminServices.ListSupervisor.mockResolvedValue({
            data: mockedResponse,
        });
         
        axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
    
        render(
            <Router>
                <Supervisor/>
            </Router>
        );
  
        await waitFor(() => {
          expect(adminServices.ListSupervisor).toHaveBeenCalled();
        });
  
        await waitFor(() => {
          expect(screen.getByText('Supervisor5')).toBeInTheDocument();
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
          expect(screen.getByText('Supervisor1')).toBeInTheDocument();
        });
    });

    test('should filter supervisors based on search query', async () => {

      const mockedResponse = {
        results: [
                  { id: 1, first_name: 'Supervisor1', email : 'supervisor1@test.com', status : 'active'},
                  { id: 2, first_name: 'Supervisor2', email : 'supervisor2@test.com', status : 'active'},
                  { id: 3, first_name: 'Supervisor3', email : 'supervisor3@test.com', status : 'inactive'},
                  { id: 4, first_name: 'Supervisor4', email : 'supervisor4@test.com', status : 'active'},
                  { id: 5, first_name: 'Supervisor5', email : 'supervisor5@test.com', status : 'active'},
              ],
                
        next: '/api/next-page',
        previous: '/api/prev-page',
      };

      adminServices.ListSupervisor.mockResolvedValue({
          data: mockedResponse,
      });
    
      render(
        <Router>
            <Supervisor/>
        </Router>
      );
    
      await waitFor(() => {
        const searchInput = screen.getByTestId('search');
        userEvent.type(searchInput, 'Supervisor1');

        expect(adminServices.ListSupervisor).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Supervisor1')).toBeInTheDocument();
      });
    });

    test('deleting supervisors', async() => {

      const mockedResponse = {
          results: [
                  { id: 1, first_name: 'Supervisor1', email : 'supervisor1@test.com', status : 'active'},
              ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
      };
  
      adminServices.ListSupervisor.mockResolvedValue({
          data: mockedResponse,
      });

      render(
          <Router>
              <Supervisor/>
          </Router>
      );

      await waitFor(() => {
          expect(screen.getByTestId('delete')).toBeInTheDocument();
          fireEvent.click(screen.getByTestId('delete'));
          expect(screen.getByTestId('dialog')).toBeInTheDocument();

          const deletebutton = screen.getByTestId('deletebutton');
          expect(deletebutton).toBeInTheDocument();
          
          fireEvent.click(deletebutton);
          expect(adminServices.DeleteSuperVisor).toHaveBeenCalled();
      });
    });

    test('deleting supervisors fails', async() => {

      const mockedResponse = {
          results: [
                  { id: 1, first_name: 'Supervisor1', email : 'supervisor1@test.com', status : 'active'},
              ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
      };
  
      adminServices.ListSupervisor.mockResolvedValue({
          data: mockedResponse,
      });

      const mockError = {
        response : {
          data : {
            message : 'Error while deleting reviews'
          }
        }
      }
  
      adminServices.DeleteSuperVisor.mockRejectedValue(mockError);

      render(
          <Router>
              <Supervisor/>
          </Router>
      );

      await waitFor(() => {
          expect(screen.getByTestId('delete')).toBeInTheDocument();
          fireEvent.click(screen.getByTestId('delete'));
          expect(screen.getByTestId('dialog')).toBeInTheDocument();

          const deletebutton = screen.getByTestId('deletebutton');
          expect(deletebutton).toBeInTheDocument();
          
          fireEvent.click(deletebutton);
          expect(adminServices.DeleteSuperVisor).toHaveBeenCalled();
      });
    });
});

test('handles error when listing supervisors', async () => {
  const errorMessage = 'Error while fetching supervisors';
  adminServices.ListSupervisor.mockRejectedValue({ response: { data: { message: errorMessage } } });

  render(
    <Router>
      <Supervisor />
    </Router>
  );

  await waitFor(() => {
    expect(adminServices.ListSupervisor).toHaveBeenCalled();
    expect(adminServices.ListSupervisor).toHaveBeenCalledTimes(1);
  });

  await waitFor(() => {
    const alertElement = screen.queryByText(errorMessage);
    expect(alertElement).not.toBeInTheDocument(); 
  });
});
