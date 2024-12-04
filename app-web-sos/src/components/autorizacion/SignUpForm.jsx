import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input, Select, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/SignUpFormStyles.css';

const SignUpForm = () => {
  const navigate = useNavigate();

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
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetchData('role', setRoles);
    fetchData('branch', setBranches);
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
    if (error) console.error('Error al crear:', error);
    else console.log('Usuario creado:', data);
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
    <Box className="signup-form" display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Box width="100%" maxWidth="600px">
        <Box display="flex" justifyContent="space-around" paddingBottom="15px">
          <Button onClick={() => handleNavigate('/ListUsers')} mt={4}>Listar Usuarios</Button>
          <Button onClick={() => handleNavigate('/Admin')} mt={4}>Volver a Opciones</Button>
          <Button onClick={() => handleNavigate('/LoginForm')} mt={4}>Cerrar Sesión</Button>
        </Box>
        <form>
          <SimpleGrid columns={2} spacing={4}>
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
            {renderSelectField('Sucursal', 'branch_id', branches, true)}
          </SimpleGrid>

          <Box display="flex" justifyContent="space-around" mt={6}>
            <Button onClick={handleCreate} colorScheme="teal">Crear</Button>
            <Button onClick={handleReset} colorScheme="gray">Limpiar</Button>
          </Box>
        </form>
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
              {option.name_branch || option.role_name}
            </option>
          ))}
        </Select>
      </FormControl>
    );
  }
};

export default SignUpForm;
