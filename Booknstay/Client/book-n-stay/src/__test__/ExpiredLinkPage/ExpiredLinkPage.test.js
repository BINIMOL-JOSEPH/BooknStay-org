import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import { MemoryRouter } from 'react-router-dom'; 
import ExpiredLinkPage from '../../components/ExpiredLinkPage/ExpiredLinkPage';

describe('ExpiredLinkPage component', () => {
    test('renders the component with correct content', () => {
      render(
        <MemoryRouter> 
          <ExpiredLinkPage />
        </MemoryRouter>
      );
  
      expect(screen.getByText(/Password Reset Link Expired/i)).toBeInTheDocument();
      expect(
        screen.getByText(/The reset password link has expired. Please request a new one./i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Resend Link/i)).toBeInTheDocument();
    });
  
});