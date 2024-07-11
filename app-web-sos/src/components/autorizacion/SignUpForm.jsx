import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input, Select } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/SignUpFormStyles.css';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    age: '',
    role_id: '',
    birthdate: '',
    check_in_date: '',
    email: '',
    phone_number: '',
    password: '',
    ci: '',
    branch_id: ''
  });

  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
    fetchBranches();
  }, []);

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from('role')
      .select('*');

    if (error) {
      console.error('Error fetching roles:', error);
    } else {
      setRoles(data);
    }
  };

  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from('branch')
      .select('*');

    if (error) {
      console.error('Error fetching branches:', error);
    } else {
      setBranches(data);
    }
  };

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

  /*const handleListUsers = () => {
    navigate('/ListUsers');
  };*/
  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <Box className="signup-form">
      <Button onClick={() => handleNavigate('/ListUsers')} mt={4}>
        Listar Usuarios
      </Button>
      <form onSubmit={handleSubmit}>
        <FormControl id="firstname" isRequired>
          <FormLabel>Nombre</FormLabel>
          <Input type="text" name="firstname" value={formData.firstname} onChange={handleChange} />
        </FormControl>
        <FormControl id="lastname" isRequired>
          <FormLabel>Apellido</FormLabel>
          <Input type="text" name="lastname" value={formData.lastname} onChange={handleChange} />
        </FormControl>
        <FormControl id="username" isRequired>
          <FormLabel>Username</FormLabel>
          <Input type="text" name="username" value={formData.username} onChange={handleChange} />
        </FormControl>
        <FormControl id="age" isRequired>
          <FormLabel>Edad</FormLabel>
          <Input type="number" name="age" value={formData.age} onChange={handleChange} />
        </FormControl>
        <FormControl id="role_id" isRequired>
          <FormLabel>Rol</FormLabel>
          <Select name="role_id" value={formData.role_id} onChange={handleChange}>
            <option value="">Seleccione un rol</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.role_name}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl id="birthdate" isRequired>
          <FormLabel>Fecha de Nacimiento</FormLabel>
          <Input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
        </FormControl>
        <FormControl id="check_in_date" isRequired>
          <FormLabel>Fecha de Ingreso</FormLabel>
          <Input type="date" name="check_in_date" value={formData.check_in_date} onChange={handleChange} />
        </FormControl>
        <FormControl id="email" isRequired>
          <FormLabel>Correo</FormLabel>
          <Input type="email" name="email" value={formData.email} onChange={handleChange} />
        </FormControl>
        <FormControl id="phone_number" isRequired>
          <FormLabel>Celular</FormLabel>
          <Input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Contraseña</FormLabel>
          <Input type="password" name="password" value={formData.password} onChange={handleChange} />
        </FormControl>
        <FormControl id="ci" isRequired>
          <FormLabel>C.I.</FormLabel>
          <Input type="text" name="ci" value={formData.ci} onChange={handleChange} />
        </FormControl>
        <FormControl id="branch_id" isRequired>
          <FormLabel>Sucursal</FormLabel>
          <Select name="branch_id" value={formData.branch_id} onChange={handleChange}>
            <option value="">Seleccione una sucursal</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name_branch}</option>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" mt={4}>Registrar</Button>
      </form>
    </Box>
  );
};

export default SignUpForm;
