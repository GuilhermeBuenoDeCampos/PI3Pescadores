import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children, allowedRoles = ['administrador', 'vendedor'] }) {
  const auth = useAuth();

  if (auth?.loading) {
    return null;
  }

  if (!allowedRoles.includes(auth?.user?.tipo_usuario)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
