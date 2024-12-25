import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate } from "react-router-dom";
import { 
    Box, Table, Thead, Tbody, Tr, Th, Td, Heading, Text, HStack, VStack, Divider, Badge, Button, Select 
} from "@chakra-ui/react";

const PatientRecords = ({ branch }) => {
    const [records, setRecords] = useState([]);
    const [branchs, setBranchs] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [totals, setTotals] = useState({ EFEC: 0, DATAF: 0, TRANS: 0 });
    const [grandTotal, setGrandTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranchs();
    }, []);

    const fetchBranchs = async () => {
        const { data, error } = await supabase.from("branchs").select("id, name"); // Asegúrate de obtener 'id' y 'name'

        if (error) {
            console.error("Error al obtener sucursales:", error);
            return;
        }

        setBranchs(data || []);
    };

    const handleBranchChange = (event) => {
        const branchId = event.target.value;
        setSelectedBranch(branchId);

        if (branchId) {
            fetchDailyRecords(branchId);
        } else {
            resetData();
        }
    };

    const resetData = () => {
        setRecords([]);
        setTotals({ EFEC: 0, DATAF: 0, TRANS: 0 });
        setGrandTotal(0);
    };

    const fetchDailyRecords = async (branchId) => {
        const today = new Date().toISOString().split("T")[0];

        try {
            const { data, error } = await supabase
                .from("sales")
                .select(`
                    id, 
                    date,
                    branchs:branchs_id (id, name),  
                    frame, 
                    lens (lens_type), 
                    total, 
                    credit, 
                    balance, 
                    payment_in,
                    patients (pt_firstname, pt_lastname)
                `)
                .eq("date", today)
                .eq("branchs_id", branchId);  // Filtrar por el id de la sucursal seleccionada

            if (error) throw error;

            const formattedRecords = data.map((record) => ({
                ...record,
                firstName: record.patients?.pt_firstname || "Sin nombre",
                lastName: record.patients?.pt_lastname || "Sin apellido",
                lens: record.lens?.lens_type || "Sin tipo",
                branchs: record.branchs?.name || "Sin sucursal",
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

        saveClosingData({
            day: new Date().toISOString().split("T")[0],
            grand_total: totalEFEC + totalTRANS + totalDATAF,
            effective: totalEFEC,
            transference: totalTRANS,
            datafast: totalDATAF,
            branchs: selectedBranch,
        });
    };

    const saveClosingData = async (data) => {
        // Verificar si 'branchs' y 'grand_total' tienen valores válidos
        if (!data.branchs || isNaN(data.grand_total) || data.grand_total === 0) {
            console.log("No hay ventas para el día o la sucursal no está seleccionada.");
            return;  // No guardar si no hay ventas o si la sucursal no es válida
        }
    
        // Asegurar que todos los valores numéricos sean 0 si están vacíos
        const totalEffective = data.effective || 0;
        const totalTransference = data.transference || 0;
        const totalDatafast = data.datafast || 0;
    
        try {
            const { data: existingData, error: fetchError } = await supabase
                .from("closing")
                .select("*")
                .eq("day", data.day)
                .eq("branchs_id", data.branchs)
                .single();
    
            if (fetchError && fetchError.code !== "PGRST116") {
                throw fetchError;
            }
    
            let upsertError;
    
            if (existingData) {
                const { error } = await supabase
                    .from("closing")
                    .update({
                        grand_total: data.grand_total,
                        effective: totalEffective,
                        transference: totalTransference,
                        datafast: totalDatafast,
                    })
                    .eq("day", data.day)
                    .eq("branchs_id", data.branchs);
    
                upsertError = error;
            } else {
                const { error } = await supabase.from("closing").insert([
                    {
                        day: data.day,
                        grand_total: data.grand_total,
                        effective: totalEffective,
                        transference: totalTransference,
                        datafast: totalDatafast,
                        branchs_id: data.branchs,
                    },
                ]);
    
                upsertError = error;
            }
    
            if (upsertError) throw upsertError;
    
            console.log("Datos de cierre guardados o actualizados correctamente:", data);
        } catch (err) {
            console.error("Error al guardar datos de cierre:", err);
        }
    };
    
    

    const handleNavigate = (route) => navigate(route);

    return (
        <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
            <Heading mb={4} textAlign="center" size="lg" color="teal.500">
                Cierre Diario - {selectedBranch || "Seleccione una Sucursal"}
            </Heading>
            <Box mb={6}>
            <Select
                placeholder="Seleccione una sucursal"
                value={selectedBranch}
                onChange={handleBranchChange}
            >
                {branchs.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                    </option>
                ))}
            </Select>

            </Box>
            <Box display="flex" justifyContent="space-evenly" alignItems="center" width="100%" mb={4}>
                <Button onClick={() => handleNavigate("/ConsultarCierre")} colorScheme="teal">
                    Consultas de Cierre
                </Button>
                <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">
                    Volver a Opciones
                </Button>
                <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">
                    Cerrar Sesión
                </Button>
            </Box>

            <Table variant="striped" colorScheme="teal">
                <Thead>
                    <Tr>
                        <Th>Orden</Th>
                        <Th>Fecha</Th>
                        <Th>Sucursal</Th>
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
                            <Td>{record.branchs}</Td>
                            <Td>{record.firstName}</Td>
                            <Td>{record.lastName}</Td>
                            <Td>{record.frame}</Td>
                            <Td>{record.lens}</Td>
                            <Td isNumeric>{record.total}</Td>
                            <Td>{record.credit}</Td>
                            <Td>{record.balance}</Td>
                            <Td>
                                <Badge
                                    colorScheme={
                                        record.payment_in === "efectivo"
                                            ? "green"
                                            : record.payment_in === "transferencia"
                                            ? "blue"
                                            : "orange"
                                    }
                                >
                                    {record.payment_in}
                                </Badge>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Divider my={6} />
            <HStack justifyContent="space-around" spacing={6}>
                <VStack>
                    <Text fontWeight="bold">EFEC</Text>
                    <Text fontSize="lg" color="green.500">
                        {totals.EFEC || 0}
                    </Text>
                </VStack>
                <VStack>
                    <Text fontWeight="bold">TRANS</Text>
                    <Text fontSize="lg" color="blue.500">
                        {totals.TRANS || 0}
                    </Text>
                </VStack>
                <VStack>
                    <Text fontWeight="bold">DATAF</Text>
                    <Text fontSize="lg" color="orange.500">
                        {totals.DATAF || 0}
                    </Text>
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
