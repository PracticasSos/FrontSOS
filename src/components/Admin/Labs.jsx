import { Box, Button, FormControl, FormLabel, Input, Heading, SimpleGrid, useColorModeValue, Text, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../api/supabase.js";
import { FaEye } from 'react-icons/fa';
import SmartHeader from "../header/SmartHeader.jsx";

const Lab = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        cell: '',
        email: '',
        ruc: ''
    });

    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.address || !formData.cell || !formData.email || !formData.ruc) {
            setMessage({ type: 'error', text: 'Todos los campos son obligatorios' });
            return;
        }
    
        const { data, error } = await supabase.from('labs').insert([formData]);
    
        if (error) {
            setMessage({ type: 'error', text: `Error al registrar el laboratorio: ${error.message}` });
            console.error('Error al registrar el laboratorio:', error.message);
        } else {
            setMessage({ type: 'success', text: 'Laboratorio registrado con éxito' });
            setFormData({
                name: '',
                address: '',
                cell: '',
                email: '',
                ruc: ''
            });
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
    onClick={() => handleNavigate('/list-labs')} 
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
        Listar Laboratorios
      </Text>
    </HStack>
  </Button>
  );

    return (
        <Box className="signup-form" display="flex" flexDirection="column" justifyContent="center" alignItems="center" pt={6} >
            <Heading  textAlign="center" mb={4} >
                Laboratorio
            </Heading>
            <SmartHeader moduleSpecificButton={moduleSpecificButton} />
            <Box width="100%" maxWidth="900px" borderRadius="8px" boxShadow="md" padding="20px">
                {message && (
                    <Box 
                        bgColor={message.type === 'success' ? "green.200" : "red.200"} 
                        color={message.type === 'success' ? "green.800" : "red.800"} 
                        p={2} 
                        mb={4} 
                        borderRadius="md"
                        textAlign="center"
                    >
                        {message.text}
                    </Box>
                )}
                <form onSubmit={handleSubmit}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl id="name" isRequired>
                            <FormLabel >Nombre</FormLabel>
                            <Input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>

                        <FormControl id="address" isRequired>
                            <FormLabel >Dirección</FormLabel>
                            <Input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>

                        <FormControl id="email" isRequired>
                            <FormLabel >Correo</FormLabel>
                            <Input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>

                        <FormControl id="cell" isRequired>
                            <FormLabel >Teléfono</FormLabel>
                            <Input 
                                type="text" 
                                name="cell" 
                                value={formData.cell} 
                                onChange={handleChange} 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>

                        <FormControl id="ruc" isRequired>
                            <FormLabel >RUC</FormLabel>
                            <Input 
                                type="text" 
                                name="ruc" 
                                value={formData.ruc} 
                                onChange={handleChange} 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>
                    </SimpleGrid>

                    <Box display="flex" justifyContent="center" mt={4}>
                    <Button 
                        type="submit" 
                        mt={6} 
                        width="40%" 
                        bg={useColorModeValue("teal.500", "teal.600")}
                        color="white"
                        _hover={{ 
                            bg: useColorModeValue("teal.600", "teal.500")
                        }}
                        borderRadius="8px"
                    >
                        Registrar
                    </Button>
                    </Box>
                </form>
            </Box>
        </Box>
    );
};

export default Lab;
