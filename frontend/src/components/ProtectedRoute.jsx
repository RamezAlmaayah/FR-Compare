import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <p className="container py-5">Loading...</p>;
  }

  return isAuthenticated ? children || <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
