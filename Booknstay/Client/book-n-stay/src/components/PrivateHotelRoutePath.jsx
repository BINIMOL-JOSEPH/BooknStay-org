import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivateHotelRoute = ({ element }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.userType !== 'hotel') {
      navigate('/not-found', { replace: true });
    }
  }, [user, navigate]);

  return element;
};

export default PrivateHotelRoute;
