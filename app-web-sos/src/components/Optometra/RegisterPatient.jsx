import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input, Textarea, Select } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const RegisterPatientForm = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    pt_firstname: '',
    pt_lastname: '',
    pt_occupation: '',
    pt_address: '',
    pt_phone: '',
    pt_age: '',
    pt_ci: '',
    pt_city: '',
    pt_email: '',
    pt_consultation_reason: '',
    pt_recommendations: ''
  });

  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, username');

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('patients')
      .insert([formData]);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Patient registered:', data);
    }
  };

  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <Box className="register-patient-form">
      <Button onClick={() => handleNavigate('/ListPatients')} mt={4}>
        Listar Pacientes
      </Button>
      <Button onClick={() => handleNavigate('/Optometra')} mt={4}>
          Volver a Opciones
      </Button>
      <form onSubmit={handleSubmit}>
        <FormControl id="user_id" isRequired>
          <FormLabel>Usuario</FormLabel>
          <Select name="user_id" value={formData.user_id} onChange={handleChange}>
            <option value="">Seleccione un usuario</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl id="pt_firstname" isRequired>
          <FormLabel>Nombre</FormLabel>
          <Input type="text" name="pt_firstname" value={formData.pt_firstname} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_lastname" isRequired>
          <FormLabel>Apellido</FormLabel>
          <Input type="text" name="pt_lastname" value={formData.pt_lastname} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_occupation" isRequired>
          <FormLabel>Ocupación</FormLabel>
          <Input type="text" name="pt_occupation" value={formData.pt_occupation} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_address" isRequired>
          <FormLabel>Dirección</FormLabel>
          <Input type="text" name="pt_address" value={formData.pt_address} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_phone" isRequired>
          <FormLabel>Teléfono</FormLabel>
          <Input type="text" name="pt_phone" value={formData.pt_phone} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_age" isRequired>
          <FormLabel>Edad</FormLabel>
          <Input type="number" name="pt_age" value={formData.pt_age} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_ci" isRequired>
          <FormLabel>C.I.</FormLabel>
          <Input type="text" name="pt_ci" value={formData.pt_ci} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_city" isRequired>
          <FormLabel>Ciudad</FormLabel>
          <Input type="text" name="pt_city" value={formData.pt_city} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_email" isRequired>
          <FormLabel>Correo</FormLabel>
          <Input type="email" name="pt_email" value={formData.pt_email} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_consultation_reason">
          <FormLabel>Razón de Consulta</FormLabel>
          <Textarea name="pt_consultation_reason" value={formData.pt_consultation_reason} onChange={handleChange} />
        </FormControl>
        <FormControl id="pt_recommendations">
          <FormLabel>Recomendaciones</FormLabel>
          <Textarea name="pt_recommendations" value={formData.pt_recommendations} onChange={handleChange} />
        </FormControl>
        <Button type="submit" mt={4}>Registrar</Button>
      </form>
    </Box>
  );
};

export default RegisterPatientForm;
