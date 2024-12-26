import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate } from "react-router-dom";
import { 
    Box, Table, Thead, Tbody, Tr, Th, Td, Heading, Text, HStack, VStack, Divider, Badge, Button, Select 
} from "@chakra-ui/react";

const PatientRecords = () => {
    const [records, setRecords] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [totals, setTotals] = useState({ EFEC: 0, DATAF: 0, TRANS: 0 });
    const [grandTotal, setGrandTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        const { data, error } = await supabase
            .from("branchs")
            .select("id, name");

        if (error) {
            console.error("Error fetching branches:", error);
            return;
        }

        setBranches(data || []);
    };

    const handleBranchChange = async (event) => {
        const branchId = event.target.value;
        setSelectedBranch(branchId);
        
        if (branchId) {
            await fetchDailyRecords(branchId);
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
                    branchs_id,
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
                .eq("branchs_id", branchId);
    
            if (error) throw error;
    
            if (data && data.length > 0) {
                const formattedRecords = data.map((record) => ({
                    ...record,
                    firstName: record.patients?.pt_firstname || "Sin nombre",
                    lastName: record.patients?.pt_lastname || "Sin apellido",
                    lens: record.lens?.lens_type || "Sin tipo",
                    branchName: record.branchs?.name || "Sin sucursal",
                }));
    
                setRecords(formattedRecords);
                const calculatedTotals = calculateTotals(formattedRecords);
                
              
                await saveClosingData({
                    day: today,
                    grand_total: calculatedTotals.total,
                    effective: calculatedTotals.EFEC,
                    transference: calculatedTotals.TRANS,
                    datafast: calculatedTotals.DATAF,
                    branchs_id: branchId,  
                });
            } else {
                resetData();
                console.log("No sales found for selected branch on current date");
            }
        } catch (err) {
            console.error("Error fetching daily records:", err);
            resetData();
        }
    };

    const calculateTotals = (data) => {
        const newTotals = {
            EFEC: 0,
            TRANS: 0,
            DATAF: 0
        };

        data.forEach((record) => {
            if (record.payment_in === "efectivo") newTotals.EFEC += record.total;
            if (record.payment_in === "transferencia") newTotals.TRANS += record.total;
            if (record.payment_in === "datafast") newTotals.DATAF += record.total;
        });

        const total = newTotals.EFEC + newTotals.TRANS + newTotals.DATAF;
        
        setTotals(newTotals);
        setGrandTotal(total);

        return { ...newTotals, total };
    };

    const saveClosingData = async (data) => {
        if (!data.branchs_id || data.grand_total === 0) {
            return;
        }

        try {
            const { data: existingData, error: fetchError } = await supabase
                .from("closing")
                .select("*")
                .eq("day", data.day)
                .eq("branchs_id", data.branchs_id)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                throw fetchError;
            }

            const closingData = {
                day: data.day,
                grand_total: data.grand_total,
                effective: data.effective || 0,
                transference: data.transference || 0,
                datafast: data.datafast || 0,
                branchs_id: data.branchs_id
            };

            if (existingData) {
                const { error } = await supabase
                    .from("closing")
                    .update(closingData)
                    .eq("day", data.day)
                    .eq("branchs_id", data.branchs_id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("closing")
                    .insert([closingData]);

                if (error) throw error;
            }
        } catch (err) {
            console.error("Error saving closing data:", err);
        }
    };

    const handleNavigate = (route) => navigate(route);

    return (
        <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
            <Heading mb={4} textAlign="center" size="lg" color="teal.500">
                Cierre Diario - {branches.find(b => b.id === selectedBranch)?.name || "Seleccione una Sucursal"}
            </Heading>
            <Box mb={6}>
                <Select
                    placeholder="Seleccione una sucursal"
                    value={selectedBranch}
                    onChange={handleBranchChange}
                >
                    {branches.map((branch) => (
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
                            <Td>{record.branchName}</Td>
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