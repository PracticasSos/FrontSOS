// src/components/LoginPage.js
import React, { useState } from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, useToast, Image } from '@chakra-ui/react';
import { loginUser } from '../services/apiService';
import usericon from '../img/login-register/usericon.svg'

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await loginUser(email, password);
      console.log('User logged in:', user);
      // Aquí puedes manejar el almacenamiento del usuario o redirigir a otra página
      toast({
        title: 'Login successful',
        description: `Welcome ${user.firstname}!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid login credentials.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box display={'flex'} flexDirection={"column"} textAlign={"center"} maxW="sm" mx="auto" mt="10" p="3" borderWidth="1px" borderRadius="lg">
      <Box display={"flex"} justifyContent={"center"} >
            <Image src={usericon} width={"30%"} alt='Profile Image' />
        </Box>
      <Heading mt={"3"} mb="1">Login</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl id="email" mb="4">
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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