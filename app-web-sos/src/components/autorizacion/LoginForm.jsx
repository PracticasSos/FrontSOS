import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
//import '../../Styles/LoginFormStyles.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { correo, contraseña } = formData;

    // Authenticate with Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, rol')
      .eq('correo', correo)
      .eq('contraseña', contraseña)
      .single();

    if (error) {
      console.error('Error:', error);
    } else {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      switch (user.rol) {
        case 1:
          navigate('/admin');
          break;
        case 2:
          navigate('/optometra');
          break;
        case 3:
          navigate('/vendedor');
          break;
        default:
          navigate('/');
          break;
      }
    }
  };

  return (
    <Box className="login-form">
      <form onSubmit={handleSubmit}>
        <FormControl id="correo" isRequired>
          <FormLabel>Correo</FormLabel>
          <Input type="email" name="correo" value={formData.correo} onChange={handleChange} />
        </FormControl>
        <FormControl id="contraseña" isRequired>
          <FormLabel>Contraseña</FormLabel>
          <Input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} />
        </FormControl>
        <Button type="submit" mt={4}>Iniciar Sesión</Button>
      </form>
    </Box>
  );
};

export default LoginForm;
