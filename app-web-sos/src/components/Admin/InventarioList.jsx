import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {supabase} from "../../api/supabase.js";
import {Box, Button, Heading, Input, Table, Tbody, Td, Th, Thead, Tr} from "@chakra-ui/react";

const InvetarioList = () => {
    const [invetoryList, setInvetoryList] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const handleNavigate = (route) => {
        navigate(route);
    };
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        const { data, error } = await supabase
            .from('inventario')
            .select('id, bridge, model, price, stock, lunes');

        if (error) {
            console.error('Error fetching patients:', error);
        } else {
            console.log(data)
            setInvetoryList(data);
        }
    };
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };
    return (
        <Box>
            <Heading as="h2" size="lg" mb={4}>Lista de Usuarios</Heading>
            <Button onClick={() => handleNavigate('/Register')} mt={4}>
                Registrar Usuarios
            </Button>
            <Button onClick={() => handleNavigate('/Admin')} mt={4}>
                Volver a Opciones
            </Button>
            <Input
                placeholder="Buscar por nombre, apellido o username"
                value={search}
                onChange={handleSearchChange}
                mb={4}
            />
            <Box overflowX="auto">
                <Table variant="simple" minWidth="800px">
                    <Thead>
                        <Tr>
                            <Th>Bridge</Th>
                            <Th>Lunes</Th>
                            <Th>Model</Th>
                            <Th>Price</Th>
                            <Th>Stock</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {invetoryList.map(user => (
                            <Tr key={user.id}>
                                <Td>{user.bridge}</Td>
                                <Td>{user.lunes}</Td>
                                <Td>{user.model}</Td>
                                <Td>{user.price}</Td>
                                <Td>{user.stock}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    )
}

export default InvetarioList;