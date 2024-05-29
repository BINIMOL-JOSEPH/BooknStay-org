import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils'; 
import { adminServices } from '../../AdminService';
import AdminNotifications from '../../components/Notifications/AdminNotifications';
jest.mock('../../AdminService', () => ({
    adminServices: {
      AdminNotifications: jest.fn(() =>
      Promise.resolve({
          data: {
            next: 'https://example.com/nextPage',
            previous: 'fakePrevious',
              results: [
                  { id: 1, message: 'Notification 1', is_customer_favorite: true },
                  { id: 2, message: 'Notification 2', is_customer_favorite: false },
                  { id: 3, message: 'Notification 3', is_customer_favorite: true },
              ],
          },
      })
  ),        DeleteNotifications: jest.fn(),
    ToggleFavoriteNotification: jest.fn(),
  },
}))
jest.mock('axios', () => ({
  create: jest.fn(() => ({
      interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() },
      },
      get: jest.fn(() => Promise.resolve({ data: { /* Mock response data */ } })),
  })),
}));
describe('Adminnotiifcations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notifications correctly when there is data', async () => {
    const notificationsData = {
      data: {
        results: [
          { id: 1, message: 'Notification 1', is_admin_favorite: false, created_at: '2024-03-18 10:00:00' },
          { id: 2, message: 'Notification 2', is_admin_favorite: true, created_at: '2024-03-18 11:00:00' },
        ],
      },
    };
    adminServices.AdminNotifications.mockResolvedValueOnce(notificationsData);

    render(<MemoryRouter><AdminNotifications /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Notification 2')).toBeInTheDocument();
    });
  });

 

  it('deletes notification when delete button is clicked', async () => {
    const notificationsData = {
      data: {
        results: [{ id: 1, message: 'Notification 1', is_customer_favorite: false, created_at: '2024-03-18 10:00:00' }],
      },
    };
    adminServices.AdminNotifications.mockResolvedValueOnce(notificationsData);

    render(<MemoryRouter><AdminNotifications /></MemoryRouter>);

    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-button-1');
      fireEvent.click(deleteButton);
    });

    expect(adminServices.DeleteNotifications).toHaveBeenCalledWith(1);
  });

  it('toggles favorite status when star icon is clicked', async () => {
    const notificationsData = {
      data: {
        results: [{ id: 1, message: 'Notification 1', is_customer_favorite: false, created_at: '2024-03-18 10:00:00' }],
      },
    };
    adminServices.AdminNotifications.mockResolvedValueOnce(notificationsData);

    render(<MemoryRouter><AdminNotifications /></MemoryRouter>);

    await waitFor(() => {
      const starIcon = screen.getByTestId('star-icon-1');
      fireEvent.click(starIcon);
    });

    expect(adminServices.ToggleFavoriteNotification).toHaveBeenCalledWith(1);
  });
});


it('filters notifications correctly', async () => {
    const notificationsData = {
      data: {
        results: [
          { id: 1, message: 'Notification 1', is_admin_favorite: true },
          { id: 2, message: 'Notification 2', is_admin_favorite: false },
          { id: 3, message: 'Notification 3', is_admin_favorite: true },
        ],
      },
    };
    adminServices.AdminNotifications.mockResolvedValueOnce(notificationsData);

    render(<MemoryRouter><AdminNotifications /></MemoryRouter>);

    await act(async () => {
    });

    expect(screen.getByText('Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Notification 2')).toBeInTheDocument();
    expect(screen.getByText('Notification 3')).toBeInTheDocument();

    act(() => {
      screen.getByText('Favorites').click();
    });

    expect(screen.getByText('Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Notification 3')).toBeInTheDocument();
    expect(screen.queryByText('Notification 2')).not.toBeInTheDocument();
  });
  it('handles previous button clicks', async () => {
    const { getByTestId } = render(<MemoryRouter><AdminNotifications /></MemoryRouter>);
    await waitFor(() => {});

    const axiosPrivateGetMock = jest.spyOn(require('../../interceptor').axiosPrivate, 'get');
    fireEvent.click(getByTestId('previous'));

    await waitFor(() => {
        expect(axiosPrivateGetMock).toHaveBeenCalledWith('fakePrevious');
    });
});
it('handles next button clicks', async () => {
  const { getByTestId } = render(<MemoryRouter><AdminNotifications /></MemoryRouter>);
  await waitFor(() => {});

  const axiosPrivateGetMock = jest.spyOn(require('../../interceptor').axiosPrivate, 'get');
  fireEvent.click(getByTestId('next'));

  await waitFor(() => {
    expect(axiosPrivateGetMock).toHaveBeenCalledWith('https://example.com/nextPage');
});
});
it('opens and closes modal when notification message is clicked', async () => {
  render(<MemoryRouter><AdminNotifications /></MemoryRouter>);
  
  const notificationsData = {
    data: {
      results: [
        { id: 1, message: 'Notification 1', is_admin_favorite: false, created_at: '2024-03-18 10:00:00' },
        { id: 2, message: 'Notification 2', is_admin_favorite: true, created_at: '2024-03-18 11:00:00' },
      ],
    },
  };
  adminServices.AdminNotifications.mockResolvedValueOnce(notificationsData);
  
  await waitFor(() => {
    expect(screen.getByText('Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Notification 2')).toBeInTheDocument();
  });  
  
  fireEvent.click(screen.getByText('Notification 1'));
  fireEvent.click(screen.getByTestId('close'));

  await waitFor(() => {
    expect(screen.queryByText('New booking to hotel')).not.toBeInTheDocument();
  });
});
