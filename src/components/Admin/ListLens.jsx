import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import {
  Box, Button, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Input, useToast, IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const ListLens = () => {
  const [lens, setLens] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLens();
  }, []);

  const fetchLens = async () => {
    const { data, error } = await supabase.from('lens').select('*');
    if (error) {
      toast({ title: 'Error', description: 'Error al obtener las lentes', status: 'error' });
    } else {
      setLens(data);
    }
  };

  const handleEdit = (id, item) => {
    setEditingId(id);
    setEditableData(item);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    const { error } = await supabase.from('lens').update(editableData).match({ id });
    if (!error) {
      toast({ title: 'Éxito', description: 'Lente actualizada correctamente.', status: 'success' });
      setEditingId(null);
      fetchLens();
    } else {
      toast({ title: 'Error', description: 'No se pudo actualizar la lente.', status: 'error' });
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
    const { error } = await supabase.from('lens').delete().match({ id });
    if (!error) {
      toast({ title: 'Éxito', description: 'Lente eliminada correctamente.', status: 'success' });
      fetchLens();
    } else {
      toast({ title: 'Error', description: 'No se pudo eliminar la lente.', status: 'error' });
    }
  };

  const filteredLens = lens.filter(item =>
    [item.lens_type].some(field => field.toLowerCase().includes(search.toLowerCase()))
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
      case 1: navigate('/Admin'); break;
      case 2: navigate('/Optometra'); break;
      case 3: navigate('/Vendedor'); break;
      default: navigate('/');
    }
  };

  return (
    <Box bgColor="#ffffff" minHeight="100vh" padding="20px">
      <Heading as="h2" size="lg" mb={6} color="#000000" textAlign="center">
        Lista de Lunas
      </Heading>
      <Flex mb={4} gap={3} justify="center">
        <Button onClick={() => handleNavigate('/RegisterLens')} colorScheme="blue">
          Registrar Lente
        </Button>
        <Button onClick={() => handleNavigate()} bgColor="#00A8C8" color="white">
          Volver a Opciones
        </Button>
      </Flex>
      <Input
        placeholder='Buscar Lente...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={4}
        w="50%"
        mx="auto"
        display="block"
      />
      <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
        <Table variant="striped" colorScheme="teal">
          <Thead bgColor="#00A8C8">
            <Tr>
              {['Tipo de Lente', 'Precio', 'Acciones'].map(header => (
                <Th key={header} fontWeight="bold" color="white" textAlign="center">
                  {header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {filteredLens.map(item => (
              <Tr key={item.id}>
                {['lens_type', 'lens_price'].map(field => (
                  <Td key={field}>
                    {editingId === item.id ? (
                      <Input
                        name={field}
                        value={editableData[field] || ''}
                        onChange={handleChange}
                      />
                    ) : (
                      item[field] || 'N/A'
                    )}
                  </Td>
                ))}
                <Td textAlign="center">
                  {editingId === item.id ? (
                    <>
                      <IconButton icon={<BiCheck />} colorScheme="green" onClick={() => handleSave(item.id)} mr={2} />
                      <IconButton icon={<BiX />} colorScheme="gray" onClick={() => setEditingId(null)} />
                    </>
                  ) : (
                    <>
                      <IconButton icon={<BiEdit />} colorScheme="yellow" onClick={() => handleEdit(item.id, item)} mr={2} />
                      <IconButton icon={<BiTrash />} colorScheme="red" onClick={() => openConfirm(item.id)} />
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
        title="¿Eliminar lente?"
        body="Estas seguro de que deseas eliminar esta lente?"
      />
    </Box>
  );
};

export default ListLens;
