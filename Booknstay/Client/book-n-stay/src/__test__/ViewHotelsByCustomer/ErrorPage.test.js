import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from 'react-router-dom';
import ErrorPage from '../../components/ViewHotelsByCustomer/ErrorPage';
import '@testing-library/jest-dom';

describe("ErrorPage component", () => {
  test("renders correctly", () => {
    const { getByText } =         render(<MemoryRouter>< ErrorPage/></MemoryRouter>);


    const headingElement = getByText(/500/i);
    const errorMessageElement = getByText(/Oops! Something went wrong./i);
    const serverIssueMessageElement = getByText(/We're sorry, but there seems to be an issue with our server./i);

    expect(headingElement).toBeInTheDocument();
    expect(errorMessageElement).toBeInTheDocument();
    expect(serverIssueMessageElement).toBeInTheDocument();
  });

});
