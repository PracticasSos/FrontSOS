import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate } from "react-router-dom";
import { Box, Heading, Button, FormControl, Divider, FormLabel, Input, Table, Thead, Tbody, Tr, Th, Td, Textarea, Select, SimpleGrid } from "@chakra-ui/react";

const LaboratoryOrder = () => {
    const [salesList, setSalesList] = useState([]);
    const [patientsList, setPatientsList] = useState([]);
    const [filteredMeasures, setFilteredMeasures] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [labsList, setLabsList] = useState([]);
    const [selectedLab, setSelectedLab] = useState('');
    const [observations, setObservations] = useState('');
    const navigate = useNavigate();

    const handleNavigate = (route) => {
        navigate(route);
    };

    useEffect(() => {
        fetchLabs();
        fetchPatients();
    }, []);

    const fetchLabs = async () => {
        const { data, error } = await supabase
            .from('labs')
            .select('id, name');
        if (error) {
            console.error('Error fetching labs:', error);
        } else {
            setLabsList(data);
        }
    };

    const fetchPatients = async () => {
        const { data, error } = await supabase
            .from('patients')
            .select('id, pt_firstname, pt_lastname, pt_ci');
        if (error) {
            console.error('Error fetching patients:', error);
        } else {
            setPatientsList(data);
        }
    };

    const fetchSales = async (patientId) => {
        const { data, error } = await supabase
            .from('sales')
            .select(`
                id, 
                date, 
                frame, 
                lens:lens_id(lens_type), 
                branchs:branchs_id(name)
            `)
            .eq('patient_id', patientId)
            .order('date', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error fetching sales:', error);
        } else {
            setSalesList(data);
            setSelectedSale(data[0]); // Guardamos el último registro
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePatientSelect = async (patient) => {
        setSelectedPatient(patient);
        setSearchTerm(`${patient.pt_firstname} ${patient.pt_lastname}`);

        const { data: rxData, error: rxError } = await supabase
            .from('rx_final')
            .select('*')
            .eq('patient_id', patient.id);

        if (rxError) {
            console.error('Error fetching measures:', rxError);
        } else {
            setFilteredMeasures(rxData);
        }

        await fetchSales(patient.id);
    };

    const filteredPatients = patientsList.filter(patient => {
        if (searchTerm === '') {
            return true; // No filtra si no hay término de búsqueda
        }
        const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`;
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()); // Filtra por nombre y apellido
    });

    return (
        <Box className="sales-form" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
        <Heading as="h2" size="lg" mb={4}>Orden de Laboratorio</Heading>
        <Box display="flex" justifyContent="space-between" width="100%" maxWidth="900px" mb={4}>
            <Button onClick={() => handleNavigate("/ConsultarCierre")} colorScheme="teal">Consultas de Cierre</Button>
            <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">Volver a Opciones</Button>
            <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
        </Box>
        <Box as="form" width="100%" maxWidth="1000px" padding={6} boxShadow="lg" borderRadius="md">
           
            <FormControl id="patient-search" mb={4}>
                <FormLabel>Buscar Paciente</FormLabel>
                <Input
                    type="text"
                    placeholder="Buscar por nombre, apellido o cédula..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </FormControl>

            {/* Muestra la lista de pacientes solo si hay algo en el searchTerm */}
            {searchTerm && !selectedPatient && (
                <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
                    {filteredPatients.map((patient) => (
                        <Box
                            key={patient.id}
                            padding={2}
                            _hover={{ bg: "teal.100", cursor: "pointer" }}
                            onClick={() => handlePatientSelect(patient)} 
                        >
                            {patient.pt_firstname} {patient.pt_lastname}
                        </Box>
                    ))}
                </Box>
            )}

            <Box mt={4}>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Rx Final</Th>
                            <Th>Esfera</Th>
                            <Th>Cilindro</Th>
                            <Th>Eje</Th>
                            <Th>Prisma</Th>
                            <Th>ADD</Th>
                            <Th>AV VL</Th>
                            <Th>AV VP</Th>
                            <Th>DNP</Th>
                            <Th>ALT</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {[
                            { side: "OD", prefix: "right" },
                            { side: "OI", prefix: "left" },
                        ].map(({ side, prefix }) => (
                            <Tr key={prefix}>
                                <Td>{side}</Td>
                                {[
                                    "sphere",
                                    "cylinder",
                                    "axis",
                                    "prism",
                                    "add",
                                    "av_vl",
                                    "av_vp",
                                    "dnp",
                                    "alt",
                                ].map((field) => (
                                    <Td key={field}>
                                        <Input
                                            name={`${field}_${prefix}`}
                                            value={
                                                filteredMeasures.length > 0
                                                    ? filteredMeasures[0][`${field}_${prefix}`] || ""
                                                    : ""
                                            }
                                            isReadOnly
                                        />
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
            <Box p={5} maxWidth="800px" mx="auto">
                <SimpleGrid columns={[1, 2]} spacing={4}>
                    {/* Datos adicionales */}
                    <Box padding={4} maxWidth="500px" textAlign="left">
                        <SimpleGrid columns={1}>
                            <FormControl mb={4}>
                                <FormLabel>Óptica</FormLabel>
                                <Input 
                                    type="text" 
                                    value={selectedSale?.branchs?.name || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Paciente</FormLabel>
                                <Input 
                                    type="text" 
                                    value={selectedSale?.id || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Fecha</FormLabel>
                                <Input 
                                    type="text" 
                                    value={selectedSale?.date || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Armazón</FormLabel>
                                <Input 
                                    type="text" 
                                    value={selectedSale?.frame || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Tipo de Lentes</FormLabel>
                                <Input 
                                    type="text" 
                                    value={selectedSale?.lens?.lens_type || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Laboratorio</FormLabel>
                                <Select
                                    value={selectedLab}
                                    onChange={(e) => setSelectedLab(e.target.value)} 
                                    width="auto" 
                                    maxWidth="300px"
                                >
                                    <option value="">Seleccionar Laboratorio</option>
                                    {labsList.map(lab => (
                                        <option key={lab.id} value={lab.id}>
                                            {lab.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                    </Box>

                    <SimpleGrid columns={1}>
                        <FormControl mb={4}>
                            <FormLabel>Observaciones</FormLabel>
                            <Textarea
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder="Ingrese observaciones..."
                                width="auto" 
                                maxWidth="300px"
                            />
                        </FormControl>
                    </SimpleGrid>
                </SimpleGrid>
            </Box>
        </Box>
    </Box>
    );
};

export default LaboratoryOrder;
