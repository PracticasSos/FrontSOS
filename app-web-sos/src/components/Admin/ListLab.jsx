import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ListLab = () => {
    const [branch, setBranch] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('labs')
            .select('id, name, address, email, cell, ruc');

        if (error) {
            console.error('Error:', error);
        } else {
            setBranch(data);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };



    const handleNavigate = (route) => {
        navigate(route);
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

                            <Th>Nombre</Th>
                            <Th>Dirección</Th>
                            <Td>Correo</Td>
                            <Th>Teléfono</Th>
                            <Th>Ruc</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {branch.map(user => (
                            <Tr key={user.id}>

                                <Td>{user.name}</Td>
                                <Td>{user.address}</Td>
                                <Td>{user.email}</Td>
                                <Td>{user.cell}</Td>
                                <Td>{user.ruc}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};

export default ListLab;
