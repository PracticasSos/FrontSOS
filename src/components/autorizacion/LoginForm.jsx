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

    if (!authData || !authData.session) {
      setErrorMessage('No se pudo iniciar sesión.');
      setLoading(false);
      return;
    }

    // 2) Decodificar JWT para verificar claims
    try {
      const token = authData.session.access_token;
      const payload = JSON.parse(atob(token.split('.')[1]));
    } catch (err) {
      console.warn('Error decodificando JWT:', err);
    }

    const user = authData.user;

    // 3) Leer role buscándolo por email
    const { data, error } = await supabase
      .from('users')
      .select('role:role(role_name)')
      .eq('email', user.email)
      .single();
  
    if (error || !data) {
      console.error(error);
      setErrorMessage('Error cargando rol de usuario.');
      setLoading(false);
      return;
    }
  
    const roleName = data.role.role_name;
  
    // 4) Redirigir
    setLoading(false);
    if (roleName === 'Admin') navigate('/admin');
    else if (roleName === 'Optometra') navigate('/optometra');
    else if (roleName === 'Vendedor') navigate('/vendedor');
    else navigate('/');
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
