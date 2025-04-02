import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, FormControl, FormLabel, Select, Spinner, Grid } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

const OrderLaboratoryList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(""); 
  const [formData, setFormData] = useState({
    since: "",
    till: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchTodayPatients();
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase.from("branchs").select("id, name");
      if (error) throw error;
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchTodayPatients = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      const today = new Date().toLocaleDateString("en-CA");
      const { data, error } = await supabase
        .from('sales')
        .select(`
          branchs_id,
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
        .lte('date', `${today}T23:59:59`)
        .eq('branchs_id', selectedBranch);

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
    if (!formData.since || !formData.till || !selectedBranch) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          branchs_id,
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
        .lte('date', `${formData.till}T23:59:59`)
        .eq('branchs_id', selectedBranch);

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

  return (
    <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
      <Heading mb={4} textAlign="center">Lista Pendiente de Órdenes de Laboratorio</Heading>
      <FormControl mb={4}>
        <FormLabel>Sucursal</FormLabel>
        <Select 
          placeholder="Selecciona una sucursal"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </Select>
      </FormControl>
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
          onClick={fetchFilteredPatients}
          isDisabled={!selectedBranch}
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
