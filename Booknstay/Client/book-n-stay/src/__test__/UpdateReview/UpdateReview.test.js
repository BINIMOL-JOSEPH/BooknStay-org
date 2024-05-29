import React from 'react';
import { render, waitFor, screen, fireEvent, getAllByTestId } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Swal from 'sweetalert2';
import '@testing-library/jest-dom';
import { userService } from '../../UserService';
import { act } from 'react-dom/test-utils';
import ReviewUpdate from '../../components/UpdateReviews/ReviewUpdate';

const localStorageMock = {
    getItem: jest.fn(() => '{"user": {"userType": "customer", "first_name": "customer"}}'),
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
        GetReviewById: jest.fn(),
        UpdateReview: jest.fn()
    },
}));

URL.createObjectURL = jest.fn();

jest.setTimeout(20000);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('test review update components', () => {

    test('render page components', () => {
        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );
    });

    test('fetch review by id', async () => {
        userService.GetReviewById.mockResolvedValue({
            data: [
                {
                    id: 1,
                    rating: 5,
                    hotel_name: 'Hotel',
                    title: 'Great Experience',
                    comment: 'Awesome place to stay',
                    created_at: '2024-01-23',
                },
            ],
        });

        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByTestId('title')).toBeInTheDocument();
        });
    });

    test('display error message when fetching data fails', async () => {

        userService.GetReviewById.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Error while fetching data'
                }
            }
        });

        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        await waitFor(() => {
            expect(userService.GetReviewById).toHaveBeenCalledTimes(1);
            expect(Swal.fire).toHaveBeenCalledWith({
                position: 'top',
                icon: 'error',
                title: 'Error while fetching data',
                showConfirmButton: false,
                timer: 2000,
            });
        });
    });

    test('updates form data on title input change', () => {
        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        const titleInput = screen.getByLabelText(/Title/i);

        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

        expect(screen.getByLabelText(/Title/i).value).toBe('Updated Title');
    });

    test('shows validation error on blank title input change', () => {
        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        const titleInput = screen.getByLabelText(/Title/i);

        fireEvent.change(titleInput, { target: { value: ' ' } });

        const errorMessage = screen.getByText(/Please add a title./i);
        expect(errorMessage).toBeInTheDocument();
    });

    test('updates form data on comment input change', () => {
        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        const commentInput = screen.getByLabelText(/Comment/i);

        fireEvent.change(commentInput, { target: { value: 'Updated Comment' } });

        expect(screen.getByLabelText(/Comment/i).value).toBe('Updated Comment');
    });

    test('shows validation error on blank comment input change', () => {
        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        const commentInput = screen.getByLabelText(/Comment/i);

        fireEvent.change(commentInput, { target: { value: ' ' } });

        const errorMessage = screen.getByText(/Please add a comment./i);
        expect(errorMessage).toBeInTheDocument();
    });

    test('updates form data on rating input change', () => {
        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        const ratingInput = screen.getAllByRole('radio');

        fireEvent.click(ratingInput[2]);

        expect(screen.getAllByRole('radio')[2].checked).toBe(true);
    });


    test('shows success message when review updation is successful', async () => {

        userService.UpdateReview.mockResolvedValueOnce({
            data: {
                message: 'Review updated successfully',
            },
        });

        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        const button = screen.getByTestId('button');
        expect(button).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(button);

            await waitFor(() => {
                expect(userService.UpdateReview).toHaveBeenCalledTimes(1);
                expect(Swal.fire).toHaveBeenCalledWith({
                    position: 'top',
                    icon: 'success',
                    title: 'Review updated successfully',
                    showConfirmButton: false,
                    timer: 2000,
                });
            });
        });
    });

    test('shows error message when review updation is failed', async () => {

        userService.UpdateReview.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Review updation failed'
                }
            }
        });

        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        const button = screen.getByTestId('button');
        expect(button).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(button);

            await waitFor(() => {
                expect(userService.UpdateReview).toHaveBeenCalledTimes(1);
                expect(Swal.fire).toHaveBeenCalledWith({
                    position: 'top',
                    icon: 'error',
                    title: 'Review updation failed',
                    showConfirmButton: false,
                    timer: 2000,
                });
            });
        });

    });

    test('sets image in form data within the limit', () => {
        const mockImageFile = new File(['mock content'], 'mock-image.jpg', { type: 'image/jpeg' });
        const input = document.createElement('input');
        input.type = 'file';

        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );


        const imageContainer = screen.getByTestId('image');
        imageContainer.appendChild(input);

        fireEvent.change(input, { target: { files: [mockImageFile] } });

        expect(screen.getByTestId('closeButton1')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('closeButton1'));
    });

    test('shows error when image size exceeds the maximum allowed limit', () => {
        const mockLargeImageFile = new File(['mock content'.repeat(1024 * 1024 * 2)], 'large-image.jpg', { type: 'image/jpeg' });
        const input = document.createElement('input');
        input.type = 'file';

        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        const image1Container = screen.getByTestId('image');
        image1Container.appendChild(input);

        fireEvent.change(input, { target: { files: [mockLargeImageFile] } });

        const errorMessage = screen.getByText(/File size exceeds the maximum allowed limit of 1 MB./i);
        expect(errorMessage).toBeInTheDocument();
    });

    test('shows error when image is not in allowed type', () => {
        const mockImageFile = new File(['mock content'], 'mock-image.pdf', { type: 'image/pdf' });
        const input = document.createElement('input');
        input.type = 'file';

        render(
            <Router>
                <ReviewUpdate />
            </Router>
        );

        const image1Container = screen.getByTestId('image');
        image1Container.appendChild(input);

        fireEvent.change(input, { target: { files: [mockImageFile] } });
    });
});