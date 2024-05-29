import  { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivateSupervisorAdminRoute = ({ element }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.userType !== 'supervisor' && user.userType !== 'admin')) {
      navigate('/not-found', { replace: true });
    }
  }, [user, navigate]);

  return element;
};

export default PrivateSupervisorAdminRoute;
