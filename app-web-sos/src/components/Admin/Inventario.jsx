import {Form, useNavigate} from "react-router-dom";
import {Box, Button, FormControl, FormLabel, Input} from "@chakra-ui/react";
import {useState} from "react";
import {supabase} from "../../api/supabase.js";

const Inventario = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        brand: '',
        reference: '',
        size:0,
        bridge: 0,
        rod: 0,
        color: '',
        quantity: 0,
        price: 0
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
            .from('inventario')
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
                    <Box width="100%" display="flex" justifyContent="space-around" paddingBottom="15px">
                        <Button onClick={() => handleNavigate('/ListInventory')} mt={4}>
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
                    <FormControl id="text" isRequired mt={4}>
                        <FormLabel>Marca</FormLabel>
                        <Input type= "text" name="brand" value={formData.brand} onChange={handleChange} />
                    </FormControl>
                    <FormControl id="text" isRequired mt={4}>
                        <FormLabel>Referencia</FormLabel>
                        <Input type="text" name="reference" value={formData.reference} onChange={handleChange}/>
                    </FormControl>
                    <FormControl id="number" isRequired mt={4}>
                        <FormLabel>Tamaño</FormLabel>
                            <Input type="number" name="size" value={formData.size} onChange={handleChange}/>
                    </FormControl>
                    <FormControl id="age" isRequired mt={4}>
                        <FormLabel>Puente</FormLabel>
                        <Input type="number" name="bridge" value={formData.bridge} onChange={handleChange} />
                    </FormControl>
                    <FormControl id="number" isRequired mt={4}>
                        <FormLabel>Varilla</FormLabel>
                        <Input type="number" name="rod" value={formData.rod} onChange={handleChange}/>
                    </FormControl>
                    <FormControl id="text" isRequired mt={4}>
                        <FormLabel>Color</FormLabel>
                        <Input type="text" name="color" value={formData.color} onChange={handleChange}/>
                    </FormControl>
                    <FormControl id="number" isRequired mt={4}>
                        <FormLabel>Cantidad</FormLabel>
                        <Input type="number" name="cantidad" value={formData.quantity}/>
                    </FormControl>
                    <FormControl id="age" isRequired mt={4}>
                        <FormLabel>Precio</FormLabel>
                        <Input type="number" name="price" value={formData.price} onChange={handleChange} />
                    </FormControl>
                    <Button type="submit" mt={4} width="100%" onClick={handleSubmit}>Registrar</Button>
                </Box>
            </Box>

    )
}

export default Inventario