import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Swal from "sweetalert2";
import { BrowserRouter as Router } from "react-router-dom";
import RoomServices from "../../components/RoomServices/RoomServices";
import { hotelService } from "../../HotelService";
jest.mock("../../HotelService", () => ({
  hotelService: {
    RoomServices: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();
const consoleErrorSpy = jest.spyOn(console, "error");

jest.mock("react-modal", () => ({
  __esModule: true,
  default: ({ isOpen, onRequestClose, style, children }) => (
    <div data-testid="modal" style={style} onClick={onRequestClose}>
      {isOpen && children}
    </div>
  ),
}));

describe("RoomServices Component", () => {
  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  test("renders RoomServices component", () => {
    render(
      <Router>
        <RoomServices />
      </Router>
    );
    expect(screen.getByTestId("room-services")).toBeInTheDocument();
  });

  test("handles service title change and validation", () => {
    render(
      <Router>
        <RoomServices />
      </Router>
    );

    const titleInput = screen.getByLabelText(/Service Title/i);
    fireEvent.change(titleInput, { target: { value: "Valid Title" } });
    expect(titleInput).toHaveValue("Valid Title");
    expect(
      screen.queryByText(/Please enter the service title/i)
    ).not.toBeInTheDocument();
  });
  test("handles image upload and preview", () => {
    render(
      <Router>
        <RoomServices />
      </Router>
    );

    const file = new File(["(mock content)"], "image.jpg", {
      type: "image/jpeg",
    });
    const fileInput = screen.getByTestId("choosefile");
    fireEvent.change(fileInput, { target: { files: [file] } });
    const chooseFileButton = screen.getByRole("button", {
      name: /Choose File/i,
    });
    fireEvent.click(chooseFileButton);
  });
});

test("handles invalid service title", () => {
  render(
    <Router>
      <RoomServices />
    </Router>
  );

  const titleInput = screen.getByLabelText(/Service Title/i);
  fireEvent.change(titleInput, { target: { value: "Valid123Title" } });
  expect(titleInput).toHaveValue("Valid123Title");
});

test("handles invalid price ", () => {
  render(
    <Router>
      <RoomServices />
    </Router>
  );

  const price = screen.getByLabelText(/Service Price/i);
  fireEvent.change(price, { target: { value: "Valid*" } });
  expect(price).toHaveValue("Valid*");
});
test("handles service description change and validation", () => {
  render(
    <Router>
      <RoomServices />
    </Router>
  );

  const description = screen.getByLabelText(/Service Description/i);
  fireEvent.change(description, { target: { value: "Valid Title" } });
  expect(description).toHaveValue("Valid Title");
});
test("handles service price change and validation", () => {
  render(
    <Router>
      <RoomServices />
    </Router>
  );

  const price = screen.getByLabelText(/Service Price/i);
  fireEvent.change(price, { target: { value: "120" } });
  expect(price).toHaveValue("120");
});
test("handles success add room services success", async () => {
  const roomServicesApiMock = jest
    .spyOn(hotelService, "RoomServices")
    .mockResolvedValue({});

  render(
    <Router>
      <RoomServices />
    </Router>
  );

  const largeFile = new File(["a".repeat(1024 * 1024)], "large-image.png", {
    type: "image/png",
  });

  const input = screen.getByTestId("choosefile1").querySelector("input");

  userEvent.upload(input, largeFile);

  fireEvent.change(screen.getByTestId("title").querySelector("input"), {
    target: { value: "Valid Title" },
  });
  fireEvent.change(screen.getByTestId("description").querySelector("input"), {
    target: { value: "Valid Description" },
  });
  fireEvent.change(screen.getByTestId("price").querySelector("input"), {
    target: { value: "120" },
  });

  fireEvent.click(screen.getByTestId("button"));

  await waitFor(() => {
    expect(roomServicesApiMock).toHaveBeenCalledWith({
      title: "Valid Title",
      image: largeFile,
      imageName: "large-image.png",
      description: "Valid Description",
      price: "120",
    });
  });
});

test("handles failure add room services", async () => {
  const roomServicesApiMock = jest
    .spyOn(hotelService, "RoomServices")
    .mockRejectedValueOnce({});

  render(
    <Router>
      <RoomServices />
    </Router>
  );
  const largeFile = new File(["a".repeat(1024 * 1024)], "large-image.png", {
    type: "image/png",
  });

  const input = screen.getByTestId("choosefile1").querySelector("input");

  userEvent.upload(input, largeFile);

  fireEvent.change(screen.getByTestId("title").querySelector("input"), {
    target: { value: "Valid Title" },
  });
  fireEvent.change(screen.getByTestId("description").querySelector("input"), {
    target: { value: "Valid Description" },
  });
  fireEvent.change(screen.getByTestId("price").querySelector("input"), {
    target: { value: "120" },
  });

  fireEvent.click(screen.getByTestId("button"));

  await waitFor(() => {
    expect(Swal.fire).toHaveBeenCalledWith({
      position: "center",
      icon: "error",
      title: "Failed to add room services",
      showConfirmButton: false,
      timer: 1000,
    });
  });
});
