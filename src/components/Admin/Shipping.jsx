import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";
import { Box, Button, Heading, Table, Tbody, Td, Th, Thead, Tr, Spinner, Text, Textarea, VStack, Collapse } from "@chakra-ui/react";

const Shipping = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSales();
        fetchLab();
    }, []);

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
                pt_firstname: sale.patients?.pt_firstname || "N/A",
                pt_lastname: sale.patients?.pt_lastname || "N/A",
                pt_phone: sale.patients?.pt_phone || "N/A"
            }));

            setSales(formattedSales);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLab = async () => {
        const { data, error }= await supabase
            .from('labs')
            .select('id, name')
        if (error) {
            console.error('Error fetching labs:', error);
        } else {
            setLabs(data);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        navigate("/LoginForm");
    };

   

    return (
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" p={6}>
            <Heading mb={4} textAlign="center">Historial de Saldos</Heading>

            <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
                <Button onClick={() => handleNavigate('/RegisterPatient')} colorScheme="teal">Registrar Pacientes</Button>
                <Button onClick={() => handleNavigate('/Admin')} colorScheme="blue">Volver a Opciones</Button>
                <Button onClick={handleLogout} colorScheme="red">Cerrar Sesión</Button>
            </Box>

            <Box width="100%" maxWidth="1500px" padding={6} boxShadow="lg" borderRadius="md" bg="white">
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <Spinner size="xl" />
                    </Box>
                ) : sales.length === 0 ? (
                    <Text textAlign="center" color="gray.500">No se encontraron registros de ventas con saldos pendientes.</Text>
                ) : (
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Fecha</Th>
                                <Th>Nombre</Th>
                                <Th>Apellido</Th>
                                <Th>Armazón</Th>
                                <Th>Luna</Th>
                                <Th>Laboratorio</Th>
                                <Th>Enviado</Th>
                                <Th>Entregado</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sales.map(sale => (
                                <Tr key={sale.id}>
                                    <Td>{sale.date}</Td>
                                    <Td>{sale.pt_firstname}</Td>
                                    <Td>{sale.pt_lastname}</Td>
                                    <Td>{sale.frame}</Td>
                                    <Td>{sale.lens_type}</Td>
                                    <Td>{sale.name}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>
        </Box>
    );
};

export default Shipping;
