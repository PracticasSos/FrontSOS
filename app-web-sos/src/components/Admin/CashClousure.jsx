import { Box, Button, FormControl, FormLabel, Input, Select, Table, Tr, Td, Th, Thead, Tbody, Badge, Heading, Grid, Divider, VStack, HStack,Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase.js";

const CashClosure = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [egresos, setEgresos] = useState([]);
    const [branches, setBranches] = useState([]);
    const [egresosTotals, setEgresosTotals] = useState({ EFEC: 0, DATAF: 0, TRANS: 0 });
    const [grandTotal, setGrandTotal] = useState(0);
    const [totals, setTotals] = useState({ EFEC: 0, DATAF: 0, TRANS: 0, total: 0 });
    const [egresosGrandTotal, setEgresosGrandTotal] = useState(0);
    const [finalBalance, setFinalBalance] = useState({ EFEC: 0, DATAF: 0, TRANS: 0, total: 0 });
    const [finalBalanceTotal, setFinalBalanceTotal] = useState(0);
    const [formData, setFormData] = useState({
        since: "",
        till: "",
        month: "",
        cash: 0,
        transfer: 0,
        data_fast: 0,
        total: 0
    });

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            fetchDailyRecords(selectedBranch);
            fetchExpenses(selectedBranch);
        }
    }, [formData.since, formData.till, formData.month]);

    useEffect(() => {
        calculateFinalBalance();
    }, [totals, egresosGrandTotal]);

    const calculateFinalBalance = () => {
        const balance = {
            EFEC: totals.EFEC - egresosTotals.EFEC,
            DATAF: totals.DATAF - egresosTotals.DATAF,
            TRANS: totals.TRANS - egresosTotals.TRANS,
            total: totals.total - egresosGrandTotal,
        };
        setFinalBalance(balance);
        setFinalBalanceTotal(balance.total);
    };
    

    const fetchBranches = async () => {
        try {
            const { data, error } = await supabase.from("branchs").select("id, name");
            if (error) throw error;
            setBranches(data || []);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    const fetchDailyRecords = async (branchId) => {
        const { since, till, month } = formData;
        let query = supabase.from("sales").select(`
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
        `).eq("branchs_id", branchId);

        if (since && till) {
            query = query.gte("date", since).lte("date", till);
        } else if (month) {
            const dates = getMonthRange(month);
            if (dates) {
                query = query.gte("date", dates.startDate).lte("date", dates.endDate);
            }
        }

        try {
            const { data, error } = await query;
            if (error) throw error;

            if (data?.length > 0) {
                const formattedRecords = data.map((record) => ({
                    ...record,
                    firstName: record.patients?.pt_firstname || "Sin nombre",
                    lastName: record.patients?.pt_lastname || "Sin apellido",
                    lens: record.lens?.lens_type || "Sin tipo",
                    branchName: record.branchs?.name || "Sin sucursal",
                }));

                setRecords(formattedRecords);
                const calculatedTotals = calculateTotals(formattedRecords);
                setTotals(calculatedTotals);
                setFormData((prev) => ({
                    ...prev,
                    cash: calculatedTotals.EFEC,
                    transfer: calculatedTotals.TRANS,
                    data_fast: calculatedTotals.DATAF,
                    total: calculatedTotals.total
                }));
            } else {
                resetData();
            }
        } catch (err) {
            console.error("Error fetching daily records:", err);
            resetData();
        }
    };

    const resetData = () => {
        setRecords([]);
        setEgresos([]);
        setTotals({ EFEC: 0, DATAF: 0, TRANS: 0, total: 0 });
        setEgresosTotals({ EFEC: 0, DATAF: 0, TRANS: 0 });
        setGrandTotal(0);
        setEgresosGrandTotal(0);
    };

    const calculateTotals = (data) => {
        const newTotals = {
            EFEC: 0,
            TRANS: 0,
            DATAF: 0
        };
    
        data.forEach((record) => {
            const abono = Number(record.credit) || 0;
    
            if (record.payment_in === "efectivo") newTotals.EFEC += abono;
            if (record.payment_in === "transferencia") newTotals.TRANS += abono;
            if (record.payment_in === "datafast") newTotals.DATAF += abono;
        });
    
        const total = newTotals.EFEC + newTotals.TRANS + newTotals.DATAF;
        return { ...newTotals, total };
    };
    

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "month" ? { since: "", till: "" } : {}),
            ...(name === "since" || name === "till" ? { month: "" } : {})
        }));
    };

    const fetchExpenses = async (branchId) => {
        const { since, till, month } = formData;
        let query = supabase.from("egresos").select(`
            id,
            date,
            value,
            specification,
            users (firstname),
            labs (name),
            branchs (name),
            payment_in
        `).eq("branchs_id", branchId);

        if (since && till) {
            query = query.gte("date", since).lte("date", till);
        } else if (month) {
            const dates = getMonthRange(month);
            if (dates) {
                query = query.gte("date", dates.startDate).lte("date", dates.endDate);
            }
        }

        try {
            const { data, error } = await query;
            if (error) throw error;

            if (data?.length > 0) {
                setEgresos(data);
                calculateEgresosTotals(data);
            } else {
                setEgresos([]);
                setEgresosTotals({ EFEC: 0, DATAF: 0, TRANS: 0 });
                setEgresosGrandTotal(0);
            }
        } catch (err) {
            console.error("Error fetching expenses:", err);
            setEgresos([]);
            setEgresosTotals({ EFEC: 0, DATAF: 0, TRANS: 0 });
            setEgresosGrandTotal(0);
        }
    };

    const calculateEgresosTotals = (data) => {
        const newTotals = {
            EFEC: 0,
            TRANS: 0,
            DATAF: 0
        };

        data.forEach((egreso) => {
            const amount = Number(egreso.value) || 0;
            if (egreso.payment_in === "efectivo") newTotals.EFEC += amount;
            if (egreso.payment_in === "transferencia") newTotals.TRANS += amount;
            if (egreso.payment_in === "datafast") newTotals.DATAF += amount;
        });

        const total = newTotals.EFEC + newTotals.TRANS + newTotals.DATAF;

        setEgresosTotals(newTotals);
        setEgresosGrandTotal(total);
    };

    const handleBranchChange = async (event) => {
        const branchId = event.target.value;
        setSelectedBranch(branchId);

        if (branchId) {
            await fetchDailyRecords(branchId);
            await fetchExpenses(branchId);
        } else {
            resetData();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        saveClosingData();
    };

    const getMonthRange = (month) => {
        const monthMapping = {
            Enero: "01",
            Febrero: "02",
            Marzo: "03",
            Abril: "04",
            Mayo: "05",
            Junio: "06",
            Julio: "07",
            Agosto: "08",
            Septiembre: "09",
            Octubre: "10",
            Noviembre: "11",
            Diciembre: "12"
        };

        const currentYear = new Date().getFullYear();
        const monthNumber = monthMapping[month];
        if (monthNumber) {
            const startDate = `${currentYear}-${monthNumber}-01`;
            const lastDay = new Date(currentYear, parseInt(monthNumber), 0).getDate();
            const endDate = `${currentYear}-${monthNumber}-${lastDay}`;
            return { startDate, endDate };
        }
        return null;
    };

    return (
        <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
            <Heading mb={4} textAlign="center" size="lg" color="teal.500">
                Consultar Cierre - {branches.find((b) => b.id === selectedBranch)?.name || "Seleccione una Sucursal"}
            </Heading>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6} justifyItems="center">
                <Button onClick={() => navigate("/ConsultarCierre")} colorScheme="teal" width="auto" maxWidth="200px">
                    Consultas de Cierre
                </Button>
                <Button onClick={() => navigate("/Admin")} colorScheme="blue" width="auto" maxWidth="200px">
                    Volver a Opciones
                </Button>
                <Button onClick={() => navigate("/LoginForm")} colorScheme="red" width="auto" maxWidth="200px">
                    Cerrar Sesión
                </Button>
            </Grid>

            <Box as="form" onSubmit={handleSubmit}>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={6}>
                    <FormControl isRequired>
                        <FormLabel>Óptica</FormLabel>
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
                    </FormControl>

                    <FormControl>
                        <FormLabel>Mes</FormLabel>
                        <Select 
                            name="month" 
                            value={formData.month} 
                            onChange={handleChange}
                            isDisabled={formData.since || formData.till}
                        >
                            <option value="">Seleccione un mes</option>
                            {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                            ].map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Desde</FormLabel>
                        <Input 
                            type="date" 
                            name="since" 
                            value={formData.since} 
                            onChange={handleChange}
                            isDisabled={formData.month !== ""}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Hasta</FormLabel>
                        <Input 
                            type="date" 
                            name="till" 
                            value={formData.till} 
                            onChange={handleChange}
                            isDisabled={formData.month !== ""}
                        />
                    </FormControl>
                </Grid>
                
                <Divider my={10} />
                <Heading size="md" textAlign="center" color="cyan.900">
                    Cierre Diario
                </Heading>
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
                        <Heading size="md" textAlign="center" color="green.300">
                            Total General: {totals.total}
                        </Heading>


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
                        {egresos.map((egresos) => (
                            <Tr key={egresos.id}>
                                <Td>{egresos.id}</Td>
                                <Td>{egresos.date}</Td>
                                <Td>{egresos.users?.firstname || "Sin encargado"}</Td>
                                <Td>{egresos.labs?.name || "Sin laboratorio"}</Td>
                                <Td>{egresos.value}</Td>
                                <Td>{egresos.specification}</Td>
                                <Td>{egresos.branchs?.name || "Sin Sucursal"}</Td>
                                <Td>
                                    <Badge
                                        colorScheme={
                                            egresos.payment_in === "efectivo"
                                            ? "green"
                                            : egresos.payment_in === "transferencia"
                                            ? "blue"
                                            : "orange"
                                            }
                                        >
                                            {egresos.payment_in}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                onChange={handleChange}
                                width="auto"
                                maxWidth="150px"
                                readOnly
                            />
                        </FormControl>
                <Box display="flex" justifyContent="center" mt={6}>
                    <Button 
                        type="submit" 
                        colorScheme="blue" 
                        width="auto" 
                        maxWidth="200px"
                        isDisabled={!selectedBranch || records.length === 0}
                    >
                        Enviar
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CashClosure;