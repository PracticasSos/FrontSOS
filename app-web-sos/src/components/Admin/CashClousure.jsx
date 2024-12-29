import { Box, Button, FormControl, FormLabel, Input, Select, Table, Tr, Td, Th, Thead, Tbody, Badge, Heading, Grid } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase.js";

const CashClosure = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [branches, setBranches] = useState([]);
    const [totals, setTotals] = useState({ EFEC: 0, DATAF: 0, TRANS: 0, total: 0 });
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
        }
    }, [formData.since, formData.till, formData.month]);

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
            
            const monthNumber = new Date(Date.parse(month + " 1, 2000")).getMonth() + 1;
            const monthString = monthNumber.toString().padStart(2, '0');
            query = query.ilike("date", `%-${monthString}-%`);
        }

        try {
            const { data, error } = await query;
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
                setTotals(calculatedTotals);
                setFormData(prev => ({
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
        setTotals({ EFEC: 0, DATAF: 0, TRANS: 0, total: 0 });
        setFormData(prev => ({
            ...prev,
            cash: 0,
            transfer: 0,
            data_fast: 0,
            total: 0
        }));
    };

    const calculateTotals = (data) => {
        const newTotals = {
            EFEC: 0,
            TRANS: 0,
            DATAF: 0
        };

        data.forEach((record) => {
            const amount = Number(record.total) || 0;
            if (record.payment_in === "efectivo") newTotals.EFEC += amount;
            if (record.payment_in === "transferencia") newTotals.TRANS += amount;
            if (record.payment_in === "datafast") newTotals.DATAF += amount;
        });

        const total = newTotals.EFEC + newTotals.TRANS + newTotals.DATAF;
        return { ...newTotals, total };
    };

    const saveClosingData = async () => {
        if (!selectedBranch) {
            alert("Por favor seleccione una sucursal");
            return;
        }

        const closingData = {
            day: new Date().toISOString().split("T")[0],
            grand_total: formData.total,
            effective: formData.cash,
            transference: formData.transfer,
            datafast: formData.data_fast,
            branchs_id: selectedBranch
        };

        try {
            const { error } = await supabase.from("cash_closures").insert([closingData]);
            if (error) throw error;
            alert("Cierre guardado exitosamente");
            resetData();
        } catch (err) {
            console.error("Error saving closing data:", err);
            alert("Error al guardar el cierre");
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Si se selecciona un mes, limpiar las fechas desde/hasta
            ...(name === 'month' ? { since: '', till: '' } : {}),
            // Si se selecciona una fecha, limpiar el mes
            ...(name === 'since' || name === 'till' ? { month: '' } : {})
        }));
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

    const handleSubmit = (event) => {
        event.preventDefault();
        saveClosingData();
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

                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mt={6}>
                    <FormControl display="flex" justifyContent="center">
                        <FormLabel>EFEC</FormLabel>
                        <Input
                            type="number"
                            name="cash"
                            value={formData.cash}
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
                            value={formData.transfer}
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
                            value={formData.data_fast}
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
                        value={formData.total}
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
                        Registrar Cierre
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CashClosure;