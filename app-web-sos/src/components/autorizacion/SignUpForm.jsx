import React, { useState } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input, Select } from '@chakra-ui/react';
import '../../Styles/SignUpFormStyles.css';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    edad: '',
    rol: '',
    nacimiento: '',
    fecha_ingreso: '',
    correo: '',
    celular: '',
    contraseña: '',
    ci: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('users')
      .insert([formData]);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('User registered:', data);
    }
  };

  return (
    <Box className="signup-form">
      <form onSubmit={handleSubmit}>
        <FormControl id="nombre" isRequired>
          <FormLabel>Nombre</FormLabel>
          <Input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
        </FormControl>
        <FormControl id="apellido" isRequired>
          <FormLabel>Apellido</FormLabel>
          <Input type="text" name="apellido" value={formData.apellido} onChange={handleChange} />
        </FormControl>
        <FormControl id="username" isRequired>
          <FormLabel>Username</FormLabel>
          <Input type="text" name="username" value={formData.username} onChange={handleChange} />
        </FormControl>
        <FormControl id="edad" isRequired>
          <FormLabel>Edad</FormLabel>
          <Input type="number" name="edad" value={formData.edad} onChange={handleChange} />
        </FormControl>
        <FormControl id="rol" isRequired>
          <FormLabel>Rol</FormLabel>
          <Select name="rol" value={formData.rol} onChange={handleChange}>
            <option value="">Seleccione un rol</option>
            <option value="1">Admin</option>
            <option value="2">Optometra</option>
            <option value="3">Vendedor</option>
          </Select>
        </FormControl>
        <FormControl id="nacimiento" isRequired>
          <FormLabel>Fecha de Nacimiento</FormLabel>
          <Input type="date" name="nacimiento" value={formData.nacimiento} onChange={handleChange} />
        </FormControl>
        <FormControl id="fecha_ingreso" isRequired>
          <FormLabel>Fecha de Ingreso</FormLabel>
          <Input type="date" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} />
        </FormControl>
        <FormControl id="correo" isRequired>
          <FormLabel>Correo</FormLabel>
          <Input type="email" name="correo" value={formData.correo} onChange={handleChange} />
        </FormControl>
        <FormControl id="celular" isRequired>
          <FormLabel>Celular</FormLabel>
          <Input type="text" name="celular" value={formData.celular} onChange={handleChange} />
        </FormControl>
        <FormControl id="contraseña" isRequired>
          <FormLabel>Contraseña</FormLabel>
          <Input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} />
        </FormControl>
        <FormControl id="ci" isRequired>
          <FormLabel>C.I.</FormLabel>
          <Input type="text" name="ci" value={formData.ci} onChange={handleChange} />
        </FormControl>
        <Button type="submit" mt={4}>Registrar</Button>
      </form>
    </Box>
  );
};

export default SignUpForm;
