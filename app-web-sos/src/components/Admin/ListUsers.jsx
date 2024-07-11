import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ListUsers = () => {
  const [users, setUsers] = useState([]);

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

  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/Register');
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Lista de Usuarios</Heading>
      <Button onClick={handleRegister} mt={4}>
        Registrar Usuarios
      </Button>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
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
          {users.map(user => (
            <Tr key={user.id}>
              <Td>{user.id}</Td>
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
  );
};

export default ListUsers;
