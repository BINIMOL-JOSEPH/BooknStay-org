import React from 'react';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentCalculation from '../../components/Payment/PaymentCalculation';
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
  
  jest.mock('../../interceptor', () => ({
    axiosPrivate: {
      get: jest.fn(),
    },
  }));

  jest.mock('@stripe/react-stripe-js', () => ({
    useStripe: jest.fn(),
    useElements: jest.fn()
  }));
  
  
  jest.mock('../../HotelService', () => ({
    hotelService: {
        PaymentDetails: jest.fn(),
        PaymentConfirmation: jest.fn(),
        PaymentCheckout: jest.fn()
    },
  }));
  
  jest.setTimeout(20000);
  
  beforeEach(() => {
      jest.clearAllMocks();
    });
  
  describe('Payment form', () => {
    it('renders the form with data correctly', async () => {
        jest.spyOn(hotelService, 'PaymentDetails').mockResolvedValue({
          data: {
                room_rate: 1000,
                gst_amount:120,
                service_charge: 500,
                total_payment: 1620,
              },
        });
    
        render(<MemoryRouter><PaymentCalculation /> </MemoryRouter>);
        await waitFor(() => {
          expect(screen.getByText('Payment Details')).toBeInTheDocument();
          expect(screen.getByText('Room Rate')).toBeInTheDocument();
          expect(screen.getByText('GST Amount')).toBeInTheDocument();
          expect(screen.getByText('Service Charge')).toBeInTheDocument();
          expect(screen.getByText('Total Amount')).toBeInTheDocument();
    
          expect(screen.getByText('1000')).toBeInTheDocument();
          expect(screen.getByText('120')).toBeInTheDocument();
          expect(screen.getByText('500')).toBeInTheDocument();
          expect(screen.getByText('1620')).toBeInTheDocument();
        });
      });

      it('should handle fetch errors', async () => {
        const errorMessage = 'Unable to retrieve the payment data.';
        hotelService.PaymentDetails = jest.fn().mockRejectedValueOnce({ response: { data: { message: errorMessage } } });
      
        render(<MemoryRouter><PaymentCalculation /></MemoryRouter>);
      
        await waitFor(() => {
          expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
      });

      it('renders make payment button click and confirm cash payment', async () => {
        jest.spyOn(hotelService, 'PaymentDetails').mockResolvedValue({
          data: {
                room_rate: 1000,
                gst_amount:120,
                service_charge: 500,
                total_payment: 1620,
              },
        });
    
        render(<MemoryRouter><PaymentCalculation /> </MemoryRouter>);
        await waitFor(() => {

          const paymentButton = screen.getByTestId('make-payment')
          expect(paymentButton).toBeInTheDocument();

          fireEvent.click(paymentButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Payment Method')).toBeInTheDocument();
            expect(screen.getByTestId('radio-stack')).toBeInTheDocument();
            
            const cashOption = screen.getByTestId('cash-option')
            expect(cashOption).toBeInTheDocument();

            fireEvent.click(cashOption)
        });

        await waitFor(()=>{
            expect(screen.getByText('You can confirm your payment')).toBeInTheDocument();

            const confirmButton = screen.getByTestId('confirm-button')
            expect(confirmButton).toBeInTheDocument();

            hotelService.PaymentConfirmation.mockResolvedValue({
                data: {
                    message: 'Booking confirmed successfully!',
                },
            });

            fireEvent.click(confirmButton);

        });
        await waitFor(() => {
            expect(hotelService.PaymentConfirmation).toHaveBeenCalled();

            expect(screen.getByText('Booking confirmed successfully!')).toBeInTheDocument();
        });

        const confirmButton = screen.getByTestId('confirm-button')

        hotelService.PaymentConfirmation.mockRejectedValueOnce({
                data: {
                    message: 'Unable to retrieve the data',
                },
            });

            fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(hotelService.PaymentConfirmation).toHaveBeenCalled();

            expect(screen.getByText('Unable to retrieve the payment data.')).toBeInTheDocument();
        });
      });

      it('select card payment', async () => {
        jest.spyOn(hotelService, 'PaymentDetails').mockResolvedValue({
          data: {
                room_rate: 1000,
                gst_amount:120,
                service_charge: 500,
                total_payment: 1620,
              },
        });
    
        render(<MemoryRouter><PaymentCalculation /> </MemoryRouter>);
        await waitFor(() => {

          const paymentButton = screen.getByTestId('make-payment')
          expect(paymentButton).toBeInTheDocument();

          fireEvent.click(paymentButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Payment Method')).toBeInTheDocument();
            expect(screen.getByTestId('radio-stack')).toBeInTheDocument();
            
            const cardOption = screen.getByTestId('card-option')
            expect(cardOption).toBeInTheDocument();

            fireEvent.click(cardOption)
        });

        await waitFor(() => {
          const checkoutForm = screen.getByTestId('checkout-form');
          expect(checkoutForm).toBeInTheDocument();

        });
        await waitFor(() => {
          hotelService.PaymentCheckout.mockResolvedValue({
            data: {
              clientSecret: "pi_3OhPEkSH5Ttsih9112vkycqJ_secret_FNJQ2Y9QhqP97I3TMJUy2XzA8",
            },
        });
        });
        // await waitFor(() => {
        //   const checkoutBox = screen.getByTestId('checkout-box');
        //   expect(checkoutBox).toBeInTheDocument();

        // });
       });


  });