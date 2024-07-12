import React from 'react';
import { supabase } from '../../api/supabase';
import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  return (
    <Button onClick={handleLogout}>
      Cerrar Sesión
    </Button>
  );
};

export default LogoutButton;
