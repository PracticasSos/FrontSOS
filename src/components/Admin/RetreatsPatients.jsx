import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Grid, FormControl, FormLabel, Collapse, Input, VStack, Textarea, Text, Select} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

const RetreatsPatients = () => {
  const [allPatients, setAllPatients] = useState([]); 
  const [pendingSales, setPendingSales] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTermPatients, setSearchTermPatients] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(true);
  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    fetchBranchs();
  }, []);

  useEffect(() => {

      const updatedSales = location.state?.updatedPendingSales;
    
      if (updatedSales) {
          setPendingSales(updatedSales);
      }
      if (location.state) {
          navigate(location.pathname, { replace: true, state: null });
      }
  }, [location.state, navigate]);

  const fetchBranchs = async () => {
    const { data, error } = await supabase.from("branchs").select("id, name");
    if (!error) {
      setBranches(data);
    }
  };

  const handleBranchFilter = (e) => {
    const selectedBranch = e.target.value;
    setBranchFilter(selectedBranch ? parseInt(selectedBranch) : null);
  };

  const filteredByBranch = branchFilter
  ? filteredPatients.filter(patient => Number(patient.branch_id) === Number(branchFilter))
  : filteredPatients;


  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          patient_id,
          date,
          patients (
            id,
            pt_firstname,
            pt_lastname,
            pt_ci,
            pt_phone
          ),
          inventario:inventario_id(brand),
          lens:lens_id(lens_type),
          total,
          balance,
          credit,
          branchs:branchs_id(id, name)
        `)
        .eq('is_completed', false);

      if (error) throw error;

      const formattedData = data.map(sale => ({
        sale_id: sale.id, 
        patient_id: sale.patient_id,
        pt_firstname: sale.patients.pt_firstname,
        pt_lastname: sale.patients.pt_lastname,
        pt_ci: sale.patients.pt_ci,
        pt_phone: sale.patients.pt_phone,
        date: sale.date,
        brand: sale.inventario?.brand || "Sin marca",
        lens_type: sale.lens?.lens_type || "N/A",
        total: sale.total,
        balance: sale.balance,
        credit: sale.credit,
        branch_id: sale.branchs?.id || null, 
        branch: sale.branchs?.name || "N/A",
      }));

      setPendingSales(formattedData);
      setAllPatients(formattedData);
      setFilteredPatients(formattedData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    if (patient && patient.patient_id) {  
      navigate(`/RetreatsPatients/Retreats/${patient.patient_id}`, { 
        state: { patientData: patient, selectedDate: patient.date } 
      });
    }
  };
  

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTermPatients(searchValue);
    setShowSearchSuggestions(true);
    
    if (searchValue.trim() === '') {
      setFilteredPatients(allPatients);
    } else {
      const filtered = allPatients.filter(patient => {
        const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`.toLowerCase();
        return fullName.includes(searchValue);
      });
      setFilteredPatients(filtered);
    }
  };

  const handlePatientClick = (selectedPatient) => {
    setSelectedPatient(selectedPatient);
    setSearchTermPatients(`${selectedPatient.pt_firstname} ${selectedPatient.pt_lastname}`);
    setShowSearchSuggestions(false);
    
    const patientRetiros = allPatients.filter(patient => 
      patient.pt_firstname === selectedPatient.pt_firstname && 
      patient.pt_lastname === selectedPatient.pt_lastname
    );
    setFilteredPatients(patientRetiros);
  };

  const handleMessageClick = (e, patient) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setIsFormOpen(true);
    setMessage("");
  };

  const handleSendMessage = () => {
    if (!selectedPatient || !message.trim()) return;
    const whatsappUrl = `https://wa.me/${selectedPatient.pt_phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const searchSuggestions = searchTermPatients ? allPatients
    .filter((patient, index, self) => {
      const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`.toLowerCase();
      return fullName.includes(searchTermPatients.toLowerCase()) &&
        index === self.findIndex(p => 
          p.pt_firstname === patient.pt_firstname && 
          p.pt_lastname === patient.pt_lastname
        );
    }) : [];

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
      <Heading mb={4} textAlign="center">Retiros</Heading>
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6} justifyItems="center">
        <Button onClick={() => handleNavigate("/CashClousure")} colorScheme="teal" width="auto" maxWidth="200px">
          Consultas de Cierre
        </Button>
        <Button onClick={() => handleNavigate()} colorScheme="blue" width="auto" maxWidth="200px">
          Volver a Opciones
        </Button>
        <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red" width="auto" maxWidth="200px">
          Cerrar Sesión
        </Button>
      </Grid>
      
      <FormControl id="patient-search" position="relative" mb={6}>
        <FormLabel>Buscar Paciente</FormLabel>
        <Input 
          type="text" 
          placeholder="Buscar por nombre..." 
          value={searchTermPatients} 
          onChange={handleSearch}
          onClick={() => setShowSearchSuggestions(true)}
        />
        {showSearchSuggestions && searchSuggestions.length > 0 && (
          <Box 
            position="absolute" 
            zIndex="1"
            width="100%"
            bg="white"
            border="1px solid #ccc" 
            borderRadius="md" 
            mt={2} 
            maxHeight="150px" 
            overflowY="auto"
          >
            {searchSuggestions.map((patient) => (
              <Box 
                key={`${patient.pt_firstname}-${patient.pt_lastname}-${patient.patient_id}`}
                padding={2}
                _hover={{ bg: "teal.100", cursor: "pointer" }}
                onClick={() => handlePatientClick(patient)}
              >
                {patient.pt_firstname} {patient.pt_lastname}
              </Box>
            ))}
          </Box>
        )}
      </FormControl>
      <Select placeholder="Filtrar por sucursal" onChange={handleBranchFilter}mt={4} mb={4}>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>{branch.name}</option>
        ))}
      </Select>
      {branchFilter && filteredByBranch.length === 0 ? (
        <Text textAlign="center" color="gray.500">No hay retiros para esta sucursal</Text>
      ) : (
        branchFilter && (
      <>

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Box width="100%" maxWidth="1500px" padding={6} boxShadow="lg" borderRadius="md" bg="white" overflowX="auto">
          <Table>
            <Thead>
              <Tr>
                <Th>Fecha</Th>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th>Armazón</Th>
                <Th>Luna</Th>
                <Th>Total</Th>
                <Th>Abono</Th>
                <Th>Saldo</Th>
                <Th>TELF</Th>
                <Th>Acción</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredByBranch.map((patient) => (
                <Tr 
                  key={`${patient.sale_id}`}
                  onClick={() => handlePatientSelect(patient)} 
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <Td>{patient.date}</Td>
                  <Td>{patient.pt_firstname}</Td>
                  <Td>{patient.pt_lastname}</Td>
                  <Td>{patient.brand || "Sin Marca"}</Td>
                  <Td>{patient.lens_type}</Td>
                  <Td>{patient.total}</Td>
                  <Td>{patient.balance}</Td>
                  <Td>{patient.credit}</Td>
                  <Td>{patient.pt_phone}</Td>
                  <Td>
                    <Button 
                      size="sm" 
                      colorScheme="green" 
                      onClick={(e) => handleMessageClick(e, patient)}
                    >
                      Enviar Mensaje
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </>
        )
      )}

      <Collapse in={isFormOpen} animateOpacity>
        <Box
          mt={6}
          p={4}
          boxShadow="lg"
          borderRadius="md"
          bg="gray.50"
          width="100%"
          maxWidth="800px"
        >
          <VStack align="stretch" spacing={4}>
            <Text fontSize="lg">
              Enviar mensaje a <strong>{selectedPatient?.pt_firstname} {selectedPatient?.pt_lastname}</strong> ({selectedPatient?.pt_phone})
            </Text>
            <Textarea
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              colorScheme="green"
              onClick={handleSendMessage}
              isDisabled={!message.trim()}
            >
              Enviar Mensaje por WhatsApp
            </Button>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default RetreatsPatients;