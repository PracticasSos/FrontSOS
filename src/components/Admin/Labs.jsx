import { Box, Button, FormControl, FormLabel, Input, Heading, SimpleGrid } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../api/supabase.js";

const Lab = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        cell: '',
        email: '',
        ruc: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleNavigate = (route) => {
        navigate(route);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from('labs')
            .insert([formData]);

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('User registered:', data);
        }
    };

    return (
        <Box className="signup-form" display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" bgColor="#f0f0f0">
            <Box width="100%" maxWidth="900px" bgColor="#ffffff" borderRadius="8px" boxShadow="md" padding="20px">
                <Heading as="h2" size="lg" textAlign="center" mb={4} color="#000000">
                    Registrar Laboratorio
                </Heading>

                <Box display="flex" justifyContent="space-between" mb={4}>
                    <Button 
                        onClick={() => handleNavigate('/ListLabs')} 
                        bgColor="#00A8C8" 
                        color="white" 
                        _hover={{ bgColor: "#008B94" }}
                    >
                        Listar Inventario
                    </Button>
                    <Button 
                        onClick={() => handleNavigate('/Admin')} 
                        bgColor="#00A8C8" 
                        color="white" 
                        _hover={{ bgColor: "#008B94" }}
                    >
                        Volver a Opciones
                    </Button>
                    <Button 
                        onClick={() => handleNavigate('/LoginForm')} 
                        bgColor="#00A8C8" 
                        color="white" 
                        _hover={{ bgColor: "#008B94" }}
                    >
                        Cerrar Sesión
                    </Button>
                </Box>

                <form onSubmit={handleSubmit}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl id="name" isRequired>
                            <FormLabel color="#000000">Nombre</FormLabel>
                            <Input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                borderColor="#00A8C8" 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>

                        <FormControl id="address" isRequired>
                            <FormLabel color="#000000">Dirección</FormLabel>
                            <Input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                borderColor="#00A8C8" 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>

                        <FormControl id="email" isRequired>
                            <FormLabel color="#000000">Correo</FormLabel>
                            <Input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                borderColor="#00A8C8" 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>

                        <FormControl id="cell" isRequired>
                            <FormLabel color="#000000">Teléfono</FormLabel>
                            <Input 
                                type="text" 
                                name="cell" 
                                value={formData.cell} 
                                onChange={handleChange} 
                                borderColor="#00A8C8" 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>

                        <FormControl id="ruc" isRequired>
                            <FormLabel color="#000000">RUC</FormLabel>
                            <Input 
                                type="text" 
                                name="ruc" 
                                value={formData.ruc} 
                                onChange={handleChange} 
                                borderColor="#00A8C8" 
                                _focus={{ borderColor: "#008B94" }}
                            />
                        </FormControl>
                    </SimpleGrid>

                    <Button 
                        type="submit" 
                        mt={6} 
                        width="100%" 
                        bgColor="#00A8C8" 
                        color="white" 
                        _hover={{ bgColor: "#008B94" }}
                    >
                        Registrar
                    </Button>
                </form>
            </Box>
        </Box>
    );
};

export default Lab;
