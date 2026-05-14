import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth?.loading) {
    return null;
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
