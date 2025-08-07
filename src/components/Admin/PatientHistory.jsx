import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, HStack} from '@chakra-ui/react';
import { FaEye } from 'react-icons/fa';
import SmartHeader from '../header/SmartHeader';

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
    navigate(`/history-clinic/patient-history/${patientId}/sales-history/${sale.id}`, {
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
        case 4:
            navigate('/SuperAdmin');
            break;
        default:
            navigate('/');
    }
  };

  const moduleSpecificButton = (
    <Button 
      onClick={() => handleNavigate('/history-clinic')} 
      bg={useColorModeValue(
        'rgba(255, 255, 255, 0.8)', 
        'rgba(255, 255, 255, 0.1)'
      )}
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor={useColorModeValue(
        'rgba(56, 178, 172, 0.3)', 
        'rgba(56, 178, 172, 0.5)'
      )}
      color={useColorModeValue('teal.600', 'teal.300')}
      size="sm"
      borderRadius="15px"
      px={4}
      _hover={{
        bg: useColorModeValue(
          'rgba(56, 178, 172, 0.1)', 
          'rgba(56, 178, 172, 0.2)'
        ),
        borderColor: 'teal.400',
        transform: 'translateY(-1px)',
      }}
      transition="all 0.2s"
    >
      <HStack spacing={2} align="center" justify="center">
        <FaEye size="14px" />
        <Text fontWeight="600" lineHeight="1" m={0}>
          Listar Pacientes
        </Text>
      </HStack>
    </Button>
    );

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
      <SmartHeader moduleSpecificButton={moduleSpecificButton} />
      <Box w="100%" maxW= "800px" mb={4}>
            <Heading 
                mb={4} 
                textAlign="left" 
                size="md"
                fontWeight="700"
                color={useColorModeValue('teal.600', 'teal.300')}
                pb={2}
            >
                Historial de Venta
            </Heading>
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
