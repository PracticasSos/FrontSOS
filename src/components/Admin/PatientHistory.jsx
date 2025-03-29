import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Text} from '@chakra-ui/react';

const PatientHistory = () => {
  const location = useLocation();
  const selectedPatient = location.state?.patientData || null;
  const [sales, setSales] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedPatient) {
      fetchSales(selectedPatient.id);
    }
  }, [selectedPatient]);

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

  const handlePatientSelect = (sale) => {
    const patientId = selectedPatient?.id;
    if (!patientId) {
      console.error('No patient selected');
      return;
    }
    navigate(`/HistoryClinic/PatientHistory/${patientId}/Sales/${sale.id}`, {
      state: { saleData: sale },
    });
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

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
      <Heading mb={4} textAlign="center">Historial de Ventas</Heading>
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
        <Button onClick={() => handleNavigate('/HistoryClinic')} colorScheme="teal" mb={4}>Lista de Pacientes</Button>
        <Button onClick={() => handleNavigate()} mr={2} colorScheme="blue">Volver a Opciones</Button>
      </Box>
    <Box as="form" width="100%" maxWidth="850px" padding={6} boxShadow="lg" borderRadius="md" >
      {selectedPatient ? (
        <>
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
                  <Th>Abono</Th>
                  <Th>Saldo</Th>
                  <Th>Pago En</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sales.map(sale => (
                  <Tr key={sale.id} onClick={() => handlePatientSelect(sale)} style={{ cursor: 'pointer' }}>
                    <Td>{sale.date}</Td>
                    <Td>{sale.inventario?.brand ?? "Sin marca"}</Td>
                    <Td>{sale.lens?.lens_type ?? "No especificado"}</Td>
                    <Td>{sale.total}</Td>
                    <Td>{sale.credit}</Td>
                    <Td>{sale.balance}</Td>
                    <Td>{sale.payment_in}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      ) : (
        <Text fontSize="xl" color="red.500">Error: No se seleccionó ningún paciente</Text>
      )}
    </Box>
    </Box>
  );
};

export default PatientHistory;
