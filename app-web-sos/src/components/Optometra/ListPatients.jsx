import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ListPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, pt_firstname, pt_lastname, pt_occupation, pt_address, pt_phone, pt_age, pt_ci, pt_city, pt_email, pt_consultation_reason, pt_recommendations');

    if (error) {
      console.error('Error fetching patients:', error);
    } else {
      setPatients(data);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredPatients = patients.filter(patient => 
    patient.pt_firstname.toLowerCase().includes(search.toLowerCase()) ||
    patient.pt_lastname.toLowerCase().includes(search.toLowerCase()) ||
    patient.pt_phone.includes(search)
  );

  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Lista de Pacientes</Heading>
      <Button onClick={() => handleNavigate('/RegisterPatient')} mt={4}>
        Registrar Pacientes
      </Button>
      <Button onClick={() => handleNavigate('/Admin')} mt={4}>
        Volver a Opciones
      </Button>
      <Button onClick={() => handleNavigate('/Login')} mt={4}>
          Cerrar Sesión
        </Button>
      <Input 
        placeholder="Buscar por nombre, apellido o teléfono" 
        value={search} 
        onChange={handleSearchChange} 
        mb={4} 
      />
      <Box overflowX="auto">
        <Table variant="simple" minWidth="800px">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Nombre</Th>
              <Th>Apellido</Th>
              <Th>Ocupación</Th>
              <Th>Dirección</Th>
              <Th>Teléfono</Th>
              <Th>Edad</Th>
              <Th>C.I.</Th>
              <Th>Ciudad</Th>
              <Th>Correo</Th>
              <Th>Razón de Consulta</Th>
              <Th>Recomendaciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPatients.map(patient => (
              <Tr key={patient.id}>
                <Td>{patient.id}</Td>
                <Td>{patient.pt_firstname}</Td>
                <Td>{patient.pt_lastname}</Td>
                <Td>{patient.pt_occupation}</Td>
                <Td>{patient.pt_address}</Td>
                <Td>{patient.pt_phone}</Td>
                <Td>{patient.pt_age}</Td>
                <Td>{patient.pt_ci}</Td>
                <Td>{patient.pt_city}</Td>
                <Td>{patient.pt_email}</Td>
                <Td>{patient.pt_consultation_reason}</Td>
                <Td>{patient.pt_recommendations}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ListPatients;
