import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { supabase } from "../../api/supabase";
import { Box, Heading, Thead, Table, Tr, Text, Th, Tbody, Td, Input, SimpleGrid, FormControl, FormLabel, Button } from "@chakra-ui/react";

const Retreats = () => {
    const { patientId } = useParams();
    const location = useLocation();
    const [salesData, setSalesData] = useState(null);
    const [patientData, setPatientData] = useState(location.state?.patientData || null);
    const [filteredMeasures, setFilteredMeasures] = useState([]);
    const navigate = useNavigate();

    const handleNavigate = (route) => {
        navigate(route);
    };

    useEffect(() => {
        if (patientData?.id || patientId) {
            fetchSalesData();
            fetchMeasures();
        }
    }, [patientData, patientId]);

    const fetchPatientData = async () => {
        if (!patientId) {
            console.error("patientId is undefined or invalid");
            return;
        }
        try {
            const { data, error } = await supabase
                .from("patients")
                .select("*")
                .eq("id", patientId)
                .single();
            if (error) throw error;
            setPatientData(data);
        } catch (error) {
            console.error("Error fetching patient data:", error);
            alert("Error al cargar los datos del paciente.");
        }
    };

    const fetchSalesData = async () => {
        try {
            const { data, error } = await supabase
                .from("sales")
                .select(`
                    id,
                    frame,
                    lens:lens_id(lens_type),
                    delivery_time, 
                    p_frame, 
                    p_lens,
                    price,
                    discount_frame, 
                    discount_lens,
                    total,
                    balance,
                    credit,
                    payment_in
                `)
                .eq("patient_id", patientData?.id || patientId)  // Usamos patient_id correctamente
                .limit(1)
                .single();
            if (error) throw error;
            setSalesData(data);
        } catch (error) {
            console.error("Error fetching sales data:", error)
        }
    };

    const fetchMeasures = async () => {
        try {
            const { data, error } = await supabase
                .from("rx_final")
                .select("*")
                .eq("patient_id", patientId); // También se usa el patientId aquí
            if (error) throw error;
            setFilteredMeasures(data);
        } catch (error) {
            console.error("Error fetching measures:", error);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
            <Heading as="h2" size="lg" mb={4}>Retiros</Heading>
            <Box display="flex" justifyContent="space-between" width="100%" maxWidth="900px" mb={4}>
                <Button onClick={() => handleNavigate("/RetreatsPatients")} colorScheme="teal">Retiros</Button>
                <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">Volver a Opciones</Button>
                <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
            </Box>
            <Box as="form" width="100%" maxWidth="1000px" padding={6} boxShadow="lg" borderRadius="md">
                {patientData && (
                    <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
                        <Text fontSize="lg">
                            <strong>Nombre:</strong> {patientData.pt_firstname} {patientData.pt_lastname}
                        </Text>
                        <Text fontSize="lg">
                            <strong>Cédula:</strong> {patientData.pt_ci}
                        </Text>
                        <Text fontSize="lg">
                            <strong>Teléfono:</strong> {patientData.pt_phone || "No disponible"}
                        </Text>
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
                        <SimpleGrid columns={[1, 1]}>
                            <FormControl mb={4}>
                                <FormLabel>Armazón</FormLabel>
                                <Input
                                    type="text"
                                    value={salesData?.frame || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Lunas</FormLabel>
                                <Input
                                    type="text"
                                    value={salesData?.lens || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Tiempo de entrega</FormLabel>
                                <Input
                                    type="text"
                                    value={salesData?.delivery_time || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Precio Armazón</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.p_frame || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Precio Lunas</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.p_lens || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Precio Sugerido</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.price || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Precio Sugerido.A</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.discount_frame || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Precio Sugerido.L</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.discount_lens || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Precio Total</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.total || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Abono</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.balance || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Saldo</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.credit || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Pago en</FormLabel>
                                <Input
                                    type="text"
                                    value={salesData?.payment_in || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                        </SimpleGrid>
                    </SimpleGrid>
                </Box>
            </Box>
        </Box>
    )
};

export default Retreats;
