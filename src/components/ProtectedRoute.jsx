import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserPermissions, isRouteAllowed } from './optionsauth/UserPermissions';

const ProtectedRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const { allowedRoutes, loading: permissionsLoading } = useUserPermissions(user);

  // Mostrar loading mientras se cargan datos
  if (authLoading || permissionsLoading) {
    return null; // o un spinner si prefieres
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  // Verificar permisos para la ruta actual
  const hasPermission = isRouteAllowed(location.pathname, allowedRoutes);

  if (!hasPermission) {
    // Redirigir según el rol del usuario
    const defaultRoute = getDefaultRouteForRole(user.role_id);
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

// Función helper para obtener la ruta por defecto según el rol
const getDefaultRouteForRole = (roleId) => {
  switch (roleId) {
    case 1: return '/admin';
    case 2: return '/optometra';
    case 3: return '/vendedor';
    case 4: return '/SuperAdmin';
    default: return '/Login';
  }
};

export default ProtectedRoute;