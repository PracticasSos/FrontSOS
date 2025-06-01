import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';

export default function CreateUser() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    username: '',
    age: '',
    birthdate: '',
    phone_number: '',
    ci: '',
  });
  const [tenantName, setTenantName] = useState('');
  const [message, setMessage] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Obtener el role del usuario autenticado al cargar el componente
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        setMessage('No hay usuario autenticado');
        return;
      }
      const { data: userData, error } = await supabase
        .from('users')
        .select('role_id')
        .eq('auth_id', authData.user.id)
        .single();

      if (error) {
        console.error('Error al obtener el role_id:', error.message);
        setMessage('Error al obtener el rol del usuario');
      } else {
        setCurrentUserRole(userData.role_id);
      }
    };
    fetchUserRole();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Verificar que el usuario sea super-admin (role_id = 4)
    if (currentUserRole !== 4) {
      setMessage('No tienes permisos para crear un tenant.');
      return;
    }

    // 1. Crear el tenant (usando la función RPC)
    const { data: tenantData, error: tenantError } = await supabase.rpc('insert_tenant', { tenant_name: tenantName });

    if (tenantError || !tenantData || tenantData.length === 0) {
      setMessage(`Error creando tenant: ${tenantError?.message || 'Respuesta vacía'}`);
      return;
    }

    const newTenantId = tenantData[0].id;

    // 2. Crear usuario en Auth con metadata apuntando a ese tenant
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          tenant_id: newTenantId,
          role: 'admin', // metadata para el hook
        },
      },
    });

    if (signupError || !authData.user) {
      setMessage(`Error creando usuario: ${signupError?.message}`);
      return;
    }

    // 3. Insertar en tabla users (rol admin = 1)
    const { error: insertError } = await supabase.from('users').insert([
      {
        auth_id: authData.user.id,
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        age: formData.age ? parseInt(formData.age) : null,
        birthdate: formData.birthdate || null,
        phone_number: formData.phone_number,
        ci: formData.ci,
        role_id: 1,       // Admin tenant
        tenant_id: newTenantId,
      },
    ]);

    if (insertError) {
      setMessage(`Error insertando en tabla users: ${insertError.message}`);
      return;
    }

    setMessage('✅ Usuario y tenant creados exitosamente');

    // Limpiar formulario
    setFormData({
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      username: '',
      age: '',
      birthdate: '',
      phone_number: '',
      ci: '',
    });
    setTenantName('');
  };


  return (
      <Box as="form" onSubmit={handleSubmit} p={6} maxW="800px" mx="auto" borderRadius="md" boxShadow="md" bg="white">
    <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
      Crear Usuario
    </Text>

    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Contraseña</FormLabel>
        <Input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="firstname" isRequired>
        <FormLabel>Nombre</FormLabel>
        <Input
          name="firstname"
          placeholder="Nombre"
          value={formData.firstname}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="lastname" isRequired>
        <FormLabel>Apellido</FormLabel>
        <Input
          name="lastname"
          placeholder="Apellido"
          value={formData.lastname}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="username" isRequired>
        <FormLabel>Usuario</FormLabel>
        <Input
          name="username"
          placeholder="Usuario"
          value={formData.username}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="age">
        <FormLabel>Edad</FormLabel>
        <Input
          type="number"
          name="age"
          placeholder="Edad"
          value={formData.age}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="birthdate">
        <FormLabel>Fecha Nacimiento</FormLabel>
        <Input
          type="date"
          name="birthdate"
          placeholder="Fecha Nacimiento"
          value={formData.birthdate}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="phone_number">
        <FormLabel>Teléfono</FormLabel>
        <Input
          name="phone_number"
          placeholder="Teléfono"
          value={formData.phone_number}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="ci">
        <FormLabel>Cédula</FormLabel>
        <Input
          name="ci"
          placeholder="Cédula"
          value={formData.ci}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="tenantName" isRequired>
        <FormLabel>Nombre del Tenant</FormLabel>
        <Input
          name="tenantName"
          placeholder="Nombre del Tenant"
          value={tenantName}
          onChange={e => setTenantName(e.target.value)}
        />
      </FormControl>
    </SimpleGrid>

    <Button type="submit" colorScheme="blue" w="full" size="md">
      Crear Usuario
    </Button>

    {message && (
      <Box
        mt={4}
        p={3}
        borderRadius="md"
        bg={message.startsWith('✅') ? 'green.100' : 'red.100'}
        color={message.startsWith('✅') ? 'green.800' : 'red.800'}
        textAlign="center"
      >
        {message}
      </Box>
    )}
  </Box>
  );
}