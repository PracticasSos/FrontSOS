import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, FormControl, FormLabel, Spinner, Grid } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

const OrderLaboratoryList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [formData, setFormData] = useState({
    since: "",
    till: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayPatients();
  }, []);

  const fetchTodayPatients = async () => {
    setLoading(true);
    try {
      const today = new Date().toLocaleDateString("en-CA");
      const { data, error } = await supabase
        .from('sales')
        .select(`
          patient_id,
          date,
          patients (
            id,
            pt_firstname,
            pt_lastname,
            pt_ci
          )
        `)
        .gte('date', `${today}T00:00:00`)
        .lte('date', `${today}T23:59:59`);

      if (error) throw error;

      const formattedData = data.map(sale => ({
        patient_id: sale.patient_id,
        pt_firstname: sale.patients.pt_firstname,
        pt_lastname: sale.patients.pt_lastname,
        pt_ci: sale.patients.pt_ci,
        date: sale.date
      }));

      setPatients(formattedData);
      setFilteredPatients(formattedData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredPatients = async () => {
    if (!formData.since || !formData.till) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          patient_id,
          date,
          patients (
            id,
            pt_firstname,
            pt_lastname,
            pt_ci
          )
        `)
        .gte('date', `${formData.since}T00:00:00`)
        .lte('date', `${formData.till}T23:59:59`);

      if (error) throw error;

      const formattedData = data.map(sale => ({
        patient_id: sale.patient_id, 
        pt_firstname: sale.patients.pt_firstname,
        pt_lastname: sale.patients.pt_lastname,
        pt_ci: sale.patients.pt_ci,
        date: sale.date
      }));

      setPatients(formattedData);
      setFilteredPatients(formattedData);
    } catch (error) {
      console.error('Error fetching filtered patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    if (patient && patient.patient_id) {  
      console.log(patient.patient_id);  
      navigate(`/OrderLaboratoryList/LaboratoryOrder/${patient.patient_id}`, { state: { patientData: patient } });
    } else {
      console.error("ID del paciente no válido o no definido");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchFilteredPatients();
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
    <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
      <Heading mb={4} textAlign="center">Lista Pendinente de Órdenes de Laboratorio</Heading>
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6} justifyItems="center">
            <Button onClick={() => handleNavigate("/Labs")} colorScheme="teal" width="auto" maxWidth="200px">
                Crear Laboratorio
            </Button>
            <Button onClick={() => handleNavigate()} colorScheme="blue" width="auto" maxWidth="200px">
                Volver a Opciones
            </Button>
            <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red" width="auto" maxWidth="200px">
                Cerrar Sesión
            </Button>
        </Grid>
      <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={6}>
          <FormControl>
            <FormLabel>Desde</FormLabel>
            <Input 
              type="date" 
              name="since" 
              value={formData.since} 
              onChange={handleChange} 
            />
          </FormControl>
          <FormControl>
            <FormLabel>Hasta</FormLabel>
            <Input 
              type="date" 
              name="till" 
              value={formData.till} 
              onChange={handleChange} 
            />
          </FormControl>
          <Button 
            type="submit" 
            colorScheme="blue" 
            mt={6} 
            onClick={handleFilterSubmit}
          >
            Filtrar
          </Button>

        </Grid>

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Box className="w-full max-w-4xl overflow-x-auto">
          <Table>
            <Thead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th>Cédula</Th>
                <Th>Fecha</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPatients.map((patient) => (
                <Tr 
                  key={patient.patient_id}  
                  onClick={() => handlePatientSelect(patient)} 
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <Td>{patient.pt_firstname}</Td>
                  <Td>{patient.pt_lastname}</Td>
                  <Td>{patient.pt_ci}</Td>
                  <Td>{new Date(patient.date).toLocaleDateString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default OrderLaboratoryList;
