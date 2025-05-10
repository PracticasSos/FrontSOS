import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Icon,
} from '@chakra-ui/react';
import { FaUser } from 'react-icons/fa';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    // 1) Login con Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (authError) {
      setErrorMessage(authError.message);
      setLoading(false);
      return;
    }
    if (!authData?.session) {
      setErrorMessage('No se pudo iniciar sesión.');
      setLoading(false);
      return;
    }

    // // --- DEBUG: imprimir el JWT y los claims ---
    // console.log('JWT (access_token):', authData.session.access_token);
    // console.log('Session user metadata:', authData.session.user.user_metadata);
    // // También puedes inspeccionar la sesión completa:
    // const { data: sessionData } = await supabase.auth.getSession();
    // console.log('Current session:', sessionData);

    const user = authData.user;
    // console.log('Usuario autenticado:', user);

    // 2) Buscar usuario en la tabla 'users' usando el auth_id
    const { data, error } = await supabase
      .from('users')
      .select('id, role_id, tenant_id, auth_id')
      .eq('auth_id', user.id);

    if (error) {
      console.error('Error al obtener datos del usuario:', error);
      setErrorMessage('No se encontró los datos del usuario.');
      setLoading(false);
      return;
    }
    if (!data || data.length === 0) {
      setErrorMessage('Usuario no encontrado.');
      setLoading(false);
      return;
    }

    const userData = data[0];
    console.log('Datos del usuario (tabla users):', userData);

    // 3) Guardar todo en localStorage
    const fullUserData = {
      ...authData.user,
      ...userData,
    };
    localStorage.setItem('user', JSON.stringify(fullUserData));

    // 4) Redirigir según el role_id
    setLoading(false);
    switch (userData.role_id) {
      case 1:
        navigate('/admin');
        break;
      case 4:
        navigate('/admin');
        break;
      case 2:
        navigate('/optometra');
        break;
      case 3:
        navigate('/vendedor');
        break;
      default:
        setErrorMessage('Rol desconocido');
        navigate('/');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minH="100vh" bg="gray.50">
      <Box w="100%" maxW="400px" bg="white" p={6} borderRadius="md" boxShadow="md">
        <Box textAlign="center" mb={6}>
          <Icon as={FaUser} boxSize={12} color="teal.500" />
        </Box>

        {errorMessage && (
          <Alert status="error" mb={4} borderRadius="sm">
            <AlertIcon />
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl id="email" isRequired mb={4}>
            <FormLabel>Correo</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder="tú@correo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl id="password" isRequired mb={6}>
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            w="100%"
            isLoading={loading}
            loadingText="Ingresando..."
          >
            Iniciar Sesión
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default LoginForm;
