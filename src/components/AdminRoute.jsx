import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.email !== 'admin@pharmahub.com') {
    // Only allow admin user
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
