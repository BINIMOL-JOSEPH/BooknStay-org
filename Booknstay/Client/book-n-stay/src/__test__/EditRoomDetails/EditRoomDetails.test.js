import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Swal from "sweetalert2";
import Modal from "react-modal";

import EditRoomDetails from "../../components/EditRoomDetails/EditRoomDetails";
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
    GetEditRoomDetails: jest.fn(() =>
      Promise.resolve({
        data: {
          room_details: {
            number_of_rooms: "10",
            room_facilities: "WiFi, TV",
            rate: "100",
          },
          room_images: {
            image1: "Image1.jpg",
            image2: "Image2.jpg",
            image3: "Image3.jpg",
          },
        },
      })
    ),
    EditRoomDetails: jest.fn((formData) => {
      if (formData.number_of_rooms === "error") {
        return Promise.reject({
          response: {
            data: {
              message: "Failed to update room details",
            },
          },
        });
      } else {
        return Promise.resolve({
          data: {
            message: "Room details updated successfully",
          },
        });
      }
    }),
  },
}));

describe("EditRoomDetails Component", () => {
  test("renders the component with initial data", async () => {
    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId("number_of_rooms"));
      expect(screen.getByTestId("room_facilities"));
      expect(screen.getByTestId("room-rate"));
      expect(screen.getByText("Image 1:")).toHaveTextContent("Image 1:");
      expect(screen.getByText("Image 2:")).toHaveTextContent("Image 2:");
      expect(screen.getByText("Image 3:")).toHaveTextContent("Image 3:");
    });
  });

  it("handles number of rooms change with invalid characters", async () => {
    render(
      <Router>
        <EditRoomDetails />
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
    render(
      <Router>
        <EditRoomDetails />
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
    render(
      <Router>
        <EditRoomDetails />
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
  it("handles image upload with valid file", async () => {
    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );
    const fileInput = screen.getByLabelText("Image 1:");

    await waitFor(() => {
      expect(fileInput).toBeInTheDocument();
    });

    const validImageFile = new File(
      ["(valid image content)"],
      "validImage.jpg",
      { type: "image/jpeg", size: 2 * 1024 * 1024 }
    );

    fireEvent.change(fileInput, { target: { files: [validImageFile] } });

    await waitFor(() => {
      expect(screen.getByText("Image 1:")).toHaveTextContent("Image 1:");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("handles image upload with invalid file format", async () => {
    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );
    const fileInput = screen.getByLabelText("Image 1:");

    await waitFor(() => {
      expect(fileInput).toBeInTheDocument();
    });

    const invalidImageFile = new File(
      ["(invalid image content)"],
      "invalidImage.txt",
      { type: "text/plain" }
    );

    fireEvent.change(fileInput, { target: { files: [invalidImageFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(
          "Invalid file format. Only jpeg, jpg, and png formats are allowed."
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          "File size exceeds the maximum allowed limit of 5 MB."
        )
      ).not.toBeInTheDocument();
      expect(screen.queryByText("invalidImage.txt")).not.toBeInTheDocument();
    });
  });

  it("handles image upload with file size exceeding the limit", async () => {
    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );
    const fileInput = screen.getByLabelText("Image 1:");

    await waitFor(() => {
      expect(fileInput).toBeInTheDocument();
    });

    const largeImageFile = new File(
      ["(large image content)"],
      "largeImage.jpg",
      { type: "image/jpeg", size: 10 * 1024 * 1024 }
    );

    fireEvent.change(fileInput, { target: { files: [largeImageFile] } });

    await waitFor(() => {
      expect(
        screen.queryByText(
          "Invalid file format. Only jpeg, jpg, and png formats are allowed."
        )
      ).not.toBeInTheDocument();
      expect(screen.queryByText("largeImage.jpg")).not.toBeInTheDocument();
    });
  });
  test("handles API sucess on form submission", async () => {
    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId("button"));
    });

    expect(Swal.fire).toHaveBeenCalledWith({
      position: "top",
      icon: "success",
      title: "Room details updated successfully",
      showConfirmButton: false,
      timer: 1000,
    });

    jest.clearAllMocks();
  });
  it('handles "Please enter the number of rooms" error', async () => {
    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );
    const numberInput = screen.getByRole("textbox", {
      name: "Number Of Rooms",
    });

    await waitFor(() => {
      expect(numberInput).toBeInTheDocument();
    });

    fireEvent.change(numberInput, { target: { value: "" } });

    await waitFor(() => {
      expect(
        screen.getByText("Please enter the number of rooms.")
      ).toBeInTheDocument();
    });
  });

  it('handles "Please enter the room facilities" error', async () => {
    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );
    const facilitiesInput = screen.getByRole("textbox", {
      name: "Room Facilities",
    });

    await waitFor(() => {
      expect(facilitiesInput).toBeInTheDocument();
    });

    fireEvent.change(facilitiesInput, { target: { value: "" } });

    await waitFor(() => {
      expect(
        screen.getByText("Please enter the room facilities.")
      ).toBeInTheDocument();
    });
  });

  it('handles "Please enter the room rate" error', async () => {
    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );
    const rateInput = screen.getByRole("textbox", { name: "Room Rate" });

    await waitFor(() => {
      expect(rateInput).toBeInTheDocument();
    });

    fireEvent.change(rateInput, { target: { value: "" } });

    await waitFor(() => {
      expect(screen.getByText("Please enter the rate.")).toBeInTheDocument();
    });
  });

  test("handles API failure on form submission", async () => {
    jest.spyOn(hotelService, "EditRoomDetails").mockRejectedValueOnce({
      response: {
        data: {
          room_type: "Failed to update room details",
        },
      },
    });

    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId("button"));
    });

    expect(Swal.fire).toHaveBeenCalledWith({
      position: "top",
      icon: "error",
      title: "Failed to update room details",
      showConfirmButton: true,
      timer: 1000,
    });
  });
  test("handles error when fetching room details fails", async () => {
    jest.spyOn(hotelService, "GetEditRoomDetails").mockRejectedValueOnce({
      response: {
        data: {
          message: "Failed to fetch room details. Please try again later.",
        },
      },
    });

    render(
      <Router>
        <EditRoomDetails />
      </Router>
    );

    await waitFor(() => {});
    expect(
      screen.getByText("Failed to fetch room details. Please try again later.")
    ).toBeInTheDocument();
  });
});

it("should handle invalid image data and log an error", () => {
  const { container } = render(
    <Router>
      <EditRoomDetails />
    </Router>
  );
  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});
  container.querySelector('[data-testId="preview-button"]').click();
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Invalid image data type:",
    null
  );
  consoleErrorSpy.mockRestore();
});
