import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    // Authenticate with Supabase
    const { user, error } = await supabase.auth.signIn({
      email,
      password
    });

    if (error) {
      console.error('Error:', error.message);
    } else {
      // Fetch user info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role_id')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        // Fetch role name based on role_id
        const { data: roleData, error: roleError } = await supabase
          .from('role')
          .select('role_name')
          .eq('id', userData.role_id)
          .single();

        if (roleError) {
          console.error('Error fetching role:', roleError);
        } else {
          // Redirect based on role name
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
    }
  };

  return (
    <Box className="login-form">
      <form onSubmit={handleSubmit}>
        <FormControl id="email" isRequired>
          <FormLabel>Correo</FormLabel>
          <Input type="email" name="email" value={formData.email} onChange={handleChange} />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Contraseña</FormLabel>
          <Input type="password" name="password" value={formData.password} onChange={handleChange} />
        </FormControl>
        <Button type="submit" mt={4}>Iniciar Sesión</Button>
      </form>
    </Box>
  );
};

export default LoginForm;
