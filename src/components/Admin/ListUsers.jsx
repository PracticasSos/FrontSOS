import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import {
  Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Input, Text, HStack, IconButton, useToast, useColorModeValue
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { FaEye } from 'react-icons/fa';
import SmartHeader from '../header/SmartHeader';

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, firstname, lastname, username, age, role:users_role_fkey(role_name), email, phone_number, ci, branchs:branch_id(name)');

    if (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Error al obtener los usuarios', status: 'error' });
    } else {
      setUsers(data);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.firstname.toLowerCase().includes(search.toLowerCase()) ||
    user.lastname.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id, user) => {
    setEditingId(id);
    setEditableData(user);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    const { error } = await supabase.from('users').update(editableData).match({ id });
    if (!error) {
      toast({ title: 'Éxito', description: 'Usuario actualizado correctamente.', status: 'success' });
      setEditingId(null);
      fetchUsers();
    } else {
      toast({ title: 'Error', description: 'No se pudo actualizar el usuario.', status: 'error' });
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
    const { error } = await supabase.from('users').delete().match({ id });
    if (!error) {
      toast({ title: 'Éxito', description: 'Usuario eliminado correctamente.', status: 'success' });
      fetchUsers();
    } else {
      toast({ title: 'Error', description: 'No se pudo eliminar el usuario.', status: 'error' });
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
            case 4:
                navigate('/SuperAdmin');
                break;
            default:
                navigate('/');
        }
    };

    const moduleSpecificButton = (
  <Button 
    onClick={() => handleNavigate('/register')} 
    bg={useColorModeValue(
      'rgba(255, 255, 255, 0.8)', 
      'rgba(255, 255, 255, 0.1)'
    )}
    backdropFilter="blur(10px)"
    border="1px solid"
    borderColor={useColorModeValue(
      'rgba(56, 178, 172, 0.3)', 
      'rgba(56, 178, 172, 0.5)'
    )}
    color={useColorModeValue('teal.600', 'teal.300')}
    size="sm"
    borderRadius="15px"
    px={4}
    _hover={{
      bg: useColorModeValue(
        'rgba(56, 178, 172, 0.1)', 
        'rgba(56, 178, 172, 0.2)'
      ),
      borderColor: 'teal.400',
      transform: 'translateY(-1px)',
    }}
    transition="all 0.2s"
  >
    <HStack spacing={2} align="center" justify="center">
      <FaEye size="14px" />
      <Text fontWeight="600" lineHeight="1" m={0}>
        Registrar Usuarios
      </Text>
    </HStack>
  </Button>
  );

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tableBg = useColorModeValue('white', 'gray.700');
  const tableHoverBg = useColorModeValue('gray.100', 'gray.600');
  const selectBg = useColorModeValue('white', 'gray.700');

  return (
    <Box p={6} 
      maxW="1300px" 
      mx="auto" 
      bg={bgColor}
      color={textColor}
      minH="100vh">
      <SmartHeader moduleSpecificButton={moduleSpecificButton} />
      <Box w="100%" maxW= "800px" mb={4}>
      <Heading 
          mb={4} 
          textAlign="left" 
          size="md"
          fontWeight="700"
          color={useColorModeValue('teal.600', 'teal.300')}
          pb={2}
      >
          Registrar Usuario
      </Heading>
      </Box>
      <Input
        placeholder="Buscar por nombre, apellido o username"
        value={search}
        onChange={handleSearchChange}
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
              {['Nombre', 'Apellido', 'Username', 'Edad', 'Rol', 'Email', 'Teléfono', 'CI', 'Sucursal', 'Acciones'].map(header => (
                <Th key={header} fontWeight="bold" color="white" textAlign="center">{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map(user => (
              <Tr key={user.id} cursor="pointer" _hover={{ bg: tableHoverBg }} borderColor={borderColor}>
                {['firstname', 'lastname', 'username', 'age', 'role', 'email', 'phone_number', 'ci', 'branchs'].map(field => (
                  <Td key={field} color={textColor} borderColor={borderColor}>
                    {editingId === user.id ? (
                      <Input
                        name={field}
                        value={
                          field === 'role' ? editableData.role?.role_name || user.role?.role_name || '' :
                          field === 'branchs' ? editableData.branchs?.name || user.branchs?.name || '' :
                          editableData[field] || user[field]
                        }
                        onChange={handleChange}
                      />
                    ) : (
                      field === 'role' ? user.role?.role_name || 'N/A' :
                      field === 'branchs' ? user.branchs?.name || 'N/A' :
                      user[field] || 'N/A'
                    )}
                  </Td>
                ))}
                <Td textAlign="center" color={textColor} borderColor={borderColor}>
                  {editingId === user.id ? (
                    <>
                      <IconButton icon={<BiCheck />} colorScheme="green" onClick={() => handleSave(user.id)} mr={2} />
                      <IconButton icon={<BiX />} colorScheme="red" onClick={() => setEditingId(null)} />
                    </>
                  ) : (
                    <>
                      <IconButton icon={<BiEdit />} colorScheme="blue" onClick={() => handleEdit(user.id, user)} mr={2} />
                      <IconButton icon={<BiTrash />} colorScheme="red" onClick={() => openConfirm(user.id)} />
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
        title="¿Eliminar usuario?"
        body="Estas seguro de que deseas eliminar este usuario?"
      />
    </Box>
  );
};

export default ListUsers;
