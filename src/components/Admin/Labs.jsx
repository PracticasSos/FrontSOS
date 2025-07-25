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

    return (
        <Box className="signup-form" display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" >
            <Box width="100%" maxWidth="900px" borderRadius="8px" boxShadow="md" padding="20px">
                <Heading as="h2" size="lg" textAlign="center" mb={4} >
                    Laboratorio
                </Heading>
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

                <Box display="flex" justifyContent="space-between" mb={4}>
                    <Button 
                        onClick={() => handleNavigate('/ListLabs')} 
                        bgColor="#00A8C8" 
                        color="white" 
                        _hover={{ bgColor: "#008B94" }}
                    >
                        Listar Laboratorios
                    </Button>
                    <Button 
                        onClick={() => handleNavigate()} 
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
                            <FormLabel >Nombre</FormLabel>
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
                            <FormLabel >Dirección</FormLabel>
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
                            <FormLabel >Correo</FormLabel>
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
                            <FormLabel >Teléfono</FormLabel>
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
                            <FormLabel >RUC</FormLabel>
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
