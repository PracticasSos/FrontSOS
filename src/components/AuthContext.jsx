import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session?.user) {
          // Buscar datos adicionales del usuario en la tabla users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();

          if (userData && !userError) {
            // Combinar datos de sesión con datos de usuario
            setUser({
              ...session.user,
              ...userData
            });
          } else {
            console.error('Error fetching user data:', userError);
            setUser(null);
            navigate('/Login');
          }
        } else {
          setUser(null);
          navigate('/Login');
        }
      } catch (error) {
        console.error('Session error:', error);
        setUser(null);
        navigate('/Login');
      }

      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // También buscar datos adicionales en el cambio de auth
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (userData && !userError) {
          setUser({
            ...session.user,
            ...userData
          });
        } else {
          setUser(null);
          navigate('/Login');
        }
      } else {
        setUser(null);
        navigate('/Login');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);