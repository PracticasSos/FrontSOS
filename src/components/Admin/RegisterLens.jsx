import { useState } from "react";
import { supabase } from "../../api/supabase";
import { Box, Button, FormControl, FormLabel, Input, Heading, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";

const RegisterLens = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        lens_type: '',
        lens_price: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from('lens')
            .insert([formData]);

        if (error) {
            console.error('Error:', error.message);
            alert("Ocurrio un error:" + error.message);
        } else {
            console.log('Lens registered:', data);
            alert("Registado con exito")
        }
    };

    const handleReset = () => {
        setFormData({
            lens_type: '',
            lens_price: 0
        });
    };

    const renderInputField = (label, name, type, required) => {
        return (
            <FormControl isRequired={required}>
                <FormLabel htmlFor={name}>{label}</FormLabel>
                <Input
                    id={name}
                    name={name}
                    type={type}
                    value={formData[name]}
                    onChange={handleChange}
                />
            </FormControl>
        );
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
            default:
                navigate('/');
        }
    };

    return (
        <Box className="register-lens-form" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
            <Heading mb={4}>Registrar Lens</Heading>
            <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
                <Button onClick={() => handleNavigate('/ListPatients')} colorScheme="teal">Listar Pacientes</Button>
                <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
                <Button onClick={() => handleNavigate('/LoginForm')} colorScheme="red">Cerrar Sesión</Button>
            </Box>

            <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="800px" padding={6} boxShadow="lg" borderRadius="md">
                <SimpleGrid columns={[1, 2]} spacing={4}>
                    {renderInputField('Lunas', 'lens_type', 'text', true)}
                    {renderInputField('Precio', 'lens_price', 'number', true)}
                </SimpleGrid>
                <Box display="flex" justifyContent="space-around" mt={6}>
                    <Button type="submit" colorScheme="teal">Guardar</Button>
                    <Button onClick={handleReset} colorScheme="gray">Limpiar</Button>
                </Box>
            </Box>
        </Box>
    );
};

export default RegisterLens;
