import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ListLab = () => {
    const [branch, setBranch] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchLabs();
    }, []);

    const fetchLabs = async () => {
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
        <Box bgColor="#f0f0f0" minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
            <Box width="100%" maxWidth="1200px" bgColor="#ffffff" borderRadius="8px" boxShadow="md" padding="20px">
                <Heading as="h2" size="lg" textAlign="center" mb={4} color="#000000">
                    Lista de Laboratorios
                </Heading>

                <Box display="flex" justifyContent="space-between" mb={4}>
                    <Button 
                        onClick={() => handleNavigate('/Register')} 
                        bgColor="#00A8C8" 
                        color="white" 
                        _hover={{ bgColor: "#008B94" }}
                    >
                        Registrar Laboratorio
                    </Button>
                    <Button 
                        onClick={() => handleNavigate('/Admin')} 
                        bgColor="#00A8C8" 
                        color="white" 
                        _hover={{ bgColor: "#008B94" }}
                    >
                        Volver a Opciones
                    </Button>
                </Box>

                <Input
                    placeholder="Buscar por nombre, dirección o correo"
                    value={search}
                    onChange={handleSearchChange}
                    mb={4}
                    borderColor="#00A8C8"
                    _focus={{ borderColor: "#008B94" }}
                />

                <Box overflowX="auto">
                    <Table variant="simple" minWidth="800px">
                        <Thead>
                            <Tr>
                                <Th color="#000000">Nombre</Th>
                                <Th color="#000000">Dirección</Th>
                                <Th color="#000000">Correo</Th>
                                <Th color="#000000">Teléfono</Th>
                                <Th color="#000000">Ruc</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {branch.filter(lab => {
                                return lab.name.toLowerCase().includes(search.toLowerCase()) ||
                                    lab.address.toLowerCase().includes(search.toLowerCase()) ||
                                    lab.email.toLowerCase().includes(search.toLowerCase());
                            }).map(lab => (
                                <Tr key={lab.id}>
                                    <Td>{lab.name}</Td>
                                    <Td>{lab.address}</Td>
                                    <Td>{lab.email}</Td>
                                    <Td>{lab.cell}</Td>
                                    <Td>{lab.ruc}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Box>
        </Box>
    );
};

export default ListLab;
