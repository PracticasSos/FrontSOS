import {Box, Button, FormControl, FormLabel, Input} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {supabase} from "../../api/supabase.js";

const Lab = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        cell: '',
        email:'',
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
        <Box className="signup-form" display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
            <Box width="100%" maxWidth="400px">
                <Box width="100%" border="solid 1px black" display="flex" justifyContent="space-around" paddingBottom="15px">
                    <Button onClick={() => handleNavigate('/ListLabs')} mt={4}>
                        Listar Inventario
                    </Button>
                    <Button onClick={() => handleNavigate('/Admin')} mt={4}>
                        Volver a Opciones
                    </Button>
                    <Button onClick={() => handleNavigate('/LoginForm')} mt={4}>
                        Cerrar Sesión
                    </Button>
                </Box>
            </Box>
            <Box>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Nombre</FormLabel>
                    <Input type="text" name="name" value={formData.name} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Dirección</FormLabel>
                    <Input type="text" name="address" value={formData.address} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Correo</FormLabel>
                    <Input type="text" name="address" value={formData.correo} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Teléfono</FormLabel>
                    <Input type="text" name="cell" value={formData.cell} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Ruc</FormLabel>
                    <Input type="text" name="ruc" value={formData.ruc} onChange={handleChange} />
                </FormControl>
                <Button type="submit" mt={4} width="100%" onClick={handleSubmit}>Registrar</Button>
            </Box>
        </Box>

    )

}

export default Lab;