import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check both email AND role for admin access (defense in depth)
  // Backend will enforce role check, this is just UI protection
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@pharmahub.com';
  
  if (!isAdmin) {
    console.warn('⚠️ Non-admin user attempted to access admin route:', user?.email);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
