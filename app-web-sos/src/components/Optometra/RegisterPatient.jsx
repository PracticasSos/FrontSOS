import { useState, useEffect, Children } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Input, Textarea, Select, Text, Spinner } from '@chakra-ui/react';
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
      navigate('/Login');
    }, 2000); // Show the logout screen for 2 seconds
  };

  if (isLoggingOut) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Text fontSize="2xl" mr={4}>Cerrando sesión...</Text>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding={4} minHeight="100vh">
        <Box width="100%" maxHeight="800px">
            <Box display="flex" justifyContent="space-between" borderBottom="1px solid black" paddingBottom={2} marginBottom={4}>
              <Box className="register-patient-form">
                <Button onClick={() => handleNavigate('/ListPatients')}>
                  Listar Pacientes
                </Button>
                <Button onClick={() => handleNavigate('/Admin')}>
                  Volver a Opciones
                </Button>
                  <Button onClick={handleLogout}>
                    Cerrar Sesión
                  </Button>
              </Box>
            </Box>
            <Box as="form" onSubmit={handleSubmit}>
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4} marginBottom={4}>
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
                     
                      <div className="col-span-2 grid grid-cols-4 gap-2">
                        <Button type="submit" colorScheme="blue" variant="solid">Guardar</Button>
                        <Button type="submit" colorScheme="blue" variant="solid">Mofificar</Button>
                        <Button type="submit" colorScheme="blue" variant="solid">Actualizar</Button>
                        <Button type="submit" colorScheme="blue" variant="solid">Eliminar</Button>
                        <Button type="submit" colorScheme="blue" variant="solid">Uso</Button>
                        <Button type="submit" colorScheme="blue" variant="solid">Requerido</Button>
                        <Button type="submit" colorScheme="blue" variant="solid">Final</Button>
                      </div>
                </Box>
            </Box>
        </Box>
    </Box>
  );
};

export default RegisterPatientForm;
