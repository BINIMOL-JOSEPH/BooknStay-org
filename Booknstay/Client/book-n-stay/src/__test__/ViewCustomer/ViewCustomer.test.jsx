import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Swal from "sweetalert2";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import { userService } from "../../UserService";
import ViewCustomer from "../../components/ViewCustomer/ViewCustomer";
import { adminServices } from "../../AdminService";
const localStorageMock = {
  getItem: jest.fn(
    () => '{"user": {"userType": "admin", "first_name": "admin"}}'
  ),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));
jest.mock("../../AdminService", () => ({
  adminServices: {
    ActivateCustomer: jest.fn(),
  },
}));
jest.mock("../../UserService", () => ({
  userService: {
    ViewCustomer: jest.fn(),
    SuspendCustomer: jest.fn(),
    DeleteCustomer: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.setTimeout(20000);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockData = [
  {
    id: 1,
    first_name: "John",
    last_name: "Test",
    email: "john@gmail.com",
    phone_number: "9876788909",
    date_joined: "2023-12-20",
    status: "active",
  },
];
const suspendmockData = [
  {
    id: 1,
    first_name: "John",
    last_name: "Test",
    email: "john@gmail.com",
    phone_number: "9876788909",
    date_joined: "2023-12-20",
    status: "suspended",
  },
];
describe("View customers", () => {
  it("renders the list with data correctly", async () => {
    const mockInactiveData = [
      {
        id: 1,
        first_name: "John",
        last_name: "Test",
        email: "john@gmail.com",
        phone_number: "9876788909",
        date_joined: "2023-12-20",
        status: "inactive",
      },
    ];
    jest.spyOn(userService, "ViewCustomer").mockResolvedValue({
      data: mockInactiveData,
    });

    render(
      <MemoryRouter>
        <ViewCustomer />
      </MemoryRouter>
    );
    await waitFor(() => {
      const email = screen.getByText("Email:");
      expect(email).toBeInTheDocument();
      expect(email.nextSibling.textContent).toBe("john@gmail.com");

      const suspendButton = screen.queryByText("Suspend");
      expect(suspendButton).not.toBeInTheDocument();

      const deleteButton = screen.queryByText("Delete");
      expect(deleteButton).not.toBeInTheDocument();
    });
  });

  it("renders the list with no authorization", async () => {
    const errorMessage = "You do not have permission to perform this action.";
    jest.spyOn(userService, "ViewCustomer").mockRejectedValue({
      response: {
        data: {
          detail: errorMessage,
        },
      },
    });

    render(
      <MemoryRouter>
        <ViewCustomer />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        position: "top",
        icon: "error",
        title: "You do not have permission to perform this action.",
        showConfirmButton: false,
        timer: 5000,
      });
    });
  });
});
it("renders the Activate button when customer status is suspended", async () => {
  jest.spyOn(userService, "ViewCustomer").mockResolvedValue({
    data: suspendmockData,
  });

  render(
    <MemoryRouter>
      <ViewCustomer />
    </MemoryRouter>
  );

  await waitFor(() => {
    const activateButton = screen.getByTestId("activate");
    expect(activateButton).toBeInTheDocument();
  });
});
it("renders the Activate button and triggers success", async () => {
  adminServices.ActivateCustomer.mockResolvedValue({
    data: { message: "Customer activated successfully" },
  });

  jest.spyOn(userService, "ViewCustomer").mockResolvedValue({
    data: suspendmockData,
  });

  render(
    <MemoryRouter>
      <ViewCustomer />
    </MemoryRouter>
  );

  await waitFor(() => {
    const activateButton = screen.getByTestId("activate");
    expect(activateButton).toBeInTheDocument();
  });

  act(() => {
    fireEvent.click(screen.getByTestId("activate"));
  });
});
it("renders the Activate button and triggers error", async () => {
  const errorMessage = "Failed to activate customer";

  adminServices.ActivateCustomer.mockRejectedValue({
    response: {
      data: {
        message: errorMessage,
      },
    },
  });

  jest.spyOn(userService, "ViewCustomer").mockResolvedValue({
    data: suspendmockData,
  });

  render(
    <MemoryRouter>
      <ViewCustomer />
    </MemoryRouter>
  );

  await waitFor(() => {
    const activateButton = screen.getByTestId("activate");
    expect(activateButton).toBeInTheDocument();
  });

  act(() => {
    fireEvent.click(screen.getByTestId("activate"));
  });
});

it("should navigate to suspend-user with the correct id", async () => {
  const id = 1;
  jest.spyOn(userService, "ViewCustomer").mockResolvedValue({
    data: mockData,
  });

  const { getByTestId } = render(
    <MemoryRouter>
      <ViewCustomer />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(getByTestId("status")).toBeInTheDocument();
  });
  const suspendButton = getByTestId("suspend");
  fireEvent.click(suspendButton);

  expect(mockNavigate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith(`/suspend-customer/${id}`);
});

it("should navigate to delete-user with the correct id", async () => {
  const id = 1;
  jest.spyOn(userService, "ViewCustomer").mockResolvedValue({
    data: mockData,
  });

  const { getByTestId } = render(
    <MemoryRouter>
      <ViewCustomer />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(getByTestId("status")).toBeInTheDocument();
  });
  const suspendButton = getByTestId("delete");
  fireEvent.click(suspendButton);

  expect(mockNavigate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith(`/delete-customer/${id}`);
});
