/*// src/components/RegisterPage.js
import React, { useState } from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, useToast } from '@chakra-ui/react';
import { registerUser } from '../services/apiService';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await registerUser({
        username,
        password,
        firstname,
        lastname,
        email,
        // otros campos necesarios
      });
      console.log('User registered:', user);
      toast({
        title: 'Registration successful',
        description: `Welcome ${user.firstname}!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Registration failed.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt="10" p="3" borderWidth="1px" borderRadius="lg">
      <Heading mb="6">Register</Heading>
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
        <FormControl id="firstname" mb="4">
          <FormLabel>First Name</FormLabel>
          <Input
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
        </FormControl>
        <FormControl id="lastname" mb="4">
          <FormLabel>Last Name</FormLabel>
          <Input
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </FormControl>
        <FormControl id="email" mb="4">
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" width="full">Register</Button>
      </form>
    </Box>
  );
};

export default RegisterPage;*/

// src/components/RegisterPage.js
import React, { useState } from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, useToast } from '@chakra-ui/react';
import { registerUser } from '../services/apiService';

const RegisterPage = () => {
    
  const [userData, setUserData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    age: '',
    charge: '',
    birthdate: '',
    check_in_date: '',
    ci: '',
    email: '',
    phone_number: '',
    password: '',
    roleNam: '',
    locked: false,
    disable: false,
    nameBr: '',
  });

  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const registeredUser = await registerUser(userData);
      console.log('User registered:', registeredUser);
      toast({
        title: 'Registration successful',
        description: `User ${registeredUser.username} has been registered successfully!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during registration.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box display={'flex'} flexDirection={"column"} textAlign={"center"} maxW="sm" mx="auto" mt="10" p="3" borderWidth="1px" borderRadius="lg">
      <Heading mt={"3"} mb="1">Register</Heading>
      <form onSubmit={handleSubmit}>
        {Object.keys(userData).map((key) => (
          <FormControl key={key} id={key} mb="4">
            <FormLabel>{key.replace('_', ' ').toUpperCase()}</FormLabel>
            <Input
              type={key === 'birthdate' || key === 'check_in_date' ? 'date' : 'text'}
              name={key}
              value={userData[key]}
              onChange={handleChange}
            />
          </FormControl>
        ))}
        <Button type="submit" colorScheme="blue" width="full">Register</Button>
      </form>
    </Box>
  );
};

export default RegisterPage;