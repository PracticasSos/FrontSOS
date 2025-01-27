import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";
import { Box, Button, Heading, Table, Tbody, Td, Th, Thead, Tr, Spinner, Text, Textarea, VStack, Collapse, FormControl, FormLabel, Input } from "@chakra-ui/react";

const RetreatsPatients = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [message, setMessage] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filteredSales, setFilteredSales] = useState([]);
    const [patients, setPatients] = useState([]);
    const [searchTermPatients, setSearchTermPatients] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchSales();
    }, []);

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("patients")
                    .select("id, pt_firstname, pt_lastname, pt_phone");

                if (error) throw error;

                setPatients(data);
            } catch (error) {
                console.error("Error fetching patients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTermPatients(value);
        updateFilteredSales(value);
    };

    const updateFilteredSales = (searchTerm) => {
        if (!searchTerm) {
            setFilteredSales(sales);
            return;
        }

        const filtered = sales.filter((sale) => {
            const fullName = `${sale.patient.pt_firstname} ${sale.patient.pt_lastname}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        });

        setFilteredSales(filtered);
    };

    const fetchSales = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sales')
                .select(`
                    id,
                    date,
                    frame,
                    lens:lens_id(lens_type),
                    total,
                    balance,
                    credit,
                    patients:patient_id(pt_firstname, pt_lastname, pt_phone)
                `);

            if (error) throw error;

            const filteredSales = data.filter(sale => sale.balance > 0);

            const formattedSales = filteredSales.map(sale => ({
                id: sale.id,
                date: new Date(sale.date).toLocaleDateString(),
                frame: sale.frame,
                lens_type: sale.lens?.lens_type || "N/A",
                total: sale.total,
                balance: sale.balance,
                credit: sale.credit,
                patient: sale.patients || {}
            }));

            setSales(formattedSales);
            setFilteredSales(formattedSales);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaleClick = (saleId) => {
        // Navegar a la ruta de detalles de venta con el ID específico
        navigate(`/sale-details/${saleId}`);
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        navigate("/LoginForm");
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`;
        setSearchTermPatients(fullName);
        setMessage(""); 
        setIsFormOpen(true);
        
        updateFilteredSales(fullName);
    };

    const handleSendMessage = () => {
        if (!selectedPatient || !message.trim()) return;

        const whatsappUrl = `https://wa.me/${selectedPatient.pt_phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" p={6}>
            <Heading mb={4} textAlign="center">Retiros</Heading>

            <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
                <Button onClick={() => handleNavigate('/RegisterPatient')} colorScheme="teal">Registrar Pacientes</Button>
                <Button onClick={() => handleNavigate('/Admin')} colorScheme="blue">Volver a Opciones</Button>
                <Button onClick={handleLogout} colorScheme="red">Cerrar Sesión</Button>
            </Box>

            <FormControl id="patient-search">
                <FormLabel>Buscar Paciente</FormLabel>
                <Input type="text" placeholder="Buscar por nombre..." value={searchTermPatients} onChange={handleSearch} />
                {searchTermPatients && (
                    <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
                        {patients.filter((patient) => {
                            const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`.toLowerCase();
                            return fullName.includes(searchTermPatients.toLowerCase());
                        }).map((patient) => (
                            <Box key={patient.id} padding={2} _hover={{ bg: "teal.100", cursor: "pointer" }} onClick={() => handlePatientClick(patient)}>
                                {patient.pt_firstname} {patient.pt_lastname}
                            </Box>
                        ))}
                    </Box>
                )}
            </FormControl>

            <Box width="100%" maxWidth="1500px" padding={6} boxShadow="lg" borderRadius="md" bg="white">
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <Spinner size="xl" />
                    </Box>
                ) : filteredSales.length === 0 ? (
                    <Text textAlign="center" color="gray.500">No se encontraron retiros de ventas pendientes.</Text>
                ) : (
                    <Table variant="simple">
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
                                <Th>Acciones</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredSales.map(sale => (
                                <Tr 
                                    key={sale.id} 
                                    _hover={{ bg: "gray.50", cursor: "pointer" }}
                                    onClick={() => handleSaleClick(sale.id)}
                                >
                                    <Td>{sale.date}</Td>
                                    <Td>{sale.patient.pt_firstname}</Td>
                                    <Td>{sale.patient.pt_lastname}</Td>
                                    <Td>{sale.frame}</Td>
                                    <Td>{sale.lens_type}</Td>
                                    <Td>{sale.total}</Td>
                                    <Td>{sale.credit}</Td>
                                    <Td>{sale.balance}</Td>
                                    <Td>{sale.patient.pt_phone}</Td>
                                    <Td>
                                        <Button 
                                            size="sm" 
                                            colorScheme="green" 
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handlePatientClick(sale.patient);
                                            }}
                                        >
                                            Enviar Mensaje
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>

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