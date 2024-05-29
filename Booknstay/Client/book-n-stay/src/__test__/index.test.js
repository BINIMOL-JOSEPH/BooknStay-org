import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { ToastContainer } from 'react-toastify';

test('renders App component with ToastContainer', () => {
  render(
    <React.StrictMode>
      <ToastContainer />
      <App />
    </React.StrictMode>
  );
});
