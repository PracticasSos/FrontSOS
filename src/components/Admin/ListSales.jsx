import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";
import { useToast, Box, Button, VStack, Text, Heading, Flex, Input, Container, Divider } from "@chakra-ui/react";

const ListSales = () => {
    const [sales, setSales] = useState({});
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [search, setSearch] = useState("");
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        const { data, error } = await supabase
            .from("sales")
            .select("patient_id, patients:patient_id(pt_firstname, pt_lastname), date");
        
        if (error) {
            toast({ title: "Error", description: "Error al obtener las ventas", status: "error" });
        } else {
            const groupedSales = {};
            data.forEach((sale) => {
                const { patient_id, patients, date } = sale;
                const patientName = `${patients.pt_firstname} ${patients.pt_lastname}`;
                
                if (!groupedSales[patient_id]) {
                    groupedSales[patient_id] = { name: patientName, lastName: patients.pt_lastname, dates: [] };
                }
                groupedSales[patient_id].dates.push(date);
            });
            
            const sortedSales = Object.fromEntries(
                Object.entries(groupedSales).sort(([, a], [, b]) => a.lastName.localeCompare(b.lastName))
            );
            
            setSales(sortedSales);
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
            case 4:
                navigate('/SuperAdmin');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <Container maxW="container.md" py={8}>
            <Heading as="h1" size="xl" mb={6} textAlign="center" color="teal.600">
                Historial de Ventas
            </Heading>
            <Flex mb={6} gap={4} justify="center">
                <Button onClick={() => handleNavigate("/SalesForm")} colorScheme="blue">Registrar Venta</Button>
                <Button onClick={() => handleNavigate("/")} bgColor="teal.500" color="white">Volver a Opciones</Button>
            </Flex>
            <Input 
                placeholder="Buscar paciente..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                mb={6} 
                w="100%" 
                bg="gray.100"
                _placeholder={{ color: "gray.500" }}
            />
            <Box bg="white" p={6} borderRadius="lg" shadow="xl">
                <VStack spacing={4} align="stretch">
                    {Object.entries(sales)
                        .filter(([_, patientData]) => patientData.name.toLowerCase().includes(search.toLowerCase()))
                        .map(([patientId, patientData]) => (
                            <Box key={patientId} borderWidth={1} borderRadius="lg" p={4} bg="gray.50" shadow="md">
                                <Text fontWeight="bold" fontSize="lg" color="teal.700" cursor="pointer" onClick={() => setSelectedPatient(selectedPatient === patientId ? null : patientId)}>
                                    {patientData.name}
                                </Text>
                                {selectedPatient === patientId && (
                                    <VStack mt={2} align="stretch" spacing={2}>
                                        <Divider />
                                        {patientData.dates.map((date, index) => (
                                            <Button key={index} onClick={() => navigate(`/ListSales/HistorySales/${patientId}/${date}`)} colorScheme="teal" variant="outline">
                                                {date}
                                            </Button>
                                        ))}
                                    </VStack>
                                )}
                            </Box>
                        ))}
                </VStack>
            </Box>
        </Container>
    );
};

export default ListSales;
