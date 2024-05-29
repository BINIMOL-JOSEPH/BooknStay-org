import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ListCustomer from '../../components/ListCustomer/ListCustomer';
import '@testing-library/jest-dom';
import { userService } from '../../UserService';
import { axiosPrivate } from '../../interceptor';
import { adminServices } from '../../AdminService';
import { List } from '@mui/material';
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

jest.mock('../../AdminService', () => ({
    adminServices: {
        ActivateCustomer: jest.fn(),
    },
}));

jest.mock('../../UserService', () => ({
    userService: {
        FetchUser: jest.fn(),
        FetchUserByStatus: jest.fn()
    },
}));

jest.setTimeout(20000);

beforeEach(() => {
    jest.clearAllMocks();
  });

describe('ListCustomers', () => {
    it('renders the table with data correctly', async () => {
        jest.spyOn(userService, 'FetchUser').mockResolvedValue({
          data: {
            results: [
              {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                phone_number: '123-456-7890',
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
            <ListCustomer />
          </MemoryRouter>);
        await waitFor(() => {
          expect(screen.getByText('SI. No')).toBeInTheDocument();
          expect(screen.getByText('First Name')).toBeInTheDocument();
          expect(screen.getByText('Last Name')).toBeInTheDocument();
          expect(screen.getByText('Email')).toBeInTheDocument();
          expect(screen.getByText('Phone Number')).toBeInTheDocument();
          expect(screen.getByText('Date Joined')).toBeInTheDocument();
          expect(screen.getByText('Status')).toBeInTheDocument();
          expect(screen.getByText('Updated On')).toBeInTheDocument();
          expect(screen.getByText('Action')).toBeInTheDocument();
    
          expect(screen.getByText('John')).toBeInTheDocument();
          expect(screen.getByText('Doe')).toBeInTheDocument();
          expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
          expect(screen.getByText('123-456-7890')).toBeInTheDocument();
          expect(screen.getByText('2023-01-01')).toBeInTheDocument();
          expect(screen.getByText('active')).toBeInTheDocument();
          expect(screen.getByText('2023-01-02')).toBeInTheDocument();
    
        });
      });

      it('handles next button click', async () => {
        const mockedResponse = {
            results: [{ id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com' },
                    { id: 2, first_name: 'Tommy', last_name: 'Doe', email: 'tommy@test.com' } ,
                    { id: 3, first_name: 'Johny', last_name: 'Doe', email: 'johny@test.com' },
                    { id: 4, first_name: 'Tom', last_name: 'Doe', email: 'tom@test.com' },
                    { id: 5, first_name: 'Jose', last_name: 'Doe', email: 'jose@test.com' },
                    { id: 6, first_name: 'Tony', last_name: 'Doe', email: 'tony@test.com' }  ],
                    
            next: '/api/next-page',
            previous: '/api/prev-page',
          
        };
        userService.FetchUser.mockResolvedValue({
          data: mockedResponse,
        });
         
        axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
    
        render(<MemoryRouter><ListCustomer /></MemoryRouter>);

        await waitFor(() => {
          expect(userService.FetchUser).toHaveBeenCalled();
        });
    
        await waitFor(() => {
            expect(screen.getByText('First Name')).toBeInTheDocument();
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

      it('should handle fetch errors', async () => {
        const errorMessage = 'No users found';
        userService.FetchUser = jest.fn().mockRejectedValueOnce({ response: { data: { message: errorMessage } } });
      
        render(<MemoryRouter><ListCustomer /></MemoryRouter>);
      
      
      });

      it('handles previous button click', async () => {
        const mockedResponse = {
            results: [{ id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com' },
                    { id: 2, first_name: 'Tommy', last_name: 'Doe', email: 'tommy@test.com' } ,
                    { id: 3, first_name: 'Johny', last_name: 'Doe', email: 'johny@test.com' },
                    { id: 4, first_name: 'Tom', last_name: 'Doe', email: 'tom@test.com' },
                    { id: 5, first_name: 'Jose', last_name: 'Doe', email: 'jose@test.com' },
                    { id: 6, first_name: 'Tony', last_name: 'Doe', email: 'tony@test.com' }  ],
                    
            next: null,
            previous: '/api/prev-page',
          
        };
        userService.FetchUser.mockResolvedValue({
          data: mockedResponse,
        });
         
        axiosPrivate.get.mockResolvedValueOnce({ data: mockedResponse });
    
        render(<MemoryRouter><ListCustomer /></MemoryRouter>);

        await waitFor(() => {
          expect(userService.FetchUser).toHaveBeenCalled();
        });
    
        await waitFor(() => {
            expect(screen.getByText('First Name')).toBeInTheDocument();
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

      it('should filter customers based on search query', async () => {
        const mockData = [{ first_name: 'John', last_name: 'Doe' }, { first_name: 'Jane', last_name: 'Smith' }];
        userService.FetchUser = jest.fn().mockResolvedValue({ data: { results: mockData } });
      
        render(<MemoryRouter><ListCustomer /></MemoryRouter>);
      
        await waitFor(() => {
          const searchInput = screen.getByLabelText('Search');
          userEvent.type(searchInput, 'Jane');
          expect(userService.FetchUser).toHaveBeenCalledTimes(5);
          expect(userService.FetchUser).toHaveBeenLastCalledWith({ query: 'Jane' });
          expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
          expect(screen.getByText('Jane')).toBeInTheDocument();
        });
      });

      it('should display data with the selected filter value', async () => {
        const mockedResponse = {
          results: [{ id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com' },
                  { id: 2, first_name: 'Tommy', last_name: 'Doe', email: 'tommy@test.com' } ,
                  { id: 3, first_name: 'Johny', last_name: 'Doe', email: 'johny@test.com' },
                  { id: 4, first_name: 'Tom', last_name: 'Doe', email: 'tom@test.com' },
                  { id: 5, first_name: 'Jose', last_name: 'Doe', email: 'jose@test.com' },
                  { id: 6, first_name: 'Tony', last_name: 'Doe', email: 'tony@test.com' }  ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
        
      };
      userService.FetchUser.mockResolvedValue({
        data: mockedResponse,
      });

        render(<MemoryRouter><ListCustomer /></MemoryRouter>);
        
        userService.FetchUserByStatus.mockResolvedValue({
          data: {
            results: [{ id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com' },
                      { id: 2, first_name: 'Tommy', last_name: 'Doe', email: 'tommy@test.com' } ,
                      { id: 3, first_name: 'Johny', last_name: 'Doe', email: 'johny@test.com' }],
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
          expect(userService.FetchUserByStatus).toHaveBeenCalledWith('active');
        });
      });

      it('should display error message with the selected filter value', async () => {
        const mockedResponse = {
          results: [{ id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com' },
                  { id: 2, first_name: 'Tommy', last_name: 'Doe', email: 'tommy@test.com' } ,
                  { id: 3, first_name: 'Johny', last_name: 'Doe', email: 'johny@test.com' },
                  { id: 4, first_name: 'Tom', last_name: 'Doe', email: 'tom@test.com' },
                  { id: 5, first_name: 'Jose', last_name: 'Doe', email: 'jose@test.com' },
                  { id: 6, first_name: 'Tony', last_name: 'Doe', email: 'tony@test.com' }  ],
                  
          next: '/api/next-page',
          previous: '/api/prev-page',
        
      };
      userService.FetchUser.mockResolvedValue({
        data: mockedResponse,
      });

        render(<MemoryRouter><ListCustomer /></MemoryRouter>);
        const errorMessage = 'No active users found';
        userService.FetchUserByStatus = jest.fn().mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

        await waitFor(() => {
          const selectfield = screen.getByTestId('select-option');
          expect(selectfield).toBeInTheDocument();
          fireEvent.click(selectfield);

          fireEvent.keyDown(selectfield.firstChild, { key: 'ArrowDown' });
        })
        
        await waitFor(() => screen.queryByText('Active'));
        fireEvent.click(screen.getByText('Active'));   
    
        await waitFor(() => {
          expect(userService.FetchUserByStatus).toHaveBeenCalledWith('active');
        });

     

      });

      it('renders the table with data correctly to suspend customer', async () => {
        jest.spyOn(userService, 'FetchUser').mockResolvedValue({
          data: {
            results: [
              {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                phone_number: '123-456-7890',
                date_joined: '2023-01-01',
                status: 'active',
                updated_on: '2023-01-02',
              },
            ],
            next: null,
            previous: null,
          },
        });
      
        render(
          <MemoryRouter>
            <ListCustomer />
          </MemoryRouter>
        );
      
        await waitFor(() => {
          expect(screen.getByTestId('more-icon')).toBeInTheDocument();
        });
      
        fireEvent.click(screen.getByTestId('more-icon'));
      
        await waitFor(() => {
          expect(screen.getByTestId('suspend')).toBeInTheDocument();
        });
      
        fireEvent.click(screen.getByTestId('suspend'));
      
        await waitFor(() => {
          expect(window.location.pathname).toBe('/');
        });

        await waitFor(() => {
          expect(screen.getByTestId('delete')).toBeInTheDocument();
        });
      
        fireEvent.click(screen.getByTestId('delete'));
      
        await waitFor(() => {
          expect(window.location.pathname).toBe('/');
        });
      });

      it('renders the table with data correctly to activate customer', async () => {
        jest.spyOn(userService, 'FetchUser').mockResolvedValue({
          data: {
            results: [
              {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                phone_number: '123-456-7890',
                date_joined: '2023-01-01',
                status: 'suspended',
                updated_on: '2023-01-02',
              },
            ],
            next: null,
            previous: null,
          },
        });
      
        render(
          <MemoryRouter>
            <ListCustomer />
          </MemoryRouter>
        );
      
        await waitFor(() => {
          expect(screen.getByTestId('more-icon')).toBeInTheDocument();
        });
      
        fireEvent.click(screen.getByTestId('more-icon'));
      
        await waitFor(() => {
          expect(screen.getByTestId('activate')).toBeInTheDocument();
        });
      
        fireEvent.click(screen.getByTestId('activate'));
      
        await waitFor(() => {
          expect(window.location.pathname).toBe('/');
        });
      });
      
});

it('closes the menu when handleClose is called', async () => {
  const userData = {
    results: [
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '123-456-7890',
        date_joined: '2023-01-01',
        status: 'active',
        updated_on: '2023-01-02',
      },
    ],
    next: null,
    previous: null,
  };

  userService.FetchUser.mockResolvedValue({
    data: userData,
  });
  render(
    <MemoryRouter>
      <ListCustomer />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByTestId('more-icon')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId('more-icon'));
  await waitFor(() => {
    expect(screen.getByTestId('suspend')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('suspend'));

  expect(userService.FetchUser).toHaveBeenCalledWith({ query: '' });
  expect(screen.queryByTestId(`simple-menu-1`)).toBeNull();
});