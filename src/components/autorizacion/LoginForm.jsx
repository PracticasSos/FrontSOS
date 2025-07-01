import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Flex,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'; 
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import './LoginForm.css';
const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isMobile = useBreakpointValue({ base: true, md: false });  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    // 1) Login con Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (authError) {
      setErrorMessage(authError.message);
      setLoading(false);
      return;
    }
    if (!authData?.session) {
      setErrorMessage('No se pudo iniciar sesión.');
      setLoading(false);
      return;
    }

    // // --- DEBUG: imprimir el JWT y los claims ---
    // console.log('JWT (access_token):', authData.session.access_token);
    // console.log('Session user metadata:', authData.session.user.user_metadata);
    // // También puedes inspeccionar la sesión completa:
    // const { data: sessionData } = await supabase.auth.getSession();
    // console.log('Current session:', sessionData);

    const user = authData.user;
    // console.log('Usuario autenticado:', user);

    // 2) Buscar usuario en la tabla 'users' usando el auth_id
    const { data, error } = await supabase
      .from('users')
      .select('id, role_id, tenant_id, auth_id')
      .eq('auth_id', user.id);

    if (error) {
      console.error('Error al obtener datos del usuario:', error);
      setErrorMessage('No se encontró los datos del usuario.');
      setLoading(false);
      return;
    }
    if (!data || data.length === 0) {
      setErrorMessage('Usuario no encontrado.');
      setLoading(false);
      return;
    }

    const userData = data[0];
    console.log('Datos del usuario (tabla users):', userData);

    // 3) Guardar todo en localStorage
    const fullUserData = {
      ...authData.user,
      ...userData,
    };
    localStorage.setItem('user', JSON.stringify(fullUserData));

    // 4) Redirigir según el role_id
    setLoading(false);
    switch (userData.role_id) {
      case 1:
        navigate('/admin');
        break;
      case 4:
        navigate('/SuperAdmin');
        break;
      case 2:
        navigate('/optometra');
        break;
      case 3:
        navigate('/vendedor');
        break;
      default:
        setErrorMessage('Rol desconocido');
        navigate('/');
    }
  };

  return (
  <Flex
    minH="100vh"
    w="100vw"
    overflow="hidden"
    position="fixed"
    top={0}
    left={0}
    flexDir={{ base: "column", md: "row" }}
  >
    {/* Panel izquierdo con imagen - SOLO SE MUESTRA EN MD+ */}
    <Box
      display={{ base: "none", md: "flex" }}
      className="login-left"
      backgroundImage="url('/assets/lentes.jpg')"
      backgroundSize="cover"
      backgroundPosition="center"
      position="relative"
      flex="1"
      minH="100vh"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        zIndex={1}
      />
      <Box
        textAlign="center"
        maxW="280px"
        position="relative"
        zIndex={2}
        color="white"
        m="auto"
      >
        <Text fontSize="3xl" fontWeight="bold" mb={2}>
          ¡Bienvenido a Algora!
        </Text>
        <Text fontSize="md">
          Sistema de gestión para ópticas. Administra tus sucursales, productos
          y servicios desde un solo lugar.
        </Text>
      </Box>
    </Box>

    {/* Panel derecho (responsive incluido) */}
    <Box
      className="login-right"
      flex="1"
      bg={{ base: "gray.50", md: "white" }}
      display="flex"
      flexDir="column"
      minH="100vh"
      w="100%"
    >
      {/* Barra superior SOLO EN MOBILE */}
      <Box
        display={{ base: "flex", md: "none" }}
        w="100%"
        h="200px"
        bgGradient="linear(to-r, #76b5c5, rgb(62, 112, 124))"
        alignItems="center"
        justifyContent="center"
        boxShadow="md"
        flexShrink={0}
        borderBottomRadius="3xl"
      >
        <Text color="white" fontSize="xl" fontWeight="bold">
          ALGORA
        </Text>
      </Box>

      {/* Contenedor del formulario que ocupa el resto del espacio */}
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
       
      >
        {/* Formulario */}
        <Box
          p={8}
          borderRadius="lg"
          color="black"
        >
          {/*<Text
            fontSize="2xl" 
            fontWeight="bold"
            mb={20}
            textAlign="center"
            color="gray.400"
          >
            Iniciar Sesión
          </Text>
          */}
          {errorMessage && (
            <Text color="red.500" mb={4} textAlign="center" fontSize="sm">
              {errorMessage}
            </Text>
          )}

          <form onSubmit={handleSubmit}>
            <FormControl id="email" isRequired mb={4}>
              <FormLabel color="gray.500">Usuario</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaEnvelope} color="gray.400" />
                </InputLeftElement>
                <Input
                  variant="flushed"
                  type="email"
                  name="email"
                  placeholder="tú@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  color="black"
                  _placeholder={{ color: "gray.400" }}
                />
              </InputGroup>
            </FormControl>

            <FormControl id="password" isRequired mb={6}>
              <FormLabel color="gray.500">Contraseña</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaLock} color="gray.400" />
                </InputLeftElement>
                <Input
                  variant="flushed"
                  type="password"
                  name="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                  color="black"
                  _placeholder={{ color: "gray.400" }}
                />
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              bgGradient="linear(to-r, #76b5c5,rgb(62, 112, 124))"
              color="white"
              w="100%"
              mt={10}
              borderRadius="full"
              _hover={{ bgGradient: "linear(to-r, #76b5c5, #50bcd8)" }}
              isLoading={loading}
              loadingText="Ingresando..."
            >
              Ingresar
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  </Flex>
);
};

export default LoginForm;
