import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate } from "react-router-dom";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Heading, Text, HStack, VStack, Divider, Badge, Button } from "@chakra-ui/react";

const PatientRecords = () => {
    const [records, setRecords] = useState([]);
    const [totals, setTotals] = useState({ EFEC: 0, DATAF: 0, TRANS: 0 });
    const [grandTotal, setGrandTotal] = useState(0);
    const [formData, setFormData] = useState({
        day: "",
        grand_total: 0,
        effective: 0,
        transference: 0,
        datafast: 0,
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchDailyRecords();
    }, []);

    // Obtener los registros del día con unión a la tabla de pacientes
    const fetchDailyRecords = async () => {
        const today = new Date().toISOString().split("T")[0];
        try {
            const { data, error } = await supabase
                .from("sales")
                .select(`
                    id, 
                    date, 
                    frame, 
                    lens (lens_type), 
                    total, 
                    credit, 
                    balance, 
                    payment_in,
                    patients (pt_firstname, pt_lastname)
                `)
                .eq("date", today);

            if (error) throw error;

            const formattedRecords = data.map((record) => ({
                ...record,
                firstName: record.patients?.pt_firstname || "Sin nombre",
                lastName: record.patients?.pt_lastname || "Sin apellido",
                lens: record.lens?.lens_type || "Sin tipo",
            }));

            setRecords(formattedRecords);
            calculateTotals(formattedRecords);
        } catch (err) {
            console.error("Error al obtener los registros:", err);
        }
    };

    
    const calculateTotals = (data) => {
        let totalEFEC = 0,
            totalTRANS = 0,
            totalDATAF = 0;

        data.forEach((record) => {
            if (record.payment_in === "efectivo") totalEFEC += record.total;
            if (record.payment_in === "transferencia") totalTRANS += record.total;
            if (record.payment_in === "datafast") totalDATAF += record.total;
        });

        setTotals({ EFEC: totalEFEC, TRANS: totalTRANS, DATAF: totalDATAF });
        setGrandTotal(totalEFEC + totalTRANS + totalDATAF);
    };

    // Actualizar formData y guardar en la base de datos automáticamente
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const currentHour = now.getHours();

        
        const updatedFormData = {
            day: today,
            grand_total: grandTotal,
            effective: totals.EFEC,
            transference: totals.TRANS,
            datafast: totals.DATAF,
        };

        setFormData(updatedFormData);

        
        if (currentHour >= 7 && currentHour < 24) {
            saveClosingData(updatedFormData);
        }
    }, [totals, grandTotal]);

    
    const saveClosingData = async (data) => {
        try {
            // Usamos upsert para insertar o actualizar el registro automáticamente si ya existe
            const { error } = await supabase
                .from("closing")
                .upsert([{
                    day: data.day,
                    grand_total: data.grand_total,
                    effective: data.effective,
                    transference: data.transference,
                    datafast: data.datafast
                }], { onConflict: ['day'] }); 
    
            if (error) throw error;
    
            console.log("Datos de cierre guardados o actualizados automáticamente:", data);
        } catch (err) {
            console.error("Error al guardar datos de cierre:", err);
        }
    };
    
    

    const handleNavigate = (route) => navigate(route);

    return (
        <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
            <Heading mb={4} textAlign="center" size="lg" color="teal.500">
                Cierre Diario
            </Heading>
            <Box display="flex" justifyContent="space-evenly" alignItems="center" width="100%" mb={4}>
                <Button onClick={() => handleNavigate("/ConsultarCierre")} colorScheme="teal">Consultas de Cierre</Button>
                <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">Volver a Opciones</Button>
                <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
            </Box>

            <Table variant="striped" colorScheme="teal">
                <Thead>
                    <Tr>
                        <Th>Orden</Th>
                        <Th>Fecha</Th>
                        <Th>Nombre</Th>
                        <Th>Apellido</Th>
                        <Th>Armazón</Th>
                        <Th>Luna</Th>
                        <Th isNumeric>Total</Th>
                        <Th>Abono</Th>
                        <Th>Saldo</Th>
                        <Th>Pago</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {records.map((record) => (
                        <Tr key={record.id}>
                            <Td>{record.id}</Td>
                            <Td>{record.date}</Td>
                            <Td>{record.firstName}</Td>
                            <Td>{record.lastName}</Td>
                            <Td>{record.frame}</Td>
                            <Td>{record.lens}</Td>
                            <Td isNumeric>{record.total}</Td>
                            <Td>{record.credit}</Td>
                            <Td>{record.balance}</Td>
                            <Td>
                                <Badge colorScheme={
                                    record.payment_in === "efectivo" ? "green" :
                                    record.payment_in === "transferencia" ? "blue" :
                                    "orange"
                                }>
                                    {record.payment_in}
                                </Badge>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Totales */}
            <Divider my={6} />
            <HStack justifyContent="space-around" spacing={6}>
                <VStack>
                    <Text fontWeight="bold">EFEC</Text>
                    <Text fontSize="lg" color="green.500">{totals.EFEC || 0}</Text>
                </VStack>
                <VStack>
                    <Text fontWeight="bold">TRANS</Text>
                    <Text fontSize="lg" color="blue.500">{totals.TRANS || 0}</Text>
                </VStack>
                <VStack>
                    <Text fontWeight="bold">DATAF</Text>
                    <Text fontSize="lg" color="orange.500">{totals.DATAF || 0}</Text>
                </VStack>
            </HStack>
            <Divider my={6} />
            <Heading size="md" textAlign="center" color="teal.600">
                Total General: {grandTotal}
            </Heading>
        </Box>
    );
};

export default PatientRecords;
