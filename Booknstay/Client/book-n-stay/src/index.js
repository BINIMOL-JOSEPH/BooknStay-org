import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import reportWebVitals from './reportWebVitals';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Elements} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51OgfktSH5Ttsih91N6JwISv4CvJa2zBdo9vi8A4SSvhwogRbNKxXuAf8lRe7RT7TkGQyvTtzSyKbREbkb0Bwmk4e00EuTd2Odj');

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
    <ToastContainer/>
    <App />
    </Elements>
  </React.StrictMode>
);


reportWebVitals();
