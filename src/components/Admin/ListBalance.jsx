import { Box, Button, Flex, Heading, IconButton, Input, Table, Tbody, Td, Thead, Tr, useToast, Th , Select} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";
import { BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';

const ListBalance = () => {
    const [listBalance, setListBalance] = useState([]);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editableData, setEditableData] = useState({ balance: "", payment_balance: "" });
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchListBalance();
    }, []);

    const fetchListBalance = async () => {
        const { data, error } = await supabase
            .from('sales')
            .select('id, date, branchs:branchs_id(name), total, credit, balance, payment_balance, patients:patient_id(pt_firstname, pt_lastname)');
        if (error) {
            toast({ title: 'Error', description: 'Error al obtener los abonos', status: 'error' });
        } else {
            setListBalance(data);
        }
    };

    const handleEdit = (balance) => {
        setEditingId(balance.id);
        setEditableData({ balance: balance.balance, payment_balance: balance.payment_balance });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (id) => {
        const { error } = await supabase.from('sales').update(editableData).match({ id });
        if (!error) {
            toast({ title: 'Éxito', description: 'Abono actualizado correctamente.', status: 'success' });
            setEditingId(null);
            fetchListBalance();
        } else {
            toast({ title: 'Error', description: 'No se pudo actualizar el abono.', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('sales').delete().match({ id });
        if (!error) {
            toast({ title: 'Éxito', description: 'Abono eliminado correctamente.', status: 'success' });
            fetchListBalance();
        } else {
            toast({ title: 'Error', description: 'No se pudo eliminar el abono.', status: 'error' });
        }
    };

    const filteredBalance = listBalance.filter((balance) =>
        balance.patients.pt_firstname.toLowerCase().includes(search.toLowerCase()) ||
        balance.patients.pt_lastname.toLowerCase().includes(search.toLowerCase())
    );

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
        <Box bgColor="#ffffff" minHeight="100vh" padding="20px">
            <Heading as="h2" size="lg" mb={6} color="#000000" textAlign="center"> Listar Abonos</Heading>
            <Flex mb={4} gap={3} justify="center">
                <Button onClick={() => handleNavigate('/Balance')} colorScheme="blue">Registrar Abono</Button>
                <Button onClick={() => handleNavigate('/')} bgColor="#00A8C8" color="white">Volver a Opciones</Button>
            </Flex>
            <Input placeholder='Buscar Abono...' value={search} onChange={(e) => setSearch(e.target.value)} mb={4} w="50%" mx="auto" display="block" />
            <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
                <Table variant="striped" colorScheme="teal">
                    <Thead bgColor="#00A8C8">
                        <Tr>
                            {['Fecha', 'Paciente', 'Sucursal', 'Total', 'Abono', 'Saldo', 'Pago En', 'Acción'].map((header) => (
                                <Th key={header} fontWeight="bold" color="white" textAlign="center">{header}</Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredBalance.map((balance) => (
                            <Tr key={balance.id}>
                                <Td>{balance.date}</Td>
                                <Td>{balance.patients.pt_firstname} {balance.patients.pt_lastname}</Td>
                                <Td>{balance.branchs.name}</Td>
                                <Td>{balance.total}</Td>
                                <Td>
                                    {editingId === balance.id ? (
                                        <Input name="balance" value={editableData.balance} onChange={handleChange} />
                                    ) : (
                                        balance.balance
                                    )}
                                </Td>
                                <Td>{balance.credit}</Td>
                                <Td>
                                    {editingId === balance.id ? (
                                        <Select name="payment_balance" value={editableData.payment_balance} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="datafast">Datafast</option>
                                            <option value="transferencia">Transferencia</option>
                                        </Select>
                                    ) : (
                                        balance.payment_balance || 'N/A'
                                    )}
                                </Td>
                                <Td textAlign="center">
                                    {editingId === balance.id ? (
                                        <>
                                            <IconButton icon={<BiCheck />} colorScheme="green" onClick={() => handleSave(balance.id)} mr={2} />
                                            <IconButton icon={<BiX />} colorScheme="red" onClick={() => setEditingId(null)} />
                                        </>
                                    ) : (
                                        <>
                                            <IconButton icon={<BiEdit />} colorScheme="blue" onClick={() => handleEdit(balance)} mr={2} />
                                            <IconButton icon={<BiTrash />} colorScheme="red" onClick={() => handleDelete(balance.id)} />
                                        </>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};

export default ListBalance;
