import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import RoomDetails from "../../components/RoomDetails/RoomDetails";
import { hotelService } from "../../HotelService";
import { BrowserRouter as Router } from "react-router-dom";

const localStorageMock = {
  getItem: jest.fn(
    () => '{"user": {"userType": "admin", "first_name": "admin"}}'
  ),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

jest.mock("../../HotelService", () => ({
  hotelService: {
    GetroomTypes: jest.fn(),
    RoomDetails: jest.fn().mockResolvedValue({
      status: 201,
      data: {
        id: "mockRoomDetailsId",
      },
    }),
  },
}));

jest.mock("sweetalert2");
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
});

describe("RoomDetails Component", () => {
  it("renders RoomDetails component", () => {
    hotelService.GetroomTypes.mockResolvedValue({
      data: [{ id: 1, room_type: "standard" }],
    });

    render(
      <Router>
        <RoomDetails />
      </Router>
    );
  });

  it("fetches room types on component mount", async () => {
    hotelService.GetroomTypes.mockResolvedValue({
      data: [{ id: 1, room_type: "standard" }],
    });

    render(
      <Router>
        <RoomDetails />
      </Router>
    );
    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.GetroomTypes
      ).toHaveBeenCalled();
    });
  });

  it("handles number of rooms change with invalid characters", async () => {
    hotelService.GetroomTypes.mockResolvedValue({
      data: [{ id: 1, room_type: "standard" }],
    });

    render(
      <Router>
        <RoomDetails />
      </Router>
    );

    const numberInput = screen.getByRole("textbox", {
      name: "Number Of Rooms",
    });

    await waitFor(() => {
      expect(numberInput).toBeInTheDocument();
    });
    fireEvent.change(numberInput, { target: { value: "abc123" } });
    await waitFor(() => {
      expect(
        screen.getByText("Invalid characters. Only digits are allowed.")
      ).toBeInTheDocument();
      expect(numberInput.value).toBe("abc123");
    });
  });

  it("handles rooms facilities with invalid characters", async () => {
    hotelService.GetroomTypes.mockResolvedValue({
      data: [{ id: 1, room_type: "standard" }],
    });

    render(
      <Router>
        <RoomDetails />
      </Router>
    );
    const numberInput = screen.getByRole("textbox", {
      name: "Room Facilities",
    });

    await waitFor(() => {
      expect(numberInput).toBeInTheDocument();
    });
    fireEvent.change(numberInput, { target: { value: "abc123" } });
    await waitFor(() => {
      expect(
        screen.getByText("Invalid characters. Only letters are allowed.")
      ).toBeInTheDocument();
      expect(numberInput.value).toBe("abc123");
    });
  });

  it("handles rooms rate with invalid characters", async () => {
    hotelService.GetroomTypes.mockResolvedValue({
      data: [{ id: 1, room_type: "standard" }],
    });

    render(
      <Router>
        <RoomDetails />
      </Router>
    );
    const numberInput = screen.getByRole("textbox", { name: "Room Rate" });

    await waitFor(() => {
      expect(numberInput).toBeInTheDocument();
    });
    fireEvent.change(numberInput, { target: { value: "abc123" } });
    await waitFor(() => {
      expect(
        screen.getByText(
          "Rate should be numeric value with atmost 2 decimal place."
        )
      ).toBeInTheDocument();
      expect(numberInput.value).toBe("abc123");
    });
  });

  it("renders MenuItem components with room types", async () => {
    hotelService.GetroomTypes.mockResolvedValue({
      data: [
        { id: 1, room_type: "Single Room" },
        { id: 2, room_type: "Double Room" },
      ],
    });

    render(
      <Router>
        <RoomDetails />
      </Router>
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Room Type")).toBeInTheDocument();
    });
  });

  it("should handle room details addition failure with generic error", async () => {
    hotelService.GetroomTypes.mockResolvedValue({
      data: [{ id: 1, room_type: "standard" }],
    });

    hotelService.RoomDetails.mockRejectedValue({
      response: {
        message: {
          error: "Room with the same hotel and room type already exists.",
        },
      },
    });
    render(
      <Router>
        <RoomDetails />
      </Router>
    );
    const numberInput = screen.getByRole("textbox", {
      name: "Number Of Rooms",
    });
    fireEvent.change(numberInput, { target: { value: "123" } });
    const numberInput1 = screen.getByRole("textbox", {
      name: "Room Facilities",
    });
    fireEvent.change(numberInput1, { target: { value: "xx" } });
    const numberInput2 = screen.getByRole("textbox", { name: "Room Rate" });
    fireEvent.change(numberInput2, { target: { value: "20" } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("button"));
    });
  });

  it("display error message when the number of rooms is not entered", () => {
    hotelService.GetroomTypes.mockResolvedValue({
      data: [{ id: 1, room_type: "standard" }],
    });

    render(
      <Router>
        <RoomDetails />
      </Router>
    );
    const descriptionInput = screen.getAllByRole("textbox");
    fireEvent.change(descriptionInput[0], { target: { value: " " } });
    const descriptionInput1 = screen.getAllByRole("textbox");
    fireEvent.change(descriptionInput1[2], { target: { value: " " } });
    const descriptionInput2 = screen.getAllByRole("textbox");
    fireEvent.change(descriptionInput2[1], { target: { value: " " } });
  });
});
