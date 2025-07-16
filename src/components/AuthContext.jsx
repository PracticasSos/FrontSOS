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
      localStorage.clear(); // Limpiar todo
      setUser(null);
      navigate('/LoginForm');
      window.location.reload(); // Forzar recarga completa
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      setUser(null);
      navigate('/LoginForm');
      window.location.reload();
    }
  };

  useEffect(() => {
    let isMounted = true; // Flag para evitar setState en componente desmontado

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return; // Salir si el componente se desmontó

        if (session?.user) {
          // Buscar datos adicionales del usuario
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();

          if (!isMounted) return;

          if (userData && !userError) {
            setUser({
              ...session.user,
              ...userData
            });
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

    // Listener más simple
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        navigate('/LoginForm');
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Solo actualizar user básico, sin fetch adicional aquí
        setUser(session.user);
      }
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