import { useState, useEffect } from "react";
import { Box, Heading, Select, Table, Thead, Tbody, Tr, Th, Td, Button, Input } from "@chakra-ui/react";
import { supabase } from "../../api/supabase";
import { useNavigate } from "react-router-dom";

const Balance = () => {
    const [records, setRecords] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [newAbonos, setNewAbonos] = useState({});
    const [paymentMethods, setPaymentMethods] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            fetchAbonos(selectedBranch);
        }
    }, [selectedBranch]);

    const fetchBranches = async () => {
        const { data, error } = await supabase.from("branchs").select("id, name");
        if (!error) setBranches(data || []);
    };

    const fetchAbonos = async (branchId) => {
        const { data, error } = await supabase
            .from("sales")
            .select("id, date, branchs_id, total, credit, balance, payment_balance, patients (pt_firstname, pt_lastname)")
            .eq("branchs_id", branchId)
            .gt("credit", 0);

        if (!error) {
            setRecords(data);
            setNewAbonos({});
            setPaymentMethods({});
        }
    };

    const handleAbonoChange = (id, value) => {
        setNewAbonos((prevState) => ({ ...prevState, [id]: value }));
    };

    const handlePaymentChange = (id, method) => {
        setPaymentMethods((prevState) => ({ ...prevState, [id]: method }));
    };

    const handleAbonoSubmit = async (record) => {
        const abono = parseFloat(newAbonos[record.id]) || 0;
        const paymentMethod = paymentMethods[record.id] || "";

        if (abono <= 0 || abono > record.credit) {
            alert("Abono inválido");
            return;
        }

        if (!paymentMethod) {
            alert("Seleccione un método de pago");
            return;
        }

        const nuevoBalance = record.balance + abono;
        const nuevoCredito = record.credit - abono;

        try {
            const { error } = await supabase
                .from("sales")
                .update({ 
                    balance: nuevoBalance, 
                    credit: nuevoCredito,
                    payment_balance: paymentMethod
                })
                .eq("id", record.id);

            if (error) throw error;

            fetchAbonos(selectedBranch);
            setNewAbonos((prevState) => ({ ...prevState, [record.id]: "" }));
            setPaymentMethods((prevState) => ({ ...prevState, [record.id]: "" }));
        } catch (error) {
            console.error("Error al actualizar el abono:", error);
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
            default:
                navigate('/');
        }
    };
    

    return (
        <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
            <Heading mb={4} textAlign="center" size="lg" color="teal.500">
                Gestión de Abonos
            </Heading>
            <Box mb={6} display="flex" justifyContent="center">
                <Box display="flex" justifyContent="space-between" width="100%" maxWidth="900px" mb={4}>
                    <Button onClick={() => handleNavigate("/CashClousure")} colorScheme="teal">Cierre Diario</Button>
                    <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
                    <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
                </Box>
            </Box>
            <Select placeholder="Seleccione una sucursal" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
            </Select>
            <Table variant="striped" colorScheme="teal" mt={4}>
                <Thead>
                    <Tr>
                        <Th>Fecha</Th>
                        <Th>Nombre</Th>
                        <Th>Total</Th>
                        <Th>Abonos</Th>
                        <Th>Saldo</Th>
                        <Th>Nuevo Abono</Th>
                        <Th>Método de Pago</Th>
                        <Th>Acción</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {records.map((record) => (
                        <Tr key={record.id}>
                            <Td>{record.date}</Td>
                            <Td>{record.patients.pt_firstname} {record.patients.pt_lastname}</Td>
                            <Td>{record.total}</Td>
                            <Td>{record.balance}</Td>
                            <Td>{record.credit}</Td>
                            <Td>
                                <Input
                                    type="number"
                                    value={newAbonos[record.id] || ""}
                                    onChange={(e) => handleAbonoChange(record.id, e.target.value)}
                                    placeholder="Ingrese abono"
                                />
                            </Td>
                            <Td>
                                <Select value={paymentMethods[record.id] || ""} onChange={(e) => handlePaymentChange(record.id, e.target.value)}>
                                    <option value="">Seleccione</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="datafast">Datafast</option>
                                    <option value="transferencia">Transferencia</option>
                                </Select>
                            </Td>
                            <Td>
                                <Button colorScheme="green" onClick={() => handleAbonoSubmit(record)}>Registrar</Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default Balance;
