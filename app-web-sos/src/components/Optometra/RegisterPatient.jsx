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
    try {
      const { data, error } = await supabase.from('users').select('id, username');
      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_id || !formData.pt_firstname || !formData.pt_lastname) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([formData]);

      if (error) {
        console.error('Error:', error.message);
        alert("Ocurrió un error: " + error.message);
      } else {
        console.log('Paciente registrado:', data);
        alert("¡Registrado con éxito!");
      }
    } catch (err) {
      console.error('Error desconocido:', err);
      alert("Error inesperado. Intenta nuevamente.");
    }
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

      <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="800px" padding={6} boxShadow="lg" borderRadius="md">
      <SimpleGrid columns={[1, 2]} spacing={4}>
        <Box>
          {renderSelectField('Responsable', 'user_id', users)}
          {renderInputField('Nombre', 'pt_firstname', 'text', true)}
          {renderInputField('Apellido', 'pt_lastname', 'text', true)}
          {renderInputField('Ocupación', 'pt_occupation', 'text')}
          {renderInputField('Dirección', 'pt_address', 'text')}
          {renderInputField('Teléfono', 'pt_phone', 'text')}
          {renderTextareaField('Razón de Consulta', 'pt_consultation_reason')}
          {renderTextareaField('Recomendaciones', 'pt_recommendations')}
          <Box display="flex" justifyContent="space-around" mt={6}>
            <Button onClick={handleReset} colorScheme="gray">USO</Button>
            <Button onClick={handleReset} colorScheme="gray">FINAL</Button>
          </Box>
        </Box>
        <Box>
          {renderInputField('Edad', 'pt_age', 'number')}
          {renderInputField('C.I.', 'pt_ci', 'text')}
          {renderInputField('Ciudad', 'pt_city', 'text')}
          {renderInputField('Correo', 'pt_email', 'email')}
          <Box display="flex" justifyContent="space-around" mt={6}>
            <Button type="submit" colorScheme="teal">Guardar</Button>
            <Button onClick={handleReset} colorScheme="gray">Limpiar</Button>
          </Box>
        </Box>
      </SimpleGrid>
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