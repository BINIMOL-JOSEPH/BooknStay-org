import React from 'react';
import { render, waitFor, screen, fireEvent} from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Swal from 'sweetalert2';
import '@testing-library/jest-dom';
import ListReviewByUser from '../../components/UpdateReviews/ListReviews';
import { userService } from '../../UserService';

const localStorageMock = {
  getItem: jest.fn(()  => '{"user": {"userType": "customer", "first_name": "customer"}}'),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));

jest.mock('../../UserService', () => ({
    userService: {
        GetReview: jest.fn(),
        DeleteReview: jest.fn()
    },
}));

jest.setTimeout(20000);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('test listing reviews for user components', () => {

    test('render page components', () => {
        render(
            <Router>
                <ListReviewByUser/>
            </Router>
        );
    });

    test('display cards when data is available', async () => {

        userService.GetReview.mockResolvedValue({
            data: [
              {
                id: 1,
                rating: 5,
                hotel_name: 'Hotel',
                title: 'Great Experience',
                comment: 'Awesome place to stay',
                created_at: '2024-01-23',
                image_urls:[
                    '/review_images/20240327040312_image.jpg'
                ]
              },
            ],
        });

        render(
            <Router>
                <ListReviewByUser/>
            </Router>
        );
        
        await waitFor(() => {
            expect(screen.getByTestId('card')).toBeInTheDocument();

            const deleteIcon = screen.getByTestId('delete-icon');
            expect(deleteIcon).toBeInTheDocument();
        });
    
        expect(screen.getByText('Hotel')).toBeInTheDocument();
        expect(screen.getByText('Great Experience')).toBeInTheDocument();
        expect(screen.getByText('Awesome place to stay')).toBeInTheDocument();
    });


    test('successfully deletes reviews', async () => {

        userService.GetReview.mockResolvedValue({
            data: [
              {
                id: 1,
                rating: 5,
                hotel_name: 'Hotel',
                title: 'Great Experience',
                comment: 'Awesome place to stay',
                created_at: '2024-01-23',
                image_urls: []
              },
            ],
        });

        render(
            <Router>
                <ListReviewByUser/>
            </Router>
        );
        
        await waitFor(() => {
            expect(screen.getByTestId('card')).toBeInTheDocument();

            const deleteButton = screen.getByTestId('delete-icon');
            expect(deleteButton).toBeInTheDocument();

            fireEvent.click(deleteButton);

            const deleteConfirmButton = screen.getByTestId('delete-confirm');
            expect(deleteConfirmButton).toBeInTheDocument();

            fireEvent.click(deleteConfirmButton)

            expect(userService.DeleteReview).toHaveBeenCalledTimes(1);
        });
    });

    test('close dialog box on clicking cancel button', async() => {
        userService.GetReview.mockResolvedValue({
            data: [
              {
                id: 1,
                rating: 5,
                hotel_name: 'Hotel',
                title: 'Great Experience',
                comment: 'Awesome place to stay',
                created_at: '2024-01-23',
                image_urls: []
              },
            ],
        });

        render(
            <Router>
                <ListReviewByUser/>
            </Router>
        );
        
        await waitFor(() => {
            expect(screen.getByTestId('card')).toBeInTheDocument();

            const deleteButton = screen.getByTestId('delete-icon');
            expect(deleteButton).toBeInTheDocument();

            fireEvent.click(deleteButton);

            const cancelButton = screen.getByTestId('cancelbutton');
            expect(cancelButton).toBeInTheDocument();

            fireEvent.click(cancelButton)

            expect(userService.DeleteReview).not.toHaveBeenCalledTimes(1);
        });
    })
});
