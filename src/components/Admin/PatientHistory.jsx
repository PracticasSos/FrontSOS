import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Text, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, pt_firstname, pt_lastname, pt_ci');

    if (error) {
      console.error('Error fetching patients:', error);
    } else {
      setPatients(data);
      setFilteredPatients(data);
    }
  };

  const fetchSales = async (patientId) => {
    const { data, error } = await supabase
      .from('sales')
      .select('id, date, inventario (brand), lens:lens_id(lens_type), total, credit, balance, payment_in')
      .eq('patient_id', patientId);

    if (error) {
      console.error('Error fetching sales:', error);
    } else {
      setSales(data);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    const filtered = patients.filter(patient =>
      `${patient.pt_firstname} ${patient.pt_lastname} ${patient.pt_ci}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );

    setFilteredPatients(filtered);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchSales(patient.id);
  };

  const handleNavigate = (route = null) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (route) {
      navigate(route);
      return;
    }
    if (!user || !user.role_id) {
      navigate('/LoginForm');
      return;
    }
    switch (user.role_id) {
      case 1:
        navigate('/Admin');
        break;
      case 2:
        navigate('/Optometra');
        break;
      case 3:
        navigate('/Vendedor');
        break;
      default:
      navigate('/');
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
      navigate('/Login');
    }, 2000);
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
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
      <Heading mb={4} textAlign="center">Historial de Pacientes</Heading>

      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
        <Button onClick={() => handleNavigate('/RegisterPatient')} mr={2} colorScheme="teal">Registrar Pacientes</Button>
        <Button onClick={() => handleNavigate()} mr={2} colorScheme="blue">Volver a Opciones</Button>
        <Button onClick={() => handleLogout()} colorScheme="red">Cerrar Sesión</Button>
      </Box>
      <Box as="form"  width="100%" maxWidth="850px" padding={6} boxShadow="lg" borderRadius="md">
      <Input 
        placeholder="Buscar por nombre, apellido o cédula" 
        value={search} 
        onChange={handleSearchChange} 
        mb={4} 
        maxWidth="800px"
      />
      {!selectedPatient ? (
        <Box overflowX="auto" width="100%" maxWidth="900px">
          <Table variant="simple" minWidth="800px">
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th>Cédula</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPatients.map(patient => (
                <Tr key={patient.id} onClick={() => handlePatientSelect(patient)} style={{ cursor: 'pointer' }}>
                  <Td>{patient.pt_firstname}</Td>
                  <Td>{patient.pt_lastname}</Td>
                  <Td>{patient.pt_ci}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Box width="100%" maxWidth="800px">
          <Text fontSize="lg" mb={8} ml={250}>
            {selectedPatient.pt_firstname} {selectedPatient.pt_lastname} - {selectedPatient.pt_ci}
          </Text>
          <Box overflowX="auto">
            <Table variant="simple" minWidth="800px">
              <Thead>
                <Tr>
                  <Th>Fecha</Th>
                  <Th>Armazón</Th>
                  <Th>Lentes</Th>
                  <Th>Total</Th>
                  <Th>Crédito</Th>
                  <Th>Saldo</Th>
                  <Th>Pago En</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sales.map(sale => (
                  <Tr key={sale.id}>
                    <Td>{sale.date}</Td>
                    <Td>{sale.inventario?.brand ?? "Sin marca"}</Td>
                    <Td>{sale.lens.lens_type}</Td>
                    <Td>{sale.total}</Td>
                    <Td>{sale.credit}</Td>
                    <Td>{sale.balance}</Td>
                    <Td>{sale.payment_in}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
    </Box>
  );
};

export default PatientHistory;
