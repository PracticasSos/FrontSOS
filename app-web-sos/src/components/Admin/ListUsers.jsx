import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Text, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, firstname, lastname, username, age, role:role_id(role_name), email, phone_number, ci, branch:branch_id(name_branch)');

    if (error) {
      console.error('Error:', error);
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

  const handleNavigate = (route) => {
    navigate(route);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
      navigate('/Login');
    }, 2000); // Mostrar la pantalla de cierre de sesión por 2 segundos
  };

  if (isLoggingOut) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Text fontSize="2xl" mr={4}>Cerrando sesión...</Text>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Lista de Usuarios</Heading>
      <Button onClick={() => handleNavigate('/Register')} mt={4}>
        Registrar Usuarios
      </Button>
      <Button onClick={() => handleNavigate('/Admin')} mt={4}>
        Volver a Opciones
      </Button>
      <Button onClick={handleLogout} mt={4}>
        Cerrar Sesión
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
              <Th>Apellido</Th>
              <Th>Username</Th>
              <Th>Edad</Th>
              <Th>Rol</Th>
              <Th>Correo</Th>
              <Th>Celular</Th>
              <Th>C.I.</Th>
              <Th>Sucursal</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map(user => (
              <Tr key={user.id}>
                <Td>{user.firstname}</Td>
                <Td>{user.lastname}</Td>
                <Td>{user.username}</Td>
                <Td>{user.age}</Td>
                <Td>{user.role.role_name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.phone_number}</Td>
                <Td>{user.ci}</Td>
                <Td>{user.branch.name_branch}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ListUsers;
