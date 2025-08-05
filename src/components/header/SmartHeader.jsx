import { useAuth } from '../AuthContext';
import HeaderAdmin from './HeaderAdmin';
import HeaderVendedor from './HeaderVendedor';
import HeaderOptometra from './HeaderOptometra';

const SmartHeader = ({ moduleSpecificButton = null }) => {
  const { user, loading } = useAuth();

  // Si está cargando, no mostrar header
  if (loading) {
    return null;
  }

  // Si no hay usuario, no mostrar header
  if (!user || !user.role_id) {
    return null;
  }

  // Determinar qué header mostrar según el rol
  switch (user.role_id) {
    case 1: // Admin
    case 4: // SuperAdmin
      return <HeaderAdmin moduleSpecificButton={moduleSpecificButton} />;
    
    case 2: // Optometra
      return <HeaderOptometra moduleSpecificButton={moduleSpecificButton} />;
    
    case 3: // Vendedor
      return <HeaderVendedor moduleSpecificButton={moduleSpecificButton} />;
    
    default:
      return <HeaderAdmin moduleSpecificButton={moduleSpecificButton} />;
  }
};

export default SmartHeader;