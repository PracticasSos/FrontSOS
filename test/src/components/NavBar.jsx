import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button } from '@chakra-ui/react';
import LogoutButton from './LogOut/LogOut';

const NavBar = () => {
  return (
    <Box as="nav" padding="1rem" borderBottom="1px solid #ccc">
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Link to="/">Inicio</Link>
          <Link to="/admin" style={{ marginLeft: '1rem' }}>Admin</Link>
          <Link to="/optometra" style={{ marginLeft: '1rem' }}>Optometra</Link>
          <Link to="/vendedor" style={{ marginLeft: '1rem' }}>Vendedor</Link>
        </Box>
        <LogoutButton />
      </Box>
    </Box>
  );
};

export default NavBar;
