import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();

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
    branch_id: '',
  });

  const [roles, setRoles] = useState([]);
  const [branchs, setBranchs] = useState([]);

  useEffect(() => {
    fetchData('role', setRoles);
    fetchData('branchs', setBranchs);
  }, []);

  const fetchData = async (table, setter) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) console.error(`Error fetching ${table}:`, error);
    else setter(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    const { data, error } = await supabase.from('users').insert([formData]);

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el usuario.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error al crear:', error);
    } else {
      toast({
        title: 'Éxito',
        description: 'Usuario registrado correctamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setFormData({
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
        branch_id: '',
      });

      console.log('Usuario creado:', data);
    }
  };

  const handleReset = () => {
    setFormData({
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
      branch_id: '',
    });
  };

  const handleNavigate = (route) => navigate(route);

  return (
    <Box className="signup-form" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
      <Heading mb={4}>Registrar Usuarios</Heading>
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
        <Button onClick={() => handleNavigate('/ListUsers')} colorScheme="teal">Listar Usuarios</Button>
        <Button onClick={() => handleNavigate('/Admin')} colorScheme="blue">Volver a Opciones</Button>
        <Button onClick={() => handleNavigate('/LoginForm')} colorScheme="red">Cerrar Sesión</Button>
      </Box>
      <Box as='form' onSubmit={(e) => { e.preventDefault(); handleCreate(); }} width="100%" maxWidth="800px" padding={6} boxShadow="lg" borderRadius="md">
        <SimpleGrid columns={[1, 2]} spacing={4}>
          {renderInputField('Nombre', 'firstname', 'text', true)}
          {renderInputField('Apellido', 'lastname', 'text', true)}
          {renderInputField('Username', 'username', 'text', true)}
          {renderInputField('Edad', 'age', 'number', true)}
          {renderSelectField('Rol', 'role_id', roles, true)}
          {renderInputField('Fecha de Nacimiento', 'birthdate', 'date', true)}
          {renderInputField('Fecha de Ingreso', 'check_in_date', 'date', true)}
          {renderInputField('Correo', 'email', 'email', true)}
          {renderInputField('Celular', 'phone_number', 'text', true)}
          {renderInputField('Contraseña', 'password', 'password', true)}
          {renderInputField('C.I.', 'ci', 'text', true)}
          {renderSelectField('Sucursal', 'branch_id', branchs, true)}
        </SimpleGrid>

        <Box display="flex" justifyContent="space-around" mt={6}>
          <Button type="submit" colorScheme="teal">Crear</Button>
          <Button onClick={handleReset} colorScheme="gray">Limpiar</Button>
        </Box>
      </Box>
    </Box>
  );

  function renderInputField(label, name, type, isRequired = false) {
    return (
      <FormControl id={name} isRequired={isRequired}>
        <FormLabel>{label}</FormLabel>
        <Input type={type} name={name} value={formData[name]} onChange={handleChange} />
      </FormControl>
    );
  }

  function renderSelectField(label, name, options, isRequired = false) {
    return (
      <FormControl id={name} isRequired={isRequired}>
        <FormLabel>{label}</FormLabel>
        <Select name={name} value={formData[name]} onChange={handleChange}>
          <option value="">Seleccione {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.name || option.role_name}
            </option>
          ))}
        </Select>
      </FormControl>
    );
  }
};

export default Register;
