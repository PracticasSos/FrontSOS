import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import {
  Box, Button, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue ,
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tableBg = useColorModeValue('white', 'gray.700');
  const tableHoverBg = useColorModeValue('gray.100', 'gray.600');
  const selectBg = useColorModeValue('white', 'gray.700');

  return (
    <Box 
      p={6} 
      maxW="1300px" 
      mx="auto" 
      bg={bgColor}
      color={textColor}
      minH="100vh">
      <Heading mb={4} textAlign="center">
        Lista de Lunas
      </Heading>

      <Box display="flex" justifyContent="center" gap={4} mb={4}>
        <Button onClick={() => handleNavigate('/RegisterLens')} colorScheme="blue">
          Registrar Lente
        </Button>
        <Button onClick={() => handleNavigate()} bgColor="#00A8C8" color="white">
          Volver a Opciones
        </Button>
      </Box>
      <Input
        placeholder='Buscar Lente...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={4}
        w="50%"
        mx="auto"
        display="block"
        bg={selectBg}
          borderColor={borderColor}
          color={textColor}
          _hover={{
            borderColor: useColorModeValue('gray.300', 'gray.500')
          }}
          _focus={{
            borderColor: useColorModeValue('blue.500', 'blue.300'),
            boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
          }}
      />
      <Box width="100%" maxWidth="1500px"  overflowX="auto">
        <Table bg={tableBg}  borderRadius="md" overflow="hidden">
          <Thead>
            <Tr bg={useColorModeValue('gray.50', 'gray.600')}>
              {['Tipo de Lente', 'Precio', 'Acciones'].map(header => (
                <Th key={header} fontWeight="bold"  textAlign="center" color={textColor} borderColor={borderColor}>
                  {header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {filteredLens.map(item => (
              <Tr key={item.id} cursor="pointer" _hover={{ bg: tableHoverBg }} borderColor={borderColor}>
                {['lens_type', 'lens_price'].map(field => (
                  <Td key={field} color={textColor} borderColor={borderColor}>
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
                <Td textAlign="center" color={textColor} borderColor={borderColor}>
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
