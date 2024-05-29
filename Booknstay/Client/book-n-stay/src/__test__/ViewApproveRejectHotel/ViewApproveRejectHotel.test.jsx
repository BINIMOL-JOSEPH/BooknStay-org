import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ViewHotel from '../../components/ViewApproveRejectHotel/ViewApproveRejectHotel';
import Swal from 'sweetalert2';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { hotelService } from '../../HotelService';

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

jest.mock('../../HotelService', () => ({
  hotelService: {
    ViewHotel: jest.fn(),
    ApproveHotel: jest.fn(),
    RejectHotel: jest.fn(),
    SuspendHotel: jest.fn(),
    DeleteHotel: jest.fn(),
  },
}));

jest.setTimeout(20000);

beforeEach(() => {
    jest.clearAllMocks();
  });

const mockHotelData = [
    {
      hotel_details:{
        id: 1, hotel_name: 'John', email: 'motel6@gmail.com', license_number: '21-1234-9090',
        phone_number: '9876788909', address: 'Taj towers', city: 'Pathanapuram', district: 'Kollam',
        state: 'Kerala', pincode: '678768', service_charge: '1345.87', description: 'Food and accommodation',
        date_joined: '2023-12-20', status: 'inactive'
      },
    },
  ];

  const mockActiveHotelData = [
    {
      hotel_details:{
        id: 1, hotel_name: 'John', email: 'motel6@gmail.com', license_number: '21-1234-9090',
        phone_number: '9876788909', address: 'Taj towers', city: 'Pathanapuram', district: 'Kollam',
        state: 'Kerala', pincode: '678768', service_charge: '1345.87', description: 'Food and accommodation',
        date_joined: '2023-12-20', status: 'active'
      },
    },
  ];

  const mockSuspendedHotelData = [
    {
      hotel_details:{
        id: 1, hotel_name: 'John', email: 'motel6@gmail.com', license_number: '21-1234-9090',
        phone_number: '9876788909', address: 'Taj towers', city: 'Pathanapuram', district: 'Kollam',
        state: 'Kerala', pincode: '678768', service_charge: '1345.87', description: 'Food and accommodation',
        date_joined: '2023-12-20', status: 'suspended'
      },
    },
  ];


describe('ListHotels', () => {
    it('renders the list with data correctly', async () => {
        
        jest.spyOn(hotelService, 'ViewHotel').mockResolvedValue({
            data: mockHotelData,
        });
    
        render(<MemoryRouter><ViewHotel /></MemoryRouter>);
        await waitFor(() => {
            const email = screen.getByText('Email');
            expect(email).toBeInTheDocument();

            const status = screen.getByText('inactive');
            expect(status).toBeInTheDocument();

            const approve = screen.getByText('Approve');
            expect(approve).toBeInTheDocument();

            const reject = screen.getByText('Reject');
            expect(reject).toBeInTheDocument();

    });
});

it('handles hotel approval', async () => {
    jest.spyOn(hotelService, 'ViewHotel').mockResolvedValue({
        data: mockHotelData,
      });
  

    render(<MemoryRouter><ViewHotel /></MemoryRouter>);

    await waitFor(() => {
      const email = screen.getByText('Email');
      expect(email).toBeInTheDocument();

      const status = screen.getByText('inactive');
      expect(status).toBeInTheDocument();

      const approve = screen.getByText('Approve');
      expect(approve).toBeInTheDocument();
    });

    hotelService.ApproveHotel.mockResolvedValue({
        data: {
            message: 'Hotel approved successfully',
        },
    });

    await act(async () => {
        fireEvent.click(screen.getByTestId('approve'));
        await waitFor(() => {
          expect(Swal.fire).toHaveBeenCalledWith({
            position: 'top',
            icon: 'success',
            title: 'Hotel approved successfully',
            showConfirmButton: false,
            timer: 5000,
          });
        });
      });
  });

  it('handles hotel reject', async () => {
    jest.spyOn(hotelService, 'ViewHotel').mockResolvedValue({
        data: mockHotelData,
      });
  

    render(<MemoryRouter><ViewHotel /></MemoryRouter>);

    await waitFor(() => {
      const email = screen.getByText('Email');
      expect(email).toBeInTheDocument();

        const reject = screen.getByText('Reject');
        expect(reject).toBeInTheDocument();
    });

    hotelService.RejectHotel.mockResolvedValue({
        data: {
            message: 'Hotel rejected successfully',
        },
    });

    await act(async () => {
        fireEvent.click(screen.getByTestId('reject'));
        await waitFor(() => {
          expect(Swal.fire).toHaveBeenCalledWith({
            position: 'top',
            icon: 'success',
            title: 'Hotel rejected successfully',
            showConfirmButton: false,
            timer: 5000,
          });
        });
      });
  });

it('renders the list with no data', async () => {
    const errorMessage = 'No data found';
    jest.spyOn(hotelService, 'ViewHotel').mockRejectedValue({
        response: {
            data: {
                message: errorMessage,
            },
        },
      });

    render(<MemoryRouter><ViewHotel /></MemoryRouter>);
    await waitFor(() => {
        const error = screen.getByText(errorMessage);
        expect(error).toBeInTheDocument();

});
});

it('renders the list with incorrect data format', async () => {
    const errorMessage = 'Data is not received in the correct format';
    jest.spyOn(hotelService, 'ViewHotel').mockResolvedValue({
        response: {
            data: {
                id: 1,
                hotel_name: 'John',
                email: 'motel6@gmail.com',
                license_number: '21-1234-9090',
                phone_number: '9876788909',
                address: 'Taj towers',
                city: 'Pathanapuram',
                district: 'Kollam',
                state: 'Kerala',
                pincode: '678768',
                service_charge: '1345.87',
                description: 'Food and accommodation',
                date_joined: '2023-12-20',
                status: 'inactive'
            },
        },
      });

    render(<MemoryRouter><ViewHotel /></MemoryRouter>);
    await waitFor(() => {
        const error = screen.getByText(errorMessage);
        expect(error).toBeInTheDocument();

});
});


it('handles hotel approval error message', async () => {
  jest.spyOn(hotelService, 'ViewHotel').mockResolvedValue({
    data: mockHotelData,
  });

  render(<MemoryRouter><ViewHotel /></MemoryRouter>);

  await waitFor(() => {
    const email = screen.getByText('Email');
    expect(email).toBeInTheDocument();

    const approve = screen.getByText('Approve');
    expect(approve).toBeInTheDocument();
  });

  hotelService.ApproveHotel.mockRejectedValue({
    response: {
      data: {
        message: 'Hotel approval failed',
      },
    },
  });

  await act(async () => {
    fireEvent.click(screen.getByTestId('approve'));
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        position: 'top',
        icon: 'error',
        title: 'Hotel approval failed',
        showConfirmButton: false,
        timer: 5000,
      });
    });
  });
});

it('handles hotel reject error message', async () => {
  jest.spyOn(hotelService, 'ViewHotel').mockResolvedValue({
    data: mockHotelData,
  });

  render(<MemoryRouter><ViewHotel /></MemoryRouter>);

  await waitFor(() => {
    const email = screen.getByText('Email');
    expect(email).toBeInTheDocument();

    const reject = screen.getByText('Reject');
    expect(reject).toBeInTheDocument();
  });

  hotelService.RejectHotel.mockRejectedValue({
    response: {
      data: {
        message: 'Hotel rejection failed',
      },
    },
  });

  await act(async () => {
    fireEvent.click(screen.getByTestId('reject'));
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        position: 'top',
        icon: 'error',
        title: 'Hotel rejection failed',
        showConfirmButton: false,
        timer: 5000,
      });
    });
  });
});

it('handles hotel suspend button click', async () => {
  jest.spyOn(hotelService, 'ViewHotel').mockResolvedValue({
      data: mockActiveHotelData,
    });


  render(<MemoryRouter><ViewHotel /></MemoryRouter>);

  await waitFor(() => {
    const email = screen.getByText('Email');
    expect(email).toBeInTheDocument();

      const suspend = screen.getByText('Suspend');
      expect(suspend).toBeInTheDocument();
      fireEvent.click(suspend)
  });
});

  it('handles hotel delete button click', async () => {
    jest.spyOn(hotelService, 'ViewHotel').mockResolvedValue({
        data: mockSuspendedHotelData,
      });
  
  
    render(<MemoryRouter><ViewHotel /></MemoryRouter>);
  
    await waitFor(() => {
      const email = screen.getByText('Email');
      expect(email).toBeInTheDocument();
  
        const deleteButton = screen.getByText('Delete');
        expect(deleteButton).toBeInTheDocument();
        fireEvent.click(deleteButton)
    });
  
});

it('handles hotel activate button click', async () => {
  jest.spyOn(hotelService, 'ViewHotel').mockResolvedValue({
      data: mockSuspendedHotelData,
    });


  render(<MemoryRouter><ViewHotel /></MemoryRouter>);

  await waitFor(() => {
    const email = screen.getByText('Email');
    expect(email).toBeInTheDocument();

      const activate = screen.getByText('Activate');
      expect(activate).toBeInTheDocument();
      fireEvent.click(activate)
  });

});

});

