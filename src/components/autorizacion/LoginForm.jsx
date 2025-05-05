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

    const user = authData.user;
    console.log('Usuario autenticado:', user);

    // 2) Buscar usuario en la tabla 'users' usando el auth_id
    const { data, error } = await supabase
      .from('users')
      .select('id, role_id, auth_id')
      .eq('auth_id', user.id); // Aquí estamos usando el UUID

    if (error) {
      console.error('Error al obtener datos del usuario:', error);
      setErrorMessage('No se encontró los datos del usuario.');
      setLoading(false);
      return;
    }

    if (data.length === 0) {
      setErrorMessage('Usuario no encontrado.');
      setLoading(false);
      return;
    }

    const userData = data[0]; // Solo tomamos el primer usuario si hay varios
    console.log('Datos del usuario:', userData);

    // localStorage.setItem('user', JSON.stringify(userData)); // Guardar datos del usuario en localStorage
    // 3) Mapeo directo de role_id a nombre del rol
    const roleMap = {
      1: 'Admin',
      2: 'Optometra',
      3: 'Vendedor',
    };

    const fullUserData = {
      ...authData.user,
      ...userData
    };
    localStorage.setItem('user', JSON.stringify(fullUserData));
    

    const roleName = roleMap[userData.role_id]; // Usamos el role_id para obtener el nombre del rol
    console.log('Nombre del rol:', roleName);

    // 4) Redirigir según el rol
    setLoading(false);
    if (roleName === 'Admin') navigate('/admin');
    else if (roleName === 'Optometra') navigate('/optometra');
    else if (roleName === 'Vendedor') navigate('/vendedor');
    else {
      setErrorMessage('Rol desconocido');
      navigate('/'); // Redirigir a página principal si no hay rol reconocido
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