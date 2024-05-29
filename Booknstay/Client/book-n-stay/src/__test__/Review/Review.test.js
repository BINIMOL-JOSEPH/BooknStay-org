import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import Review from '../../components/Review/Review';
import { act } from 'react-dom/test-utils';
import { userService } from '../../UserService';
import Swal from 'sweetalert2';

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
        Review: jest.fn(),
    },
}));

URL.createObjectURL = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
});

describe('testing review components', () => {

    test('render review components', () => {
        render(
            <Router>
                <Review />
            </Router>
        );

        const card = screen.getByTestId('card');
        expect(card).toBeInTheDocument();

        const ratingComponent = screen.getByTestId('rating');
        expect(ratingComponent).toBeInTheDocument();

        const stack = screen.getByTestId('stack');
        expect(stack).toBeInTheDocument();
    });

    test('updates form data on title input change', () => {
        render(
            <Router>
                <Review />
            </Router>
        );

        const titleInput = screen.getByLabelText(/Title/i);

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });

        expect(screen.getByLabelText(/Title/i).value).toBe('Test Title');
    });


    test('shows validation error on blank title input change', () => {
        render(
            <Router>
                <Review />
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
                <Review />
            </Router>
        );

        const commentInput = screen.getByLabelText(/Comment/i);

        fireEvent.change(commentInput, { target: { value: 'Test Comment' } });

        expect(screen.getByLabelText(/Comment/i).value).toBe('Test Comment');
    });

    test('shows validation error on blank comment input change', () => {
        render(
            <Router>
                <Review />
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
                <Review />
            </Router>
        );

        const ratingInput = screen.getAllByRole('radio');

        fireEvent.click(ratingInput[2]);

        expect(screen.getAllByRole('radio')[2].checked).toBe(true);
    });

    test('submit review data successful', async () => {

        jest.spyOn(userService, 'Review').mockResolvedValueOnce({
            data: {
                message: 'Review added successfully',
            },
        });

        render(
            <Router>
                <Review />
            </Router>
        );

        const button = screen.getByTestId('button');
        expect(button).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(button);

            await waitFor(() => {
                expect(userService.Review).toHaveBeenCalled();
                expect(Swal.fire).toHaveBeenCalledWith({
                    position: 'top',
                    icon: 'success',
                    title: 'Review added successfully',
                    showConfirmButton: false,
                    timer: 5000,
                });
            });
        });
    });

    test('submit review data fails', async () => {

        jest.spyOn(userService, 'Review').mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Review submit fails',
                },
            },
        });

        render(
            <Router>
                <Review />
            </Router>
        );

        const button = screen.getByTestId('button');
        expect(button).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(button);

            await waitFor(() => {
                expect(userService.Review).toHaveBeenCalled();
                expect(Swal.fire).toHaveBeenCalledWith({
                    position: 'top',
                    icon: 'error',
                    title: 'Review submit fails',
                    showConfirmButton: false,
                    timer: 5000,
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
                <Review />
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
                <Review />
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
                <Review />
            </Router>
        );
    
        const image1Container = screen.getByTestId('image');
        image1Container.appendChild(input);
    
        fireEvent.change(input, { target: { files: [mockImageFile] } });
    });
});