import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Swal from "sweetalert2";
import EditRoomServices from "../../components/EditRoomServices/EditRoomServices";
import { hotelService } from "../../HotelService";
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(() => ({ room_details_id: "mockedRoomId" })),
}));
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));
jest.mock("react-modal", () => {
  return {
    setAppElement: jest.fn(),
    default: ({ children }) => <div>{children}</div>,
  };
});
jest.mock("../../HotelService", () => ({
  hotelService: {
    GetEditRoomService: jest.fn(),
    EditRoomServices: jest.fn()
  },
}));

describe("EditRoomDetails Component", () => {
  test("renders the component with initial data", async () => {
    render(
      <Router>
        <EditRoomServices />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("title"));
      expect(screen.getByTestId("description"));
      expect(screen.getByTestId("price"));
      expect(screen.getByTestId("choosefile")).toBeInTheDocument();
    });
  });

  test("handles service title with  invalid characters", async () => {
    render(
      <Router>
        <EditRoomServices />
      </Router>
    );
    const titleInput = screen.getByRole("textbox", { name: "Service Title" });
    await waitFor(() => {
      expect(titleInput).toBeInTheDocument();
    });
    fireEvent.change(titleInput, { target: { value: "Title123" } });
    await waitFor(() => {
      expect(
        screen.getByText("Invalid characters. Only letters are allowed.")
      ).toBeInTheDocument();
      expect(titleInput.value).toBe("Title123");
    });
  });

  test("handles service price with  invalid characters", async () => {
    render(
      <Router>
        <EditRoomServices />
      </Router>
    );
    const priceInput = screen.getByRole("textbox", { name: "Service Price" });
    await waitFor(() => {
      expect(priceInput).toBeInTheDocument();
    });
    fireEvent.change(priceInput, { target: { value: "1200K" } });
    await waitFor(() => {
      expect(
        screen.getByText(
          "Rate should be numeric value with atmost 2 decimal place."
        )
      ).toBeInTheDocument();
      expect(priceInput.value).toBe("1200K");
    });
  });
  test("handles image preview", async () => {
    const mockCreateObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;

    render(
      <Router>
        <EditRoomServices />
      </Router>
    );

    const imageData = new Blob(["fakeImageData"], { type: "image/jpeg" });
    const fileInput = screen.getByTestId("choosefile");
    fireEvent.change(fileInput, { target: { files: [imageData] } });
    fireEvent.click(fileInput);
  });
});

test("shows success message when form submission pass", async () => {
  hotelService.EditRoomServices.mockResolvedValueOnce({
    data: {
      message: "Room services updated successfully",
    },
  });
  render(
    <Router>
      <EditRoomServices />
    </Router>
  );
  const submitButton = screen.getByTestId("button");
  expect(submitButton).toBeInTheDocument();
  fireEvent.click(submitButton);
  await act(async () => {
    fireEvent.submit(screen.getByTestId("form-submit"));
    await waitFor(() => {
      expect(hotelService.EditRoomServices).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith({
        position: "top",
        icon: "success",
        title: "Room services updated successfully",
        showConfirmButton: false,
        timer: 5000,
      });
    });
  });
});

test("shows error message when form submission fails", async () => {
  jest.spyOn(hotelService, "EditRoomServices").mockRejectedValueOnce({
    response: {
      data: {
        message: "Failed to update room service",
      },
    },
  });

  jest.spyOn(Swal, "fire").mockResolvedValueOnce();

  render(
    <Router>
      <EditRoomServices />
    </Router>
  );

  const submitButton = screen.getByTestId("button");
  expect(submitButton).toBeInTheDocument();
  fireEvent.click(submitButton);

  await act(async () => {
    fireEvent.submit(screen.getByTestId("form-submit"));
    await waitFor(() => {
      expect(hotelService.EditRoomServices).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith({
        position: "top",
        icon: "error",
        title: "Failed to update room service",
        showConfirmButton: true,
        timer: 5000,
      });
    });
  });
});

test("handles service description change and validation", () => {
  render(
    <Router>
      <EditRoomServices />
    </Router>
  );

  const description = screen.getByLabelText(/Service Description/i);
  fireEvent.change(description, { target: { value: "Valid Title" } });
  expect(description).toHaveValue("Valid Title");
});
test("handles image upload and preview", () => {
  render(
    <Router>
      <EditRoomServices />
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
