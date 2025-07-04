import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { 
  Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, useToast, Flex, IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const ListBranch = () => {
    const [branch, setBranch] = useState([]);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editableData, setEditableData] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranch();
    }, []);

    const fetchBranch = async () => {
        const { data, error } = await supabase
            .from('branchs')
            .select('*');
        if (error) {
            toast({ title: 'Error', description: 'Error al obtener las sucursales', status: 'error' });
        } else {
            setBranch(data);
        }
    };

    const handleEdit = (id, branch) => {
        setEditingId(id);
        setEditableData(branch);
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setEditableData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (id) => {
        const { error } = await supabase.from('branchs').update(editableData).match({ id });
        if (!error) {
            toast({ title: 'Éxito', description: 'Sucursal actualizada correctamente.', status: 'success' });
            setEditingId(null);
            fetchBranch();
        } else {
            toast({ title: 'Error', description: 'No se pudo actualizar la sucursal.', status: 'error' });
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
        const { error } = await supabase.from('branchs').delete().match({ id });
        if (!error) { 
            toast({ title: 'Éxito', description: 'Sucursal eliminada correctamente.', status: 'success' });
            fetchBranch(); 
        } else { 
            toast({ title: 'Error', description: 'No se pudo eliminar la sucursal.', status: 'error' }); 
        }
    };

    const filteredBranches = branch.filter((branch) =>
        [branch.name].some((field) =>  
            field.toLowerCase().includes(search.toLowerCase())
        )
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
            case 4:
                navigate('/SuperAdmin');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <Box bgColor="#ffffff" minHeight="100vh" padding="20px">
            <Heading as="h2" size="lg" mb={6} color="#000000" textAlign="center">
                Lista de Sucursales 
            </Heading>
            
            <Flex mb={4} gap={3} justify="center">
                <Button onClick={() => handleNavigate('/Branch')} colorScheme="blue">
                    Registrar Sucursal
                </Button>
                <Button
                    onClick={() => handleNavigate()}
                    bgColor="#00A8C8"
                    color="white"
                >
                    Volver a Opciones
                </Button>
            </Flex>
            <Input placeholder='Buscar sucursal...' value={search} onChange={(e) => setSearch(e.target.value)} mb={4} w="50%" mx="auto" display="block"  />
            <Box overflowX="auto"  bg="white" p={4} borderRadius="lg" shadow="md">
                <Table variant="striped" colorScheme="teal">
                <Thead bgColor="#00A8C8">
                    <Tr>
                        {['Nombre', 'Dirección', 'Correo', 'Teléfono', 'RUC', 'Acciones'].map((header) => (
                            <Th key={header} fontWeight="bold" color="white" textAlign="center">
                                {header}
                            </Th>
                        ))}
                    </Tr>
                </Thead>
                    <Tbody>
                        {filteredBranches.map((branch) => (
                    
                            <Tr key={branch.id}>
                                {[
                                    'name', 'address', 'email', 'cell', 'ruc'
                                ].map((field) => ( 
                                    <Td key={field}>
                                        {editingId === branch.id ? (
                                            <Input
                                                name={field}
                                                value={editableData[field]}
                                                onChange={handleChange}
                                            />
                                        ) : (
                                            branch[field] || 'N/A'
                                        )}
                                    </Td>
                                ))}
                                <Td textAlign="center">
                                    {editingId === branch.id ? (
                                        <>
                                            <IconButton icon={<BiCheck />} colorScheme="green" onClick={() => handleSave(branch.id)} mr={2} />
                                            <IconButton icon={<BiX />} colorScheme="gray" onClick={() => setEditingId(null)} />
                                        </>
                                    ) : (
                                        <>
                                            <IconButton icon={<BiEdit />} colorScheme="yellow" onClick={() => handleEdit(branch.id, branch)} mr={2} />
                                            <IconButton icon={<BiTrash />} colorScheme="red" onClick={() => openConfirm(branch.id)} />
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
                title="¿Eliminar sucursal?"
                body="Estas seguro de que deseas eliminar esta sucursal?"
            />
        </Box>
    );
};

export default ListBranch;
