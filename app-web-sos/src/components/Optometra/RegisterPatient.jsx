import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input, Select, Textarea, SimpleGrid, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';


const RegisterPatientForm = () => {
  const navigate = useNavigate();

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
    pt_recommendations: '',
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('id, username');
    if (error) console.error('Error fetching users:', error);
    else setUsers(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const { data, error } = await supabase.from('patients').insert([formData]);
    if (error) console.error('Error al registrar paciente:', error);
    else console.log('Paciente registrado:', data);
  };

  const handleReset = () => {
    setFormData({
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
      pt_recommendations: '',
    });
  };

  const handleNavigate = (route) => navigate(route);

  return (
    <Box className="register-patient-form" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
      <Heading mb={4}>Registrar Paciente</Heading>
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
        <Button onClick={() => handleNavigate('/ListPatients')} colorScheme="teal">Listar Pacientes</Button>
        <Button onClick={() => handleNavigate('/Admin')} colorScheme="blue">Volver a Opciones</Button>
        <Button onClick={() => handleNavigate('/LoginForm')} colorScheme="red">Cerrar Sesión</Button>
      </Box>

      <Box as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} width="100%" maxWidth="800px" padding={6} boxShadow="lg" borderRadius="md">
        <SimpleGrid columns={[1, 2]} spacing={4}>
          {renderSelectField('Usuario', 'user_id', users)}
          {renderInputField('Nombre', 'pt_firstname', 'text', true)}
          {renderInputField('Apellido', 'pt_lastname', 'text', true)}
          {renderInputField('Ocupación', 'pt_occupation', 'text')}
          {renderInputField('Dirección', 'pt_address', 'text')}
          {renderInputField('Teléfono', 'pt_phone', 'text')}
          {renderInputField('Edad', 'pt_age', 'number')}
          {renderInputField('C.I.', 'pt_ci', 'text')}
          {renderInputField('Ciudad', 'pt_city', 'text')}
          {renderInputField('Correo', 'pt_email', 'email')}
          {renderTextareaField('Razón de Consulta', 'pt_consultation_reason')}
          {renderTextareaField('Recomendaciones', 'pt_recommendations')}
        </SimpleGrid>

        <Box display="flex" justifyContent="space-around" mt={6}>
          <Button type="submit" colorScheme="teal">Guardar</Button>
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

  function renderTextareaField(label, name) {
    return (
      <FormControl id={name}>
        <FormLabel>{label}</FormLabel>
        <Textarea name={name} value={formData[name]} onChange={handleChange} />
      </FormControl>
    );
  }

  function renderSelectField(label, name, options) {
    return (
      <FormControl id={name} isRequired>
        <FormLabel>{label}</FormLabel>
        <Select name={name} value={formData[name]} onChange={handleChange}>
          <option value="">Seleccione {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.username}
            </option>
          ))}
        </Select>
      </FormControl>
    );
  }
};

export default RegisterPatientForm;
