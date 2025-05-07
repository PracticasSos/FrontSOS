import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import {
  Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Input, Text, Spinner, Flex, IconButton, useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

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
    if (route) { navigate(route); return; }
    if (!user || !user.role_id) { navigate('/LoginForm'); return; }
    switch (user.role_id) {
      case 1: navigate('/Admin'); break;
      case 2: navigate('/Optometra'); break;
      case 3: navigate('/Vendedor'); break;
      default: navigate('/');
    }
  };

  return (
    <Box bgColor="#ffffff" minHeight="100vh" padding="20px">
      <Heading as="h2" size="lg" mb={6} color="#000000" textAlign="center">Lista de Usuarios</Heading>
      <Flex mb={4} gap={3} justify="center">
        <Button onClick={() => handleNavigate('/Register')} colorScheme="blue">Registrar Usuarios</Button>
        <Button onClick={() => handleNavigate()} bgColor="#00A8C8" color="white">Volver a Opciones</Button>
      </Flex>
      <Input
        placeholder="Buscar por nombre, apellido o username"
        value={search}
        onChange={handleSearchChange}
        mb={4}
        w="50%"
        mx="auto"
        display="block"
      />
      <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
        <Table variant="striped" colorScheme="teal">
          <Thead bgColor="#00A8C8">
            <Tr>
              {['Nombre', 'Apellido', 'Username', 'Edad', 'Rol', 'Email', 'Teléfono', 'CI', 'Sucursal', 'Acciones'].map(header => (
                <Th key={header} fontWeight="bold" color="white" textAlign="center">{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map(user => (
              <Tr key={user.id}>
                {['firstname', 'lastname', 'username', 'age', 'role', 'email', 'phone_number', 'ci', 'branchs'].map(field => (
                  <Td key={field}>
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
                <Td textAlign="center">
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
