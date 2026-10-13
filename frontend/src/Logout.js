import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  }, [navigate]);
  return (
    <div className="container py-5 text-center">
      <div className="alert alert-info">Logging out...</div>
    </div>
  );
}

export default Logout;
