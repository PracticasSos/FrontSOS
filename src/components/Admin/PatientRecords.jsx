import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate } from "react-router-dom";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Heading, Text, HStack, VStack, Divider, Badge, Button, Select,Grid, FormControl, FormLabel, Input } from "@chakra-ui/react";

const PatientRecords = () => {
    const [records, setRecords] = useState([]);
    const [salesRecords, setSalesRecords] = useState([]);
    const [withdrawalsRecords, setWithdrawalsRecords] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [totals, setTotals] = useState({ EFEC: 0, DATAF: 0, TRANS: 0, abonosDelDia: 0 });
    const [grandTotal, setGrandTotal] = useState(0);
    const [egresos, setEgresos] = useState([]);
    const [egresosTotals, setEgresosTotals] = useState({ EFEC: 0, DATAF: 0, TRANS: 0 });
    const [egresosGrandTotal, setEgresosGrandTotal] = useState(0);
    const [finalBalance, setFinalBalance] = useState({ EFEC: 0, DATAF: 0, TRANS: 0, total: 0 });
    const [totalAbonosDelDia, setTotalAbonosDelDia] = useState({ EFEC: 0, TRANS: 0, DATAF: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            fetchDailyRecords(selectedBranch);
            fetchDailyWithdrawals(selectedBranch);
            fetchExpenses(selectedBranch);
        }
    }, [selectedBranch]);

    useEffect(() => {
        calculateFinalBalance();
    }, [totals, egresosGrandTotal, withdrawalsRecords]);
    
    const calculateFinalBalance = () => {
        const totalWithdrawals = withdrawalsRecords.reduce(
            (sum, record) => sum + Number(record.abonoDelDia || 0), 
            0
        );
        const balance = {
            EFEC: (totals.EFEC || 0) - (egresosTotals.EFEC || 0) + (totalAbonosDelDia.EFEC || 0),
            DATAF: (totals.DATAF || 0) - (egresosTotals.DATAF || 0) + (totalAbonosDelDia.DATAF || 0),
            TRANS: (totals.TRANS || 0) - (egresosTotals.TRANS || 0) + (totalAbonosDelDia.TRANS || 0),
            total: (totals.EFEC || 0) + (totals.DATAF || 0) + (totals.TRANS || 0) 
                   - ((egresosTotals.EFEC || 0) + (egresosTotals.DATAF || 0) + (egresosTotals.TRANS || 0))
                   + (totalAbonosDelDia.EFEC || 0) + (totalAbonosDelDia.TRANS || 0) + (totalAbonosDelDia.DATAF || 0)
        };
        setFinalBalance(balance); 
    };

    const fetchBranches = async () => {
        try {
            const { data, error } = await supabase
                .from("branchs")
                .select("id, name");

            if (error) throw error;
            setBranches(data || []);
        } catch (error) {
            setBranches([]);
        }
    };

    const handleBranchChange = async (event) => {
        const branchId = event.target.value;
        setSelectedBranch(branchId);

        if (branchId) {
            await fetchDailyRecords(branchId);
            await fetchDailyWithdrawals(branchId);

            await fetchExpenses(branchId);
        } else {
            resetData();
        }
    };

    const resetData = () => {
        setSalesRecords([]);
        setWithdrawalsRecords([]);
        setEgresos([]);
        setTotals({ EFEC: 0, DATAF: 0, TRANS: 0, abonosDelDia: 0 });
        setGrandTotal(0);
        setEgresosTotals({ EFEC: 0, DATAF: 0, TRANS: 0 });
        setEgresosGrandTotal(0);
    };

    const fetchDailyRecords = async (branchId) => {
        const today = new Date().toLocaleDateString("en-CA");  
        try {
            const { data, error } = await supabase
                .from("current_sales")
                .select(`
                    id, 
                    date,
                    branchs_id,
                    branchs:branchs_id (id, name),
                    inventario (brand), 
                    lens (lens_type), 
                    total,     
                    credit, 
                    payment_in_day, 
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
            }
        } catch (err) {
            resetData();
        }
    };

    const fetchDailyWithdrawals = async (branchId) => {
        const today = new Date().toLocaleDateString("en-CA");  
        try {
            const { data: salesToday, error: salesError } = await supabase
                .from("sales")
                .select(`
                    id,
                    branchs_id,
                    patients (pt_firstname, pt_lastname),
                    total,
                    payment_balance,
                    credit
                `)
                .eq("branchs_id", branchId);
    
            if (salesError) throw salesError;
    
            const saleIds = salesToday.map(sale => sale.id);
            const { data: withdrawalsToday, error: withdrawalsError } = await supabase
                .from("withdrawals")
                .select(`
                    id,
                    sale_id,
                    previous_balance, 
                    new_balance, 
                    difference, 
                    date
                `)
                .eq("date", today)
                .in("sale_id", saleIds);
    
            if (withdrawalsError) throw withdrawalsError;
            
            let totalAbonosDelDia = { EFEC: 0, TRANS: 0, DATAF: 0 };
            const formattedWithdrawals = withdrawalsToday.map((withdrawal) => {
                const relatedSale = salesToday.find(sale => sale.id === withdrawal.sale_id);
                const abonoDelDia = withdrawal.difference ? Number(withdrawal.difference) : 0;
                const paymentMethod = relatedSale?.payment_balance || "Sin método";
    
                if (paymentMethod === "efectivo") {
                    totalAbonosDelDia.EFEC += abonoDelDia;
                } else if (paymentMethod === "transferencia") {
                    totalAbonosDelDia.TRANS += abonoDelDia;
                } else if (paymentMethod === "datafast") {
                    totalAbonosDelDia.DATAF += abonoDelDia;
                }
                
                return {
                    ...withdrawal,
                    firstName: relatedSale?.patients?.pt_firstname || "Sin nombre",
                    lastName: relatedSale?.patients?.pt_lastname || "Sin apellido",
                    total: relatedSale?.total || 0,
                    credit: relatedSale?.credit || 0,
                    saldoAnterior: Number(withdrawal.previous_balance || 0),
                    abonoDelDia: abonoDelDia,
                    saldo: Number(withdrawal.new_balance || 0),
                    payment_balance: paymentMethod,
                };
            });
    
            setWithdrawalsRecords(formattedWithdrawals);
            setTotalAbonosDelDia((prevTotals) => ({
                ...prevTotals,
                EFEC: totalAbonosDelDia.EFEC,
                TRANS: totalAbonosDelDia.TRANS,
                DATAF: totalAbonosDelDia.DATAF,
                abonosDelDia: totalAbonosDelDia.EFEC + totalAbonosDelDia.TRANS + totalAbonosDelDia.DATAF,
            }));
        } catch (err) {
            setWithdrawalsRecords([]); 
        }
    };
 
    const fetchExpenses = async (branchId) => {
        const today = new Date().toLocaleDateString("en-CA");

        try {
            const { data, error } = await supabase
                .from("egresos")
                .select(`
                    id,
                    date,
                    value,
                    specification,
                    users (firstname),
                    labs (name),
                    branchs (name),
                    payment_in
                `)
                .eq("date", today)
                .eq("branchs_id", branchId);

            if (error) throw error;

            if (data && data.length > 0) {
                setEgresos(data);
                calculateEgresosTotals(data);
            } else {
                setEgresos([]);
                setEgresosTotals({ EFEC: 0, DATAF: 0, TRANS: 0 });
                setEgresosGrandTotal(0);
            }
        } catch (err) {
            setEgresos([]);
            setEgresosTotals({ EFEC: 0, DATAF: 0, TRANS: 0 });
            setEgresosGrandTotal(0);
        }
    };

    const calculateTotals = (data) => {
        const newTotals = {
            EFEC: 0,
            TRANS: 0,
            DATAF: 0,
            abonosDelDia: 0
        };

        data.forEach((record) => {
            const abono = Number(record.payment_in_day);

            if (record.payment_in === "efectivo") newTotals.EFEC += abono;
            if (record.payment_in === "transferencia") newTotals.TRANS += abono;
            if (record.payment_in === "datafast") newTotals.DATAF += abono;
        });

        const total = newTotals.EFEC + newTotals.TRANS + newTotals.DATAF;

        setTotals(newTotals);
        setGrandTotal(total);
        return { ...newTotals, total };
    };

    const calculateEgresosTotals = (data) => {
        const newTotals = {
            EFEC: 0,
            TRANS: 0,
            DATAF: 0
        };

        data.forEach((egreso) => {
            if (egreso.payment_in === "efectivo") newTotals.EFEC += Number(egreso.value);
            if (egreso.payment_in === "transferencia") newTotals.TRANS += Number(egreso.value);
            if (egreso.payment_in === "datafast") newTotals.DATAF += Number(egreso.value);
        });

        const total = newTotals.EFEC + newTotals.TRANS + newTotals.DATAF;

        setEgresosTotals(newTotals);
        setEgresosGrandTotal(total);

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
        <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
            <Heading mb={4} textAlign="center" size="lg" color="teal.500">
                Cierre Diario - {branches.find(b => b.id === selectedBranch)?.name || "Seleccione una Sucursal"}
            </Heading>
            <Box display="flex" justifyContent="space-evenly" alignItems="center" width="100%" mb={4}>
                <Button onClick={() => handleNavigate("/CashClousure")} colorScheme="teal">
                    Consultas de Cierre
                </Button>
                <Button onClick={() => handleNavigate()} colorScheme="blue">
                    Volver a Opciones
                </Button>
                <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">
                    Cerrar Sesión
                </Button>
            </Box>
            <Box mb={6} overflowX="auto">
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
            <Heading size="md" textAlign="center" color="cyan.900">Ingresos</Heading>
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
                            <Td>{record.inventario?.brand ?? "Sin marca"}</Td>
                            <Td>{record.lens}</Td>
                            <Td isNumeric>{record.total}</Td>
                            <Td>{record.payment_in_day}</Td>
                            <Td>{record.credit}</Td>
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
            <Divider my={5} />
            <Heading size="md" textAlign="center" color="green.300">
                Total General: {grandTotal}
            </Heading>
            <Box>
                <Divider my={6} />
                <Heading size="md" textAlign="center" color="cyan.900">Ajustes en Abonos</Heading>
                <Table variant="striped" colorScheme="teal">
                    <Thead>
                        <Tr>
                            <Th>Fecha</Th>
                            <Th>Nombre</Th>
                            <Th>Apellido</Th>
                            <Th>Total</Th>
                            <Th>Abono Anterior</Th>
                            <Th>Abono del Día</Th>
                            <Th>Abono Total</Th>
                            <Th>Saldo</Th>
                            <Th>Pago en</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {withdrawalsRecords.map((record) => (
                            <Tr key={record.id}>
                                <Td>{record.date}</Td>
                                <Td>{record.firstName}</Td>
                                <Td>{record.lastName}</Td>
                                <Td>{record.total}</Td>
                                <Td>{record.saldoAnterior}</Td>
                                <Td>{record.abonoDelDia}</Td>
                                <Td>{record.saldo}</Td>
                                <Td>{record.credit}</Td>
                                <Td>
                                    <Badge
                                        colorScheme={
                                            record.payment_balance ==="efectivo"
                                            ? "green"
                                            : record.payment_balance == "transferencia"
                                            ? "blue"
                                            : "orange"
                                        }
                                    >
                                        {record.payment_balance}
                                    </Badge>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                <Divider my={10} />
                <HStack justifyContent="space-around" spacing={6}>
                    <VStack>
                        <Text fontWeight="bold">EFEC</Text>
                        <Text fontSize="lg" color="green.500">
                            {totalAbonosDelDia.EFEC || 0}
                        </Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold">TRANS</Text>
                        <Text fontSize="lg" color="blue.500">
                            {totalAbonosDelDia.TRANS || 0}
                        </Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold">DATAF</Text>
                        <Text fontSize="lg" color="orange.500">
                            {totalAbonosDelDia.DATAF || 0}
                        </Text>
                    </VStack>
                </HStack>
                <Heading size="md" textAlign="center" color="green.300">
                    Total Abonos del Día: {totalAbonosDelDia.abonosDelDia || 0}
                </Heading>
            </Box>
            <Box>
                <Divider my={10} />
                <Heading size="md" textAlign="center" color="cyan.900">
                    Egresos
                </Heading>
                <Table variant="striped" colorScheme="teal" mb={6}>
                    <Thead>
                        <Tr>
                            <Th>Orden</Th>
                            <Th>Fecha</Th>
                            <Th>Encargado</Th>
                            <Th>Laboratorio</Th>
                            <Th>Valor</Th>
                            <Th>Especificación</Th>
                            <Th>Sucursal</Th>
                            <Th>Pago</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {egresos.map((egreso) => (
                            <Tr key={egreso.id}>
                                <Td>{egreso.id}</Td>
                                <Td>{egreso.date}</Td>
                                <Td>{egreso.users?.firstname || "Sin encargado"}</Td>
                                <Td>{egreso.labs?.name || "Sin laboratorio"}</Td>
                                <Td>{egreso.value}</Td>
                                <Td>{egreso.specification}</Td>
                                <Td>{egreso.branchs?.name || "Sin Sucursal"}</Td>
                                <Td>
                                    <Badge
                                        colorScheme={
                                            egreso.payment_in === "efectivo"
                                                ? "green"
                                                : egreso.payment_in === "transferencia"
                                                    ? "blue"
                                                    : "orange"
                                        }
                                    >
                                        {egreso.payment_in}
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
                            {egresosTotals.EFEC || 0}
                        </Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold">TRANS</Text>
                        <Text fontSize="lg" color="blue.500">
                            {egresosTotals.TRANS || 0}
                        </Text>
                    </VStack>
                    <VStack>
                        <Text fontWeight="bold">DATAF</Text>
                        <Text fontSize="lg" color="orange.500">
                            {egresosTotals.DATAF || 0}
                        </Text>
                    </VStack>
                </HStack>
                <Divider my={5} />
                <Heading size="md" textAlign="center" color="green.300">
                    Total General: {egresosGrandTotal}
                </Heading>
                <Divider my={6} />
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mt={6}>
                <FormControl display="flex" justifyContent="center">
                    <FormLabel>EFEC</FormLabel>
                    <Input
                    type="number"
                    name="cash"
                    value={finalBalance.EFEC}
                    width="auto"
                    maxWidth="150px"
                    readOnly
                    />
                </FormControl>
                <FormControl display="flex" justifyContent="center">
                    <FormLabel>TRANS</FormLabel>
                    <Input
                    type="number"
                    name="transfer"
                    value={finalBalance.TRANS}
                    width="auto"
                    maxWidth="150px"
                    readOnly
                    />
                </FormControl>
                <FormControl display="flex" justifyContent="center">
                <FormLabel>DATAFAST</FormLabel>
                <Input
                    type="number"
                    name="data_fast"
                    value={finalBalance.DATAF}
                    width="auto"
                    maxWidth="150px"
                    readOnly
                    />
                </FormControl>
                </Grid>
                <FormControl mt={6} display="flex" justifyContent="center">
                    <FormLabel>Total</FormLabel>
                        <Input
                        type="number"
                        name="total"
                        value={finalBalance.total}
                        width="auto"
                        maxWidth="150px"
                        readOnly
                    />
                </FormControl> 
            </Box>
        </Box>
    );
};

export default PatientRecords;