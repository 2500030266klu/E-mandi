import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    // Redirect to home/login page if trying to access a protected route without being logged in
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
