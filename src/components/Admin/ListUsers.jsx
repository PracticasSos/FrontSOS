import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Text, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, firstname, lastname, username, age, role:role_id(role_name), email, phone_number, ci, branchs:branchs_id(name)');

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


  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
      navigate('/Login');
    }, 2000);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleUpdate = () => {
    if (selectedUser) {
      navigate(`/UpdateUser/${selectedUser.id}`);
    } else {
      alert('Por favor selecciona un usuario para actualizar.');
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id);

      if (error) {
        console.error('Error al eliminar:', error);
      } else {
        alert(`Usuario ${selectedUser.firstname} eliminado con éxito.`);
        setUsers(users.filter(user => user.id !== selectedUser.id));
        setSelectedUser(null);
      }
    } else {
      alert('Por favor selecciona un usuario para eliminar.');
    }

    if (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar al usuario.');
    }else {
      alert('Usuario actualizado con éxito.')
      setIsEditing(false);

      setUsers((prevUsets) => 
        prevUsets.map((user) => 
          user.id === selectedUser.id ? {...user, ...selectedUser}: user  
        )
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedUser(null);
  }

  if (isLoggingOut) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Text fontSize="2xl" mr={4}>Cerrando sesión...</Text>
        <Spinner size="xl" />
      </Box>
    );
  }

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
    <Box>
      <Heading as="h2" size="lg" mb={4}>Lista de Usuarios</Heading>
      <Button onClick={() => handleNavigate('/Register')} mt={4}>
        Registrar Usuarios
      </Button>
      <Button onClick={() => handleNavigate()} mt={4}>
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
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map(user => (
              <Tr
                key={user.id}
                onClick={() => handleSelectUser(user)}
                style={{
                  backgroundColor: selectedUser?.id === user.id ? '#e0f7fa' : 'transparent',
                  cursor: 'pointer',
                }}
              >
      
                <Td>{user.firstname}</Td>
                <Td>{user.lastname}</Td>
                <Td>{user.username}</Td>
                <Td>{user.age}</Td>
                <Td>{user.role.role_name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.phone_number}</Td>
                <Td>{user.ci}</Td>
                <Td>{user.branch.name}</Td>
                <Td>
                  <Button colorScheme="blue" size="sm" onClick={() => handleSelectUser(user)}>
                    Seleccionar
                  </Button>
                </Td>
              </Tr>
            ))}
 
          </Tbody>
        </Table>
        
      </Box>
      <Box display="flex" justifyContent="space-around" mt={6}>
        <Button onClick={handleUpdate} colorScheme="blue">Actualizar</Button>
        <Button onClick={handleDelete} colorScheme="red">Eliminar</Button>
      </Box>
    </Box>
  );
};

export default ListUsers;
