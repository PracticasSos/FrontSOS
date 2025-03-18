import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon, Icon } from '@chakra-ui/react';
import { FaUser } from 'react-icons/fa';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a session already exists
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('Sesión encontrada al cargar la página:', session.user);
        navigateToRole(session.user);
      }
    };
    checkSession();

    // Listening for changes in authentication state
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        console.log('Cambio de estado de autenticación:', session.user);
        navigateToRole(session.user);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const navigateToRole = async (user) => {
    console.log('Redirigiendo según el rol del usuario:', user);
    localStorage.setItem('user', JSON.stringify(user)); // Save user info in localStorage

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('Error obteniendo el rol del usuario:', userError);
      setErrorMessage('Error: no se pudo obtener el rol del usuario');
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from('role')
      .select('role_name')
      .eq('id', userData.role_id)
      .single();

    if (roleError) {
      console.error('Error obteniendo el nombre del rol:', roleError);
      setErrorMessage('Error: no se pudo obtener el nombre del rol');
      return;
    }

    console.log('Rol del usuario:', roleData.role_name);

    // Redirect based on role
    switch (roleData.role_name) {
      case 'Admin':
        navigate('/admin');
        break;
      case 'Optometra':
        navigate('/optometra');
        break;
      case 'Vendedor':
        navigate('/vendedor');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
  
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
    if (error) {
      console.error('Error:', error);
      setErrorMessage('Error: credenciales incorrectas');
    } else {
      console.log("Inicio de sesión exitoso:", data);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user)); // Store user in localStorage
        await navigateToRole(data.user);
      }
    }
  };

  return (
    <Box className="login-form" display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Box width="100%" maxWidth="400px">
        {errorMessage && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {errorMessage}
          </Alert>
        )}
        <Box display="flex" justifyContent="center" mb={4}>
          <Icon as={FaUser} boxSize={8} />
        </Box>
        <form onSubmit={handleSubmit}>
          <FormControl id="email" isRequired>
            <FormLabel>Correo</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
          </FormControl>
          <FormControl id="password" isRequired mt={4}>
            <FormLabel>Contraseña</FormLabel>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} />
          </FormControl>
          <Button type="submit" mt={4} width="100%">Iniciar Sesión</Button>
        </form>
      </Box>
    </Box>
  );
};

export default LoginForm;
