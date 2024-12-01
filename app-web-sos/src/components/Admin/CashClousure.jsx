import {Box, Button, FormControl, FormLabel, Input} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {supabase} from "../../api/supabase.js";

const CashClousure = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState ({
        branch: '',
        since: '',
        till: '',
        month:'',
        date:'',
        responsible:'',
        cash_value:0,
        transferred_value:0,
        data_value:0,
        cash:0,
        transfer:0,
        data_fast:0,
        total:0
    });
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value })
    };
    const handleNavigate = (route) => {
        navigate(route)
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase
            .form('cashClousure')
            .insert([formData]);

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Cash inventario registrado:', data);
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
                    <FormLabel>Optica</FormLabel>
                    <Input type="text" name="branch" value={formData.branch} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Desde</FormLabel>
                    <Input type="text" name="since" value={formData.since} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Hasta</FormLabel>
                    <Input type="text" name="till" value={formData.till} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Mes</FormLabel>
                    <Input type="text" name="month" value={formData.month} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Encargado</FormLabel>
                    <Input type="text" name="responsible" value={formData.responsible} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Valor EFECT</FormLabel>
                    <Input type="text" name="vash_value" value={formData.cash_value} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Valor TRANS</FormLabel>
                    <Input type="text" name="transferred_value" value={formData.transferred_value} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>Valor DATA</FormLabel>
                    <Input type="text" name="data_value" value={formData.data_value} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>EFECT</FormLabel>
                    <Input type="text" name="cash" value={formData.cash} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>TRANS</FormLabel>
                    <Input type="text" name="transfer" value={formData.transfer} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>DATAFAST</FormLabel>
                    <Input type="text" name="data_fast" value={formData.data_fast} onChange={handleChange} />
                </FormControl>
                <FormControl id="age" isRequired mt={4}>
                    <FormLabel>TOTAL</FormLabel>
                    <Input type="text" name="total" value={formData.total} onChange={handleChange} />
                </FormControl>
                <Button type="submit" mt={4} width="100%" onClick={handleSubmit}>Registrar</Button>
            </Box>
        </Box>

    ) 
}
export default CashClousure;