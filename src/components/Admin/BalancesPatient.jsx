import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";
import { Box, Button, Heading, Table, Tbody, Td, Th, Thead, Tr, Spinner, Text, Textarea, VStack, Modal, ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton} from "@chakra-ui/react";
import SearchBar from "./SearchBar";

const BalancesPatient = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [message, setMessage] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filteredSales, setFilteredSales] = useState([]);
    const [patients, setPatients] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [branches, setBranches] = useState([]);
    const [searchTermPatients, setSearchTermPatients] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranches();
        fetchPatients(); 
      }, []);

      useEffect(() => {
        if (selectedBranch) {
            fetchSales({ branchId: selectedBranch });
        }
    }, [selectedBranch]);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTermPatients(value);
        const filteredSuggestions = sales // Usar sales en lugar de patients
            .filter((sale) => {
                const fullName = `${sale.patient.pt_firstname} ${sale.patient.pt_lastname}`.toLowerCase();
                return fullName.includes(value);
            })
            .map((sale) => `${sale.patient.pt_firstname} ${sale.patient.pt_lastname}`);
        setSuggestions(filteredSuggestions);
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

    const fetchSales = async ({branchId = null, patientId = null}) => {
        setLoading(true);
        try {
            let query = supabase
                .from('sales')
                .select(`
                    id,
                    date,
                    inventario:inventario_id(brand),
                    lens:lens_id(lens_type),
                    total,
                    balance,
                    credit,
                    patients:patient_id(pt_firstname, pt_lastname, pt_phone),
                    branchs:branchs_id(id, name)
                `)
                .gt('credit', 0) // Solo ventas con saldo pendiente
                .order('date', { ascending: false }); // Ordenar por fecha más reciente

            if  (branchId) {
                query = query.eq('branchs_id', branchId);
            }
            if (patientId) {
                query = query.eq('patient_id', patientId);
            }
            const { data, error } = await query;
            
            if (error) throw error;

            const formattedSales = data.map(sale => ({
                id: sale.id,
                date: sale.date, // Mantener formato original para ordenamiento
                brand: sale.inventario?.brand || "Sin Marca",
                lens_type: sale.lens?.lens_type || "N/A",
                total: sale.total,
                balance: sale.balance,
                credit: sale.credit,
                patient: sale.patients || {},
                branch_id: sale.branchs?.id || null,
                branch: sale.branchs?.name || "N/A",
            }));

            setSales(formattedSales);
            setFilteredSales(formattedSales);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        const { data, error } = await supabase
            .from('branchs')
            .select('id, name');
        if (error) {
            console.error('Error fetching branches:', error);
        } else {
            setBranches(data);
        }
    };
    
    const fetchPatients = async () => {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('id, pt_firstname, pt_lastname, pt_phone');
            if (error) throw error;
            setPatients(data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    const handleSuggestionSelect = (selectedName) => {
        setSearchTermPatients(selectedName);
        setSuggestions([]);
    
        const selectedSale = sales.find(
          (sale) =>
            `${sale.patient.pt_firstname} ${sale.patient.pt_lastname}`.toLowerCase() ===
            selectedName.toLowerCase()
        );
    
        if (selectedSale) {
          setSelectedPatient(selectedSale.patient);
          const patientSales = sales.filter(sale => 
            sale.patient.pt_firstname === selectedSale.patient.pt_firstname && 
            sale.patient.pt_lastname === selectedSale.patient.pt_lastname
          );
          setFilteredSales(patientSales);
        }
    };

    const mensajeDefault = `Le saludamos desde Veoptics, le recordamos que tiene un saldo pendiente por cancelar.
    Para más información puede comunicarse con nosotros.
    Nuestro horario de atención es:
    Lunes a viernes desde 09:00 am hasta las 19:00 pm
    Sábados desde las 10:00 am hasta las 16:00 pm`;

    const handleMessageClick = (e, sale) => {
        e.stopPropagation();
        setSelectedPatient(sale.patient); // Usar sale.patient
        setIsFormOpen(true);
        setMessage(mensajeDefault);
    };

    const handleSendMessage = () => {
        if (!selectedPatient || !message.trim()) return;

        const whatsappUrl = `https://wa.me/${selectedPatient.pt_phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    // Ordenar las ventas filtradas por fecha más reciente
    const sortedSales = [...filteredSales].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });

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

    return (
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" p={6}>
            <Heading mb={4} textAlign="center">Historial de Saldos</Heading>

            <Box display="flex" justifyContent="space-between" width="100%" maxWidth="400px" mb={4}>
                <Button onClick={() => handleNavigate('/RegisterPatient')} colorScheme="teal">Registrar Pacientes</Button>
                <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
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
            ) : loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <Spinner size="xl" />
                </Box>
            ) : filteredSales.length === 0 ? (
                <Text textAlign="center" color="gray.500">No se encontraron registros de ventas con saldos pendientes.</Text>
            ) : (
                <Box width="100%" maxWidth="1500px" padding={6} boxShadow="lg" borderRadius="md" bg="white" overflowX="auto">
                    <Table variant="simple">
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
                            {sortedSales.map(sale => (
                                <Tr key={sale.id}>
                                    <Td>{new Date(sale.date).toLocaleDateString()}</Td>
                                    <Td>{sale.patient.pt_firstname}</Td>
                                    <Td>{sale.patient.pt_lastname}</Td>
                                    <Td>{sale.branch}</Td>
                                    <Td>{sale.brand || "Sin Marca"}</Td>
                                    <Td>{sale.lens_type}</Td>
                                    <Td>${sale.total}</Td>
                                    <Td>${sale.balance}</Td>
                                    <Td>${sale.credit}</Td>
                                    <Td>{sale.patient.pt_phone}</Td>
                                    <Td>
                                        <Button 
                                            size="sm" 
                                            colorScheme="green" 
                                            onClick={(e) => handleMessageClick(e, sale)}
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

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} isCentered size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Enviar mensaje por WhatsApp</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                          <Text fontSize="md">
                            Enviar mensaje a <strong>{selectedPatient?.pt_firstname} {selectedPatient?.pt_lastname}</strong> ({selectedPatient?.pt_phone})
                          </Text>
                          <Textarea
                            placeholder="Escribe tu mensaje aquí..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </VStack>
                      </ModalBody>
                      <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setIsFormOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          colorScheme="green"
                          onClick={() => {
                            handleSendMessage();
                            setIsFormOpen(false);
                          }}
                          isDisabled={!message.trim()}
                        >
                          Enviar
                        </Button>
                    </ModalFooter>
                    </ModalContent>
            </Modal>
        </Box>
    );
};

export default BalancesPatient;