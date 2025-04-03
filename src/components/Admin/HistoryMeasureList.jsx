import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";
import { Box, Button, Heading, Spinner, Table, Thead, Tbody, Tr, Th, Td, Divider } from "@chakra-ui/react";
import SearchBar from "./SearchBar";

const HistoryMeasureList = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [suggestion, setSuggestion] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("rx_final")
                .select(`
                    patient_id,
                    patients:patients (id, pt_firstname, pt_lastname, pt_ci, pt_occupation)
                `);
            if (error) throw error;
            const uniquePatients = [];
            const patientIds = new Set();

            data.forEach(rx => {
                if (!patientIds.has(rx.patient_id)) {
                    patientIds.add(rx.patient_id);
                    uniquePatients.push({
                        patient_id: rx.patient_id,
                        pt_firstname: rx.patients?.pt_firstname || "",
                        pt_lastname: rx.patients?.pt_lastname || "",
                        pt_ci: rx.patients?.pt_ci || "",
                        pt_occupation: rx.patients?.pt_occupation || "",
                        created_at: rx.created_at
                    });
                }
            });
             
            const sortedPatients = uniquePatients.sort((a, b) => a.pt_lastname.localeCompare(b.pt_lastname));
            setPatients(sortedPatients);
            setFilteredPatients(sortedPatients);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSelect = (patient) => {
        if (patient && patient.patient_id) {
            navigate(`/HistoryMeasureList/HistoryMeasures/${patient.patient_id}`,{ state: { patientData: patient }});
        } else {
            console.error("ID de paciente no válido o no definido");
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearch(query);
    
        const filteredSuggestions = patients
            .filter(
                (patient) =>
                    patient.pt_firstname.toLowerCase().includes(query) ||
                    patient.pt_lastname.toLowerCase().includes(query) ||
                    patient.pt_ci.toLowerCase().includes(query)
            )
            .map((patient) => `${patient.pt_firstname} ${patient.pt_lastname}`);
        setSuggestion(filteredSuggestions);
    
        const filtered = patients.filter(
            (patient) =>
                patient.pt_firstname.toLowerCase().includes(query) ||
                patient.pt_lastname.toLowerCase().includes(query) ||
                patient.pt_ci.toLowerCase().includes(query)
        );
        setFilteredPatients(filtered);
    };
    
    const handleSuggestionSelect = (selectedName) => {
        setSearch(selectedName); 
        setSuggestion([]);
    
        const filtered = patients.filter(
            (patient) =>
                `${patient.pt_firstname} ${patient.pt_lastname}`.toLowerCase() ===
                selectedName.toLowerCase()
        );
        if (filtered.length > 0) {
            setFilteredPatients(filtered);
        }
    };

    const handleNavigate = (route = null) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (route) {
            navigate(route);
            return;
        }
        if (!user || !user.role_id) {
            navigate("/LoginForm");
            return;
        }
        switch (user.role_id) {
            case 1:
                navigate("/Admin");
                break;
            case 2:
                navigate("/Optometra");
                break;
            case 3:
                navigate("/Vendedor");
                break;
            default:
                navigate('/');
        }
    };

    return (
        <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
            <Heading mb={6} textAlign="center">Historial de Medidas</Heading>
            <Box display="flex" justifyContent="center" width="100%" mb={4}>
                <Box display="flex" gap={6} justifyContent="center">
                    <Button colorScheme="blue" onClick={() => handleNavigate("/SalesForm")}>Registrar Medidas</Button>
                    <Button colorScheme="gray" onClick={() => handleNavigate()}>Volver a Opciones</Button>
                </Box>
            </Box>

            {loading ? (
                <Spinner size="xl" mt={4} />
            ) : (
                <Box>
                    <Divider my={4} />
                    <Box w="50%" mx="auto">
                        <SearchBar 
                            searchPlaceholder="Buscar Paciente..."
                            searchValue={search}
                            onSearchChange={handleSearch}
                            suggestions={suggestion}
                            onSuggestionSelect={handleSuggestionSelect}
                            showBranchFilter={false} 
                        />
                    </Box>
                    <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Nombre</Th>
                                    <Th>Apellido</Th>
                                    <Th>Cédula</Th>
                                    <Th>Ocupación</Th>
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
                                        <Td>{patient.pt_occupation}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default HistoryMeasureList;
