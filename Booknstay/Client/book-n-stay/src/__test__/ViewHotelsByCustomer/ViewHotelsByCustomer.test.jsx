import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SelectHotels from "../../components/ViewHotelsByCustomer/ViewHotelsByCustomer";
import "@testing-library/jest-dom";
import { hotelService } from "../../HotelService";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

jest.mock("../../HotelService", () => ({
  hotelService: {
    FetchActiveHotel: jest.fn(),
    FetchSelectedHotel: jest.fn(),
    SortActiveHotel: jest.fn()
  },
}));

jest.setTimeout(20000);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockHotelData = [
  {
    hotel_details: {
      id: 1,
      hotel_name: "Motel6",
      email: "motel6@test.com",
      description: "High end restuarant, Advances facilities, Free custom services"
    },
    lowest_rate: 2400.0,
  },
  {
    hotel_details: {
      id: 2,
      hotel_name: "Summer",
      email: "summer@test.com",
    },
    lowest_rate: 1500,
    average_rating: 4
  },
];

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ListActiveHotels", () => {
  it("should handle fetch errors", async () => {
    const errorMessage = "No active hotels found";
    hotelService.FetchActiveHotel = jest
      .fn()
      .mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    render(<MemoryRouter><SelectHotels /></MemoryRouter>);
  });

  it("fetches active hotels in invalid data format on component mount", async () => {
    hotelService.FetchActiveHotel.mockResolvedValue({
      data: { results: mockHotelData },
    });

    render(<MemoryRouter><SelectHotels /></MemoryRouter>);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchActiveHotel
      ).toHaveBeenCalled();
    });
  });

  it("fetches active hotels on component mount", async () => {
    hotelService.FetchActiveHotel.mockResolvedValue({ data: mockHotelData });

    render(<MemoryRouter><SelectHotels /></MemoryRouter>);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchActiveHotel
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Motel6")).toBeInTheDocument();
    });
  });

  it("fetches active hotels on selected criteria", async () => {
    hotelService.FetchActiveHotel.mockResolvedValue({ data: mockHotelData });
    jest
      .spyOn(hotelService, "FetchSelectedHotel")
      .mockImplementation((inputs) => {
        return Promise.resolve({
          data: {
            message: "no hotels found in selected location",
            hotel_data: [
              {
                hotel_details: {
                  id: 2,
                  hotel_name: "Summer",
                  email: "summer@test.com",
                },
                lowest_rate: 1500,
              },
            ]
          }
        });
      });

      const { getByTestId } = render(<MemoryRouter><SelectHotels /></MemoryRouter>);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchActiveHotel
      ).toHaveBeenCalled();
    });

    const locationInput = getByTestId("location").querySelector("input");
    fireEvent.change(locationInput, { target: { value: "Kochi" } });
    expect(locationInput.value).toBe("Kochi");

    const checkOutInput = screen
      .getByTestId("check-out-date")
      .querySelector("input");
    fireEvent.change(checkOutInput, { target: { value: "2025-10-13" } });
    expect(checkOutInput.value).toBe("2025-10-13");

    const checkInInput = screen
      .getByTestId("check-in-date")
      .querySelector("input");
    fireEvent.change(checkInInput, { target: { value: "2025-10-10" } });
    expect(checkInInput.value).toBe("2025-10-10");

    const searchButton = screen.getByTestId("search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchSelectedHotel
      ).toHaveBeenCalledWith({
        location: "Kochi",
        check_in_date: "2025-10-10",
        check_out_date: "2025-10-13",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Summer")).toBeInTheDocument();
    });
  });

  it("fetches active hotels in invalid data format on selected criteria", async () => {
    hotelService.FetchActiveHotel.mockResolvedValue({ data: mockHotelData });
    jest
      .spyOn(hotelService, "FetchSelectedHotel")
      .mockImplementation((inputs) => {
        return Promise.resolve({
          data: {
            hotel_details: {
              id: 2,
              hotel_name: "Summer",
              email: "summer@test.com",
            },
            lowest_rate: 1500,
          },
        });
      });

      const { getByTestId }  = render(<MemoryRouter><SelectHotels /></MemoryRouter>);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchActiveHotel
      ).toHaveBeenCalled();
    });

    const locationInput = getByTestId("location").querySelector("input");
    fireEvent.change(locationInput, { target: { value: "Kochi" } });
    const checkOutInput = screen
      .getByTestId("check-out-date")
      .querySelector("input");
    fireEvent.change(checkOutInput, { target: { value: "2025-10-13" } });
    const checkInInput = screen
      .getByTestId("check-in-date")
      .querySelector("input");
    fireEvent.change(checkInInput, { target: { value: "2025-10-10" } });

    const searchButton = screen.getByTestId("search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchSelectedHotel
      ).toHaveBeenCalledWith({
        location: "Kochi",
        check_in_date: "2025-10-10",
        check_out_date: "2025-10-13",
      });
    });
  });

  it("fetches no active hotels on selected criteria", async () => {
    hotelService.FetchActiveHotel.mockResolvedValue({ data: mockHotelData });
    const errorMessage = "Unable to find hotels for selected data";
    hotelService.FetchSelectedHotel = jest
      .fn()
      .mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

      const { getByTestId }  = render(<MemoryRouter><SelectHotels /></MemoryRouter>);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchActiveHotel
      ).toHaveBeenCalled();
    });

    const locationInput = getByTestId("location").querySelector("input");
    fireEvent.change(locationInput, { target: { value: "Kochi" } });
    const checkOutInput = screen
      .getByTestId("check-out-date")
      .querySelector("input");
    fireEvent.change(checkOutInput, { target: { value: "2025-10-13" } });
    const checkInInput = screen
      .getByTestId("check-in-date")
      .querySelector("input");
    fireEvent.change(checkInInput, { target: { value: "2025-10-10" } });

    const searchButton = screen.getByTestId("search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchSelectedHotel
      ).toHaveBeenCalledWith({
        location: "Kochi",
        check_in_date: "2025-10-10",
        check_out_date: "2025-10-13",
      });
    });
  });

  it("error message while selecting past dated for check in and check out", async () => {
    const { getByTestId }  = render(<MemoryRouter><SelectHotels /></MemoryRouter>);

    const checkInInput = screen
      .getByTestId("check-in-date")
      .querySelector("input");
    fireEvent.change(checkInInput, { target: { value: "2025-10-10" } });

    const checkOutInput = screen
      .getByTestId("check-out-date")
      .querySelector("input");
    fireEvent.change(checkOutInput, { target: { value: "2025-10-09" } });

    await waitFor(() => {
      expect(checkInInput.value).toBe("2025-10-08");
    });

    const locationInput = getByTestId("location").querySelector("input");
    fireEvent.change(locationInput, { target: { value: " " } });

    const searchButton = screen.getByTestId("search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      const formError = screen.getByText(
        "Please provide preferences to filter best suited hotels"
      );
      expect(formError).toBeInTheDocument();
    });
  });

  it("navigate to next page on card click", async () => {
    hotelService.FetchActiveHotel.mockResolvedValue({
      data: [
        {
          hotel_details: {
            id: 1,
            hotel_name: "Motel6",
            email: "motel6@test.com",
          },
          lowest_rate: 2400.0,
        },
      ],
    });

    const hotel_Id = 1;

    render(<MemoryRouter><SelectHotels /></MemoryRouter>);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchActiveHotel
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId("detail-card")).toBeInTheDocument();
      expect(screen.getByText("Motel6")).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(screen.getByTestId("detail-card"));
    });
  
  });

  it("fetches and sort active hotels ", async () => {
    hotelService.FetchActiveHotel.mockResolvedValue({ data: mockHotelData });

    hotelService.SortActiveHotel.mockResolvedValue({ data: mockHotelData });

    render(<MemoryRouter><SelectHotels /></MemoryRouter>);

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchActiveHotel
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Motel6")).toBeInTheDocument();
    });

    expect(screen.getByTestId('sort-stack')).toBeInTheDocument();
    expect(screen.getByTestId('sort-rating')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('sort-rating'));

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.SortActiveHotel
      ).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Motel6")).toBeInTheDocument();
    });
  });

  it("should handle fetch errors", async () => {
    const errorMessage = "No active hotels found";
    hotelService.SortActiveHotel = jest
      .fn()
      .mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    render(<MemoryRouter><SelectHotels /></MemoryRouter>);

    fireEvent.click(screen.getByTestId('sort-low-price'));

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.SortActiveHotel
      ).toHaveBeenCalled();
    });
  });

  it("sort active hotels in invalid data format on component mount", async () => {
    hotelService.FetchActiveHotel.mockResolvedValue({ data: mockHotelData });


    hotelService.SortActiveHotel.mockResolvedValue({
      data: { results: mockHotelData },
    });

    render(<MemoryRouter><SelectHotels /></MemoryRouter>);
    
    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.FetchActiveHotel
      ).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('sort-price'));

    await waitFor(() => {
      expect(
        require("../../HotelService").hotelService.SortActiveHotel
      ).toHaveBeenCalled();
    });
  });
});
