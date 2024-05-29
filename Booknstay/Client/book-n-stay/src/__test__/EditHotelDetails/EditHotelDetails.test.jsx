import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import Swal from "sweetalert2";
import { hotelService } from "../../HotelService";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import EditHotelDetails from "../../components/EditHotelDetails/EditHotelDetails";

const localStorageMock = {
  getItem: jest.fn( () => '{"user": {"userType": "admin", "first_name": "admin"}}' ),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

jest.setTimeout(20000);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("testing edit hotel details components", () => {
  test("render edit hotel details component", () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    expect(screen.getByTestId("hotel_name")).toBeInTheDocument();
    expect(screen.getByTestId("address")).toBeInTheDocument();
    expect(screen.getByTestId("city")).toBeInTheDocument();
    expect(screen.getByTestId("district")).toBeInTheDocument();
    expect(screen.getByTestId("state")).toBeInTheDocument();
    expect(screen.getByTestId("pin_code")).toBeInTheDocument();
    expect(screen.getByTestId("phone_number")).toBeInTheDocument();
    expect(screen.getByTestId("service_charge")).toBeInTheDocument();
    expect(screen.getByTestId("description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update/i })).toBeInTheDocument();
  });

  test("should show validation error for invalid hotel name", async () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const hotelNameInput = screen.getByLabelText(/Hotel Name/i);
    expect(hotelNameInput).toBeInTheDocument();

    const blankHotelName = screen.getAllByRole("textbox");
    fireEvent.change(blankHotelName[0], { target: { value: " " } });
    const errorMessage = screen.getByText(/Please enter your hotel name./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("should show validation error for invalid address", async () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const blankAddress = screen.getAllByRole("textbox");
    fireEvent.change(blankAddress[1], { target: { value: " " } });
    const errorMessage = screen.getByText(/Please enter your address./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("should show validation error for invalid city", async () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const cityInput = screen.getByLabelText(/City Name/i);

    userEvent.type(cityInput, "123");

    await waitFor(() => {
      const errorText = screen.getByText(/Please enter a valid city name./i);
      expect(errorText).toBeInTheDocument();
    });

    const blankCity = screen.getAllByRole("textbox");
    fireEvent.change(blankCity[2], { target: { value: " " } });

    const errorMessage = screen.getByText(/Please enter your city./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("should show validation error for invalid district", async () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const districtInput = screen.getByLabelText(/District Name/i);

    userEvent.type(districtInput, "123");

    await waitFor(() => {
      const errorText = screen.getByText(/Please enter a valid district name./i);
      expect(errorText).toBeInTheDocument();
    });

    const blankDistrict = screen.getAllByRole("textbox");
    fireEvent.change(blankDistrict[3], { target: { value: " " } });

    const errorMessage = screen.getByText(/Please enter your district./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("should show validation error for invalid state", async () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const stateInput = screen.getByLabelText(/State Name/i);

    userEvent.type(stateInput, "123");

    await waitFor(() => {
      const errorText = screen.getByText(/Please enter a valid state name./i);
      expect(errorText).toBeInTheDocument();
    });

    const blankState = screen.getAllByRole("textbox");
    fireEvent.change(blankState[4], { target: { value: " " } });

    const errorMessage = screen.getByText(/Please enter your state./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("should show validation error for invalid pincode", async () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const pincodeInput = screen.getByLabelText(/PIN code/i);
    userEvent.type(pincodeInput, "12");

    await waitFor(() => {
      const errorText = screen.getByText(/Invalid pincode. Must be 6 digits./i);
      expect(errorText).toBeInTheDocument();
    });

    userEvent.type(pincodeInput, "12char");

    await waitFor(() => {
      const errorText = screen.getByText(/Invalid characters in pincode. Only digits are allowed./i);
      expect(errorText).toBeInTheDocument();
    });

    const blankPinCode = screen.getAllByRole("textbox");
    fireEvent.change(blankPinCode[5], { target: { value: " " } });

    const errorMessage = screen.getByText(/Please enter your pincode./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("should show validation error for invalid phone number", async () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const phoneInput = screen.getByLabelText(/Phone Number/i);
    userEvent.type(phoneInput, "12");

    await waitFor(() => {
      const errorText = screen.getByText(/Invalid phone number. Must be 10 digits./i);
      expect(errorText).toBeInTheDocument();
    });

    userEvent.type(phoneInput, "12char");

    await waitFor(() => {
      const errorText = screen.getByText(/Invalid characters in phone number. Only digits are allowed./i);
      expect(errorText).toBeInTheDocument();
    });

    const blankInput = screen.getAllByRole("textbox");
    fireEvent.change(blankInput[6], { target: { value: " " } });

    const errorMessage = screen.getByText(/Please enter your phone number./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("should show validation error for invalid service charge", async () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const serviceInput = screen.getByLabelText(/Service Charge/i);
    userEvent.type(serviceInput, "12.");

    await waitFor(() => {
      const errorText = screen.getByText("Rate should be numeric value with atmost 2 decimal place.",{ exact: false });
      expect(errorText).toBeInTheDocument();
    });

    const blankInput = screen.getAllByRole("textbox");
    fireEvent.change(blankInput[7], { target: { value: " " } });
    const errorMessage = screen.getByText(/Please enter the rate./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("display error message when description is not entered", () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const descriptionInput = screen.getAllByRole("textbox");
    fireEvent.change(descriptionInput[8], { target: { value: " " } });
    const errorMessage = screen.getByText(/Please enter hotel description./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("display error message when link is not entered", () => {
    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const locationInput = screen.getAllByRole("textbox");
    fireEvent.change(locationInput[9], { target: { value: " " } });
    const errorMessage = screen.getByText(/Please enter the location link./i);
    expect(errorMessage).toBeInTheDocument();

    fireEvent.change(locationInput[9], { target: { value: "dfdsg" } });
    const invalidError = screen.getByText(/Please provide valid url/i);
    expect(invalidError).toBeInTheDocument();
  });

  test("shows success message when form submission pass", async () => {
    jest.spyOn(hotelService, "EditHotelDetails").mockResolvedValueOnce({
      data: {
        message: "Hotel details updated successfully",
      },
    });

    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const submitButton = screen.getByTestId("submit_button");
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await act(async () => {
      fireEvent.submit(screen.getByTestId("form-submit"));

      await waitFor(() => {
        expect(hotelService.EditHotelDetails).toHaveBeenCalled();

        expect(Swal.fire).toHaveBeenCalledWith({
          position: "top",
          icon: "success",
          title: "Hotel details updated successfully",
          showConfirmButton: false,
          timer: 2000,
        });
      });
    });
  });

  test("shows error message when form submission fails", async () => {
    jest.spyOn(hotelService, "EditHotelDetails").mockRejectedValueOnce({
      error: {
        response: {
          data: "Unsuccessful attempt",
        },
      },
    });

    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    const submitButton = screen.getByTestId("submit_button");
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await act(async () => {
      fireEvent.submit(screen.getByTestId("form-submit"));

      await waitFor(() => {
        expect(hotelService.EditHotelDetails).toHaveBeenCalled();
      });
    });
  });

  test("fetch details to edit", async () => {
    jest.spyOn(hotelService, "GetHotelDetails").mockResolvedValueOnce({
      data: [
        {
          hotel_name: "Mariott",
          phone_number: "1234567890",
          address: "test address",
          city: "city",
          district: "district",
          state: "state",
          pincode: "123456",
          description: "asdfghjk",
          service_charge: "1200",
          location_link: "https://hotel.com",
        },
      ],
    });

    render(
      <Router>
        <EditHotelDetails />
      </Router>
    );

    await waitFor(() => {
      expect(hotelService.GetHotelDetails).toHaveBeenCalled();
    });
  });

  test('sets image in edit data within the limit', () => {

    URL.createObjectURL = jest.fn();

    const mockFile = new File(['mock content'], 'mock-image.jpg', { type: 'image/jpeg' });
    const input = document.createElement('input');
    input.type = 'file';

    render(
        <Router>
            <EditHotelDetails />
        </Router>
    );

    const imagecontainer = document.querySelector('[data-testid="image1"]');
    imagecontainer.appendChild(input);

    fireEvent.change(input, { target: { files: [mockFile] } });
  }); 
});
