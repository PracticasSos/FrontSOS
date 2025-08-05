import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función de logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      setUser(null);
      navigate('/login-form');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      setUser(null);
      navigate('/login-form');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();

          if (!isMounted) return;

          if (userData && !userError) {
            const fullUser = {
              ...session.user,
              ...userData
            };
            setUser(fullUser);
          } else {
            console.error('Error fetching user data:', userError);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session error:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // ✅ CAMBIO PRINCIPAL: Solo escuchar eventos específicos de logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      // Solo redirigir en eventos explícitos de logout
      if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login-form');
      } 
      // NO manejar SIGNED_IN aquí para evitar conflictos de navegación
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};