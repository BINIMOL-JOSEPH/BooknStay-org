import { render, screen, waitFor,fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import VerifyEmail from "../../components/VerifyEmail/VerifyEmail";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import { userService } from "../../UserService";

jest.mock('../../UserService', () => ({
    userService: {
        VerifyEmail: jest.fn(),
    },
}));

describe('testing verifying email components', () => {

    test('render verify email components', () => {
        render(
            <MemoryRouter>
                <VerifyEmail/>
            </MemoryRouter>
        )
    });

    test('renders verification success message', async () => {
        const mockedData = {
            data: {
                message: "Email verification successful. You can now log in.",
            },
        };

        userService.VerifyEmail.mockResolvedValue(mockedData);

        render(
            <MemoryRouter initialEntries={[`/verify-email/1`]}>
                <VerifyEmail />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Email verification successful. You can now log in.")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });

    test('renders verification error message', async () => {
        const mockedError = {
            response: {
                data: {
                    message: "Email verification failed!",
                },
            },
        };

        userService.VerifyEmail.mockRejectedValue(mockedError);

        render(
            <MemoryRouter initialEntries={[`/verify-email/1`]}>
                <VerifyEmail />
             </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Email verification failed!")).toBeInTheDocument();
        });
    });
});
