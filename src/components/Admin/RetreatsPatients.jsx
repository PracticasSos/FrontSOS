import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Grid, FormControl, FormLabel, Collapse, Input, VStack, Textarea, Text, Select} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

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
  const [filteredSales, setFilteredSales] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients({});
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

  useEffect(() => {
    if (selectedBranch) {
      fetchPatients({ branchId: selectedBranch });
    }
  }, [selectedBranch]);


  const fetchBranchs = async () => {
    const { data, error } = await supabase.from("branchs").select("id, name");
    if (!error) {
      setBranches(data);
    }
  };

  const fetchPatients = async ({branchId = null, patientId = null}) => {
    setLoading(true);
    try {
      let query = supabase
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

        if (branchId) {
          query = query.eq('branchs_id', branchId);
        }
        if (patientId) {
          query = query.eq('patient_id', patientId);
        }
        const { data, error } = await query;

      if (error) throw error;

      const formattedData = data.map(sale => ({
        sale_id: sale.id, 
        patient_id: sale.patient_id,
        pt_firstname: sale.patients?.pt_firstname || "N/A",
        pt_lastname: sale.patients?.pt_lastname || "N/A",
        pt_ci: sale.patients?.pt_ci || "N/A",
        pt_phone: sale.patients?.pt_phone || "N/A",
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
    const value = e.target.value.toLowerCase();
    setSearchTermPatients(value);
    const filteredSuggestions = allPatients
      .filter((patient) => {
        const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`.toLowerCase();
        return fullName.includes(value);
      }).map((patient) => `${patient.pt_firstname} ${patient.pt_lastname}`);
    setSuggestions(filteredSuggestions);
    updateFilteredSales(value);
  };
  
  const updateFilteredSales = (searchTerm) => {
    if (!searchTerm) {
      setFilteredPatients(allPatients);
      return;
    }
    const filtered = allPatients.filter((sale) => {
      const fullName = sale.patients
        ? `${sale.patients.pt_firstname} ${sale.patients.pt_lastname}`.toLowerCase()
        : "";
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        (selectedPatient && sale.patient?.id === selectedPatient.id) 
      );
    });
    setFilteredSales(filtered);
  } 

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

  const handleSuggestionSelect = (selectedName) => {
    setSearchTermPatients(selectedName); 
    setSuggestions([]); 
    const selectedPatient = allPatients.find(
        (patient) =>
            `${patient.pt_firstname} ${patient.pt_lastname}`.toLowerCase() ===
            selectedName.toLowerCase()
    );

    if (selectedPatient) {
        setSelectedPatient(selectedPatient); 
        const patientRetiros = allPatients.filter(
            (patient) =>
                patient.pt_firstname === selectedPatient.pt_firstname &&
                patient.pt_lastname === selectedPatient.pt_lastname
        );
        setFilteredPatients(patientRetiros); 
    }
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
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" p={6} boxShadow="md" borderRadius="lg" bg="gray.50">
      <Heading mb={4} textAlign="center">Retiros</Heading>
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="400px" mb={4}>
        <Button onClick={() => handleNavigate("/CashClousure")} colorScheme="teal" width="auto" maxWidth="200px">
          Consultas de Cierre
        </Button>
        <Button onClick={() => handleNavigate()} colorScheme="blue" width="auto" maxWidth="200px">
          Volver a Opciones
        </Button>
      </Box>
      <Box w="50%" mx="auto" display="block">
        <SearchBar
          searchPlaceholder="Buscar por nombre..."
          searchValue={searchTermPatients}
          onSearchChange={handleSearch}
          suggestions={suggestions}
          onSuggestionSelect={handleSuggestionSelect}
          branches={branches}
          selectedBranch={selectedBranch}
          onBranchChange={(e) => setSelectedBranch(e.target.value)}
          showBranchFilter={true}
        />
      </Box>
      {(!selectedBranch && !searchTermPatients) ? (
        <Text textAlign="center" color="gray.500" mt={6}>
          Por favor, selecciona una sucursal o busca un nombre para mostrar los datos.
        </Text>
      ) : filteredPatients.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          No se encontraron registros de pacientes.
        </Text>
      ) : (
        <Box width="100%" maxWidth="1500px" padding={6} boxShadow="lg" borderRadius="md" bg="white" overflowX="auto">
          <Table>
            <Thead>
              <Tr>
                <Th>Fecha</Th>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th>Sucursal</Th>
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
              {filteredPatients.map((patient) => (
                <Tr
                  key={`${patient.sale_id}`}
                  onClick={() => handlePatientSelect(patient)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <Td>{patient.date}</Td>
                  <Td>{patient.pt_firstname}</Td>
                  <Td>{patient.pt_lastname}</Td>
                  <Td>{patient.branch}</Td>
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