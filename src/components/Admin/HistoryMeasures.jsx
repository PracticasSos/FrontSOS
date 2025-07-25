import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";
import { Box, Button, Heading, Spinner, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

const HistoryMeasures = () => {
    const { patientId } = useParams();
    const [measures, setMeasures] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMeasures();
    }, [patientId]);

    const fetchMeasures = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("rx_final")
                .select("*")
                .eq("patient_id", patientId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            setMeasures(data);
        } catch (error) {
            console.error("Error fetching measures:", error);
        } finally {
            setLoading(false);
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
            case 4:
                navigate('/SuperAdmin');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
            <Heading mb={6} textAlign="center">Historial de Medidas</Heading>
            <Button colorScheme="blue" onClick={() => handleNavigate("/SalesForm")} mr={2}>Registrar Medidas</Button>
            <Button colorScheme="gray" onClick={() => handleNavigate()}>Volver a Opciones</Button>
            {loading ? (
                <Spinner size="xl" mt={4} />
            ) : (
                <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Fecha</Th>
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
                            {measures.map((measure) => (
                                <React.Fragment key={measure.id}>
                                    <Tr key={measure.id}>
                                        <Td rowSpan={2}>{new Date(measure.created_at).toLocaleDateString()}</Td>
                                        <Td>OD</Td>
                                        <Td>{measure.sphere_right}</Td>
                                        <Td>{measure.cylinder_right}</Td>
                                        <Td>{measure.axis_right}</Td>
                                        <Td>{measure.prism_right}</Td>
                                        <Td>{measure.add_right}</Td>
                                        <Td>{measure.av_vl_right}</Td>
                                        <Td>{measure.av_vp_right}</Td>
                                        <Td>{measure.dnp_right}</Td>
                                        <Td>{measure.alt_right}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>OI</Td>
                                        <Td>{measure.sphere_left}</Td>
                                        <Td>{measure.cylinder_left}</Td>
                                        <Td>{measure.axis_left}</Td>
                                        <Td>{measure.prism_left}</Td>
                                        <Td>{measure.add_left}</Td>
                                        <Td>{measure.av_vl_left}</Td>
                                        <Td>{measure.av_vp_left}</Td>
                                        <Td>{measure.dnp_left}</Td>
                                        <Td>{measure.alt_left}</Td>
                                    </Tr>
                                </React.Fragment>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </Box>
    );
};

export default HistoryMeasures;
