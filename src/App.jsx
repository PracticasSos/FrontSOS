import { useEffect, useState } from "react";
import Welcome from "./components/Welcome";
import { Container, useColorModeValue } from "@chakra-ui/react";
import AppRouter from "./routers";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./api/supabase";
import { useUserPermissions } from './components/optionsauth/UserPermissions';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Colores adaptativos para light/dark mode
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const { allowedRoutes, loading: permissionsLoading } = useUserPermissions(userData);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, role_id, tenant_id, auth_id')
            .eq('auth_id', session.user.id)
            .single();

          if (!userError && user) {
            const fullUserData = { ...session.user, ...user };
            localStorage.setItem('user', JSON.stringify(fullUserData));
            setUserData(fullUserData);
            setShowSplash(false);
            setIsChecking(false);
            return;
          }
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsChecking(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (userData && !permissionsLoading && allowedRoutes.length > 0) {
      const dashboardRoutes = {
        1: '/admin',
        2: '/optometra',
        3: '/vendedor',
        4: '/SuperAdmin'
      };

      const defaultRoute = dashboardRoutes[userData.role_id] || '/LoginForm';
      
      if (!allowedRoutes.includes(location.pathname) || location.pathname === '/') {
        navigate(defaultRoute);
      }
    }
  }, [userData, allowedRoutes, permissionsLoading, location.pathname, navigate]);

  const handleWelcomeFinish = () => {
    setShowSplash(false);
    navigate("/LoginForm"); 
  };

  if (isChecking || permissionsLoading) {
    return null;
  }

  return showSplash ? (
    <Welcome onFinish={handleWelcomeFinish} />
  ) : (
    <Container maxW="100%" padding="0px" bg={bgColor} minH="100vh">
      <AppRouter />
    </Container>
  );
}

export default App;