import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import {
  Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Flex, useToast, IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const ListLab = () => {
    const [labs, setLabs] = useState([]);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editableData, setEditableData] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLabs();
    }, []);

    const fetchLabs = async () => {
        const { data, error } = await supabase
            .from('labs')
            .select('*');

        if (error) {
            toast({ title: 'Error', description: 'Error al obtener los Laboratorios', status: 'error' });
        } else {
            setLabs(data);
        }
    };

    const handleEdit = (id, lab) => {
        setEditingId(id);
        setEditableData(lab);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (id) => {
        const { error } = await supabase.from('labs').update(editableData).match({ id });
        if (!error) {
            toast({ title: 'Éxito', description: 'Laboratorio actualizado correctamente.', status: 'success' });
            setEditingId(null);
            fetchLabs();
        } else {
            toast({ title: 'Error', description: 'No se pudo actualizar el Laboratorio.', status: 'error' });
        }
    };

    const openConfirm = (id) => {
        setSelectedId(id);
        setIsOpen(true);
    };

    const handleConfirm = () => {
        setIsOpen(false);
        handleDelete(selectedId);
    };

    const handleCancel = () => setIsOpen(false);

    const handleDelete = async (id) => {
        const { error } = await supabase.from('labs').delete().match({ id });       
        if (!error) {
            toast({ title: 'Éxito', description: 'Laboratorio eliminado correctamente.', status: 'success' });
            fetchLabs();
        } else {
            toast({ title: 'Error', description: 'No se pudo eliminar el Laboratorio.', status: 'error' });
        }
    };

    const filteredLabs = labs.filter((lab) => 
        [lab.name].some((field) => field.toLowerCase().includes(search.toLowerCase()))
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
        <Box bgColor="#f0f0f0" minHeight="100vh" padding="20px">
                <Heading as="h2" size="lg" textAlign="center" mb={4} color="#000000">
                    Lista de Laboratorios
                </Heading>
                <Flex mb={4} gap={3} justify="center">
                    <Button colorScheme="blue" onClick={() => handleNavigate('/Labs')}>
                        Registrar Laboratorio
                    </Button>
                    <Button 
                        onClick={() => handleNavigate()} 
                        bgColor="#00A8C8" 
                        color="white" 
                        _hover={{ bgColor: "#008B94" }}
                    >
                        Volver a Opciones
                    </Button>
                </Flex>
                <Input placeholder='Buscar Laboratorio...' value={search} onChange={(e) => setSearch(e.target.value)} mb={4}  w="50%" mx="auto" display="block" />
                <Box overflowX="auto"  bg="white" p={4} borderRadius="lg" shadow="md">
                    <Table variant="striped" colorScheme="teal">
                        <Thead bgColor="#00A8C8">
                            <Tr>
                                {['Nombre', 'Dirección', 'Correo', 'Celular', 'RUC', 'Acciones'].map((header) => (
                                    <Th key={header} fontWeight="bold" color="white" textAlign="center">{header}</Th>     
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredLabs.map((lab) => (
                                <Tr key={lab.id}>
                                    {[
                                        'name', 'address', 'email', 'phone', 'ruc'
                                    ].map((field) => (
                                        <Td key={field}>
                                            {editingId === lab.id ? (
                                                <Input
                                                    name={field}
                                                    value={editableData[field] || ''}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                lab[field] || 'N/A'
                                            )}
                                        </Td>
                                    ))}
                                    <Td textAlign="center">
                                        {editingId === lab.id ? (
                                            <>
                                                <IconButton icon={<BiCheck />} colorScheme="green" onClick={() => handleSave(lab.id)} mr={2} />
                                                <IconButton icon={<BiX />} colorScheme="gray" onClick={() => setEditingId(null)} />
                                            </>
                                        ) : (
                                            <>
                                                <IconButton icon={<BiEdit />} colorScheme="yellow" onClick={() => handleEdit(lab.id, lab)} mr={2} />
                                                <IconButton icon={<BiTrash />} colorScheme="red" onClick={() => openConfirm(lab.id)} />
                                            </>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                <ConfirmDialog
                    isOpen={isOpen}
                    onClose={handleCancel}
                    onConfirm={handleConfirm}
                    title="¿Eliminar laboratorio?"
                    body="Estas seguro de que deseas eliminar este laboratorio? "
                />
        </Box>
    );
};

export default ListLab;
