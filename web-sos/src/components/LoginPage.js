// src/components/LoginPage.js
import React, { useState } from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, Image, Center } from '@chakra-ui/react';
import ProfileImage from '../img/login-register/ProfileImage.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí podrías agregar la lógica para manejar el inicio de sesión,
    // como hacer una solicitud a tu API de Spring Boot
  };

  return (
    <Box display={'flex'} flexDirection={"column"} textAlign={"center"} maxW="sm" mx="auto" mt="10" p="5" borderWidth="1px" borderRadius="lg">
        <Box display={"flex"} border={"1px solid black"}>
            <Image marginLeft={"35%"} width={"100px"} src={ProfileImage} alt='Profile Image' />
        </Box>
      <Heading mb="6">Login</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl id="username" mb="4">
          <FormLabel>Username</FormLabel>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl id="password" mb="4">
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" width="full">Login</Button>
      </form>
    </Box>
  );
};

export default LoginPage;
