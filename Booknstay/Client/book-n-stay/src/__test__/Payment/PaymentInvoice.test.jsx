import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { hotelService } from '../../HotelService';
import PaymentInvoice from '../../components/Payment/PaymentInvoice';
import InvoiceDownload from '../../components/Payment/InvoicePrevire';

const localStorageMock = {
    getItem: jest.fn(()  => '{"user": {"userType": "customer", "first_name": "admin"}}'),
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
    FetchPaymentInvoice: jest.fn(),
    DownloadPaymentInvoice: jest.fn(),
  },
}));

jest.setTimeout(20000);

beforeEach(() => {
    jest.clearAllMocks();
  });

describe('PaymentInvoice', () => {
    it('renders the invoice with data correctly', async () => {
        jest.spyOn(hotelService, 'FetchPaymentInvoice').mockResolvedValue({
            data: {
                booking:{
                    guest_name:'test',
                    booked_at:'2024-12-12',
                    status:'confirmed'
                },
                payment:{
                    payment_method:'cash',
                    status:'confirmed',
                    amount:'25000'
                },
                hotel:{
                    hotel_name:'Test Hotels',
                    email:'test@hotel.co',
                    phone_number:'4325232112'
                }
            },
          });
          render(<MemoryRouter><PaymentInvoice /></MemoryRouter>);
          await waitFor(() => {
              const paymentMethod = screen.getByTestId('payment-method');
              expect(paymentMethod).toBeInTheDocument();
          });

          const downloadButton = screen.getByTestId('download');
          expect(downloadButton).toBeInTheDocument();

          fireEvent.click(downloadButton);


    });

    it('renders unable to retrieve data correctly', async () => {
        const errorMessage = "Unable to retrieve the data"
        jest.spyOn(hotelService, 'FetchPaymentInvoice').mockRejectedValueOnce(
            { response: { data: { message: errorMessage } } });
          render(<MemoryRouter><PaymentInvoice /></MemoryRouter>);
          await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
          });

    });

    it('renders the invoice preview correctly', async () => {
        const successMessage = "Success"
        jest.spyOn(hotelService, 'DownloadPaymentInvoice').mockResolvedValue(
            { response: { data: { message: successMessage } } });
          render(<MemoryRouter><InvoiceDownload /></MemoryRouter>);
          

    });


});