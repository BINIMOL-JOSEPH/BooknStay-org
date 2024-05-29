import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import { act } from "react-dom/test-utils";
import EditUser from "../../components/EditUser/EditUser";
import { userService } from "../../UserService";
import "@testing-library/jest-dom";
import Swal from "sweetalert2";

const localStorageMock = {
  getItem: jest.fn(
    () => '{"user": {"userType": "admin", "first_name": "admin"}}'
  ),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

jest.mock("react-toastify", () => ({
  ...jest.requireActual("react-toastify"),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

jest.mock('../../UserService', () => ({
  userService: {
      GetEditUser: jest.fn(),
  },
}));

jest.setTimeout(20000);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Edituser", () => {
  it("renders update form", async () => {
    render(
      <Router>
        <EditUser />
      </Router>
    );

    const fisrtNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    const submitButton = screen.getByRole("button", { name: /Update/i });
    expect(submitButton).toBeInTheDocument();

    userEvent.type(fisrtNameInput, "John");
    userEvent.type(lastNameInput, "Doe");
    userEvent.type(phoneNumberInput, "1234567890");
    await waitFor(() => {});
  });

  it("should show validation error for invalid first name", async () => {
    render(
      <Router>
        <EditUser />
      </Router>
    );

    const blankFirstName = screen.getAllByRole("textbox");
    fireEvent.change(blankFirstName[0], { target: { value: " " } });
    const errorMessage = screen.getByText(/Please fill this field./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("should show validation error for invalid last name", async () => {
    render(
      <Router>
        <EditUser />
      </Router>
    );

    const blankLastName = screen.getAllByRole("textbox");
    fireEvent.change(blankLastName[1], { target: { value: " " } });
    const errorMessage = screen.getByText(/Please fill this field./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("should show validation error for invalid phone number", async () => {
    render(
      <Router>
        <EditUser />
      </Router>
    );

    const PhoneNumberInput = screen.getByLabelText(/Phone Number/i);
    userEvent.type(PhoneNumberInput, "12fd");

    await waitFor(() => {
      const errorText = screen.getByText(
        /Invalid characters in phone number. Only digits are allowed./i
      );
      expect(errorText).toBeInTheDocument();
    });

    const blankLastName = screen.getAllByRole("textbox");
    fireEvent.change(blankLastName[4], { target: { value: " " } });
    const errorMessage = screen.getByText(/Please enter your phone number./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("disables submit button while submitting", async () => {
    render(
      <Router>
        <EditUser />
      </Router>
    );
    const submitButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.submit(screen.getByTestId("form-submit"));
    expect(submitButton).toBeDisabled();
    jest.advanceTimersByTime(0);
    await waitFor(() => { });
    render(
      <Router>
        <EditUser />
      </Router>
    );
    expect(submitButton).toBeDisabled();
  });

  it("fetch details to edit", async () => {
    jest.spyOn(userService, "GetEditUser").mockResolvedValueOnce({
      data: [
        {
          first_name: "customer",
          last_name: "customer",
          phone_number: "1234567890",
        },
      ],
    });

    render(
      <Router>
        <EditUser />
      </Router>
    );

    const submitButton = screen.getByRole("button", { name: /Update/i });
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(userService.GetEditUser).toHaveBeenCalled();
    });
  });
});
