import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivateSupervisorRoute = ({ element }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.userType !== 'supervisor')) {
      navigate('/not-found', { replace: true });
    }
  }, [user, navigate]);

  return element;
};

export default PrivateSupervisorRoute;
