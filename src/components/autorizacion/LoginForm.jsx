import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input, Alert, AlertIcon, Icon } from '@chakra-ui/react';
import { FaUser } from 'react-icons/fa';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    // Authenticate with Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role_id')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error) {
      console.error('Error:', error);
      setErrorMessage('Error: credenciales incorrectas');
    } else {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // Fetch role name based on role_id
      const { data: roleData, error: roleError } = await supabase
        .from('role')
        .select('role_name')
        .eq('id', user.role_id)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        setErrorMessage('Error: no se pudo obtener el rol del usuario');
      } else {
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
