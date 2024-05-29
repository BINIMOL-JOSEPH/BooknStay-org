import React from 'react';
import { render, waitFor, screen, fireEvent} from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Swal from 'sweetalert2';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { hotelService } from '../../HotelService';
import ListReviewByHotels from '../../components/ListReviewsByHotels/ListReviewsByHotels';


const localStorageMock = {
    getItem: jest.fn(()  => '{"user": {"userType": "hotel", "first_name": "hotel"}}'),
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
        FetchReviewsByHotels: jest.fn(),
        AddFeedbacks: jest.fn()
    },
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('test listing reviews for hotel components', () => {

    test('render page components', () => {
        render(
            <Router>
                <ListReviewByHotels/>
            </Router>
        );
    });

    test('display reviews when data is available', async () => {

        const mockReviews = [
            {   id: 1,
                rating: 5,
                customer_name: 'customer@gmail.com',
                title: 'Great Experience',
                comment: 'Awesome place to stay',
                created_at: '2024-01-23'
            },
        ]

        hotelService.FetchReviewsByHotels.mockResolvedValue({data : mockReviews});

        render(
            <Router>
                <ListReviewByHotels/>
            </Router>
        );
        
        await waitFor(() => {
            expect(screen.getByTestId('card')).toBeInTheDocument();

            const replyIcon = screen.getByTestId('reply-icon');
            expect(replyIcon).toBeInTheDocument();
        });
    
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('customer@gmail.com')).toBeInTheDocument();
        expect(screen.getByText('Great Experience')).toBeInTheDocument();
        expect(screen.getByText('Awesome place to stay')).toBeInTheDocument();
    });

    test('display message when no reviews are available', async () => {

        const mockReviews = {
            response : {
                data : {
                    message : 'Failed to fetch reviews'
                }
            }
        }

        hotelService.FetchReviewsByHotels.mockRejectedValue(mockReviews);

        render(
            <Router>
                <ListReviewByHotels/>
            </Router>
        );
        
        await waitFor(() => {
            expect(screen.getByText('Oops! No data found')).toBeInTheDocument();
        });
    });

    test('add feedback and display success message', async () => {
        
        const mockReviews = [
            {   id: 1,
                rating: 5,
                customer_name: 'customer@gmail.com',
                title: 'Great Experience',
                comment: 'Awesome place to stay',
                created_at: '2024-01-23'
            },
        ]
      
        hotelService.FetchReviewsByHotels.mockResolvedValue({data : mockReviews});

        hotelService.AddFeedbacks.mockResolvedValue({ 
            data: { 
                message: 'Feedback added successfully' 
            } 
        });

        render(
            <Router>
                <ListReviewByHotels/>
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByTestId('card')).toBeInTheDocument();

            const replyIcon = screen.getByTestId('reply-icon');
            expect(replyIcon).toBeInTheDocument();

            fireEvent.click(replyIcon);

            expect(screen.getByTestId('dialog')).toBeInTheDocument();

            const feedbackInput = screen.getByLabelText('Feedbacks');
            expect(feedbackInput).toBeInTheDocument();
            userEvent.type(feedbackInput, 'Thank you for the support');

            const addFeedback = screen.getByTestId('add-feedbacks');
            expect(addFeedback).toBeInTheDocument();
            fireEvent.click(addFeedback)
        });
    });

    test('shows error message when feedback adding fails', async() => {

        const errorResponse = {
            response : {
                data : {
                    message : 'Failed to add feedbacks'
                }
            }
        }

        const mockReviews = [
            {   id: 1,
                rating: 5,
                customer_name: 'customer@gmail.com',
                title: 'Great Experience',
                comment: 'Awesome place to stay',
                created_at: '2024-01-23'
            },
        ]
      
        hotelService.FetchReviewsByHotels.mockResolvedValue({data : mockReviews});

        hotelService.AddFeedbacks.mockRejectedValue(errorResponse);

        render(
            <Router>
                <ListReviewByHotels/>
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByTestId('card')).toBeInTheDocument();

            const replyIcon = screen.getByTestId('reply-icon');
            expect(replyIcon).toBeInTheDocument();

            fireEvent.click(replyIcon);

            expect(screen.getByTestId('dialog')).toBeInTheDocument();

            const feedbackInput = screen.getByLabelText('Feedbacks');
            expect(feedbackInput).toBeInTheDocument();
            userEvent.type(feedbackInput, 'Thank you for the support');

            const addFeedback = screen.getByTestId('add-feedbacks');
            expect(addFeedback).toBeInTheDocument();
            fireEvent.click(addFeedback)

            expect(hotelService.AddFeedbacks).toHaveBeenCalled();
        });
    });

    test('display error message for blank feedback', async () => {

        const mockReviews = [
            {   id: 1,
                rating: 5,
                customer_name: 'customer@gmail.com',
                title: 'Great Experience',
                comment: 'Awesome place to stay',
                created_at: '2024-01-23'
            },
        ]

        hotelService.FetchReviewsByHotels.mockResolvedValue({data : mockReviews});

        render(
            <Router>
                <ListReviewByHotels/>
            </Router>
        );
        
        await waitFor(() => {
            expect(screen.getByTestId('card')).toBeInTheDocument();

            const replyIcon = screen.getByTestId('reply-icon');
            expect(replyIcon).toBeInTheDocument();

            fireEvent.click(replyIcon);

            expect(screen.getByTestId('dialog')).toBeInTheDocument();

            const blankFeedbacks = screen.getByRole('textbox');
            expect(blankFeedbacks).toBeInTheDocument();

            userEvent.type(blankFeedbacks, 'Thank you for the support !');
            expect(blankFeedbacks.value).toBe('Thank you for the support !');
        });
    });
});
