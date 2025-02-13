import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, List, ListItem } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ListBranch = () => {
    const [branch, setBranch] = useState([]);
    const [search, setSearch] = useState('');
    const [filteredBranches, setFilteredBranches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('branchs')
            .select('id, name, address, email, cell, ruc');

        if (error) {
            console.error('Error:', error);
        } else {
            setBranch(data);
            setFilteredBranches(data); // Initialize with all branches
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearch(query);

        // Filter branches based on the search query
        if (query) {
            const filtered = branch.filter(
                (user) =>
                    user.name.toLowerCase().includes(query.toLowerCase()) ||
                    user.address.toLowerCase().includes(query.toLowerCase()) ||
                    user.email.toLowerCase().includes(query.toLowerCase()) ||
                    user.cell.toLowerCase().includes(query.toLowerCase()) ||
                    user.ruc.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredBranches(filtered);
        } else {
            setFilteredBranches(branch); // Show all branches if no search query
        }
    };

    const handleSearchSelect = (selected) => {
        setSearch(selected.name); // Auto-complete with the selected name
        setFilteredBranches([selected]); // Display only the selected branch
    };

    const handleNavigate = (route) => {
        navigate(route);
    };

    return (
        <Box bgColor="#ffffff" minHeight="100vh" padding="20px">
            <Heading as="h2" size="lg" mb={6} color="#000000" textAlign="center">
                Lista de Usuarios
            </Heading>
            
            <Box display="flex" justifyContent="space-between" mb={6}>
                <Button
                    onClick={() => handleNavigate('/Register')}
                    bgColor="#00A8C8"
                    color="white"
                    _hover={{ bgColor: "#008B94" }}
                    width="30%"
                >
                    Registrar Usuarios
                </Button>
                <Button
                    onClick={() => handleNavigate('/Admin')}
                    bgColor="#00A8C8"
                    color="white"
                    _hover={{ bgColor: "#008B94" }}
                    width="30%"
                >
                    Volver a Opciones
                </Button>
            </Box>

            <Box mb={6}>
                <Input
                    placeholder="Buscar por nombre, dirección, correo, teléfono o ruc"
                    value={search}
                    onChange={handleSearchChange}
                    bgColor="#ffffff"
                    borderColor="#00A8C8"
                    _focus={{ borderColor: "#008B94" }}
                    width="100%"
                    maxWidth="600px"
                    margin="0 auto"
                />
                {search && (
                    <List bgColor="#f0f0f0" border="1px solid #ccc" maxHeight="200px" overflowY="auto" mt={2} borderRadius="8px">
                        {filteredBranches.map((user) => (
                            <ListItem
                                key={user.id}
                                padding="8px"
                                _hover={{ backgroundColor: "#00A8C8", color: "white", cursor: "pointer" }}
                                onClick={() => handleSearchSelect(user)}
                            >
                                {user.name}
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            <Box overflowX="auto">
                <Table variant="simple" minWidth="800px">
                    <Thead>
                        <Tr>
                            <Th color="#000000">Nombre</Th>
                            <Th color="#000000">Dirección</Th>
                            <Th color="#000000">Correo</Th>
                            <Th color="#000000">Teléfono</Th>
                            <Th color="#000000">RUC</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredBranches.map(user => (
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

export default ListBranch;
