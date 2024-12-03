import { Box, Button, FormControl, FormLabel, Input, Select } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../api/supabase.js";


const CashClousure = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        branch: '',
        since: '',
        till: '',
        month: '',
        date: '',
        responsible: '',
        cash_value: 0,
        transferred_value: 0,
        data_value: 0,
        cash: 0,
        transfer: 0,
        data_fast: 0,
        total: 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name.includes('_value') || name.includes('cash') || name === 'total' ? Number(value) : value,
        });
    };
    
    

    const handleNavigate = (route) => {
        navigate(route);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

            if (!formData.branch || !formData.since || !formData.till || !formData.responsible) {
                alert("Por favor, completa todos los campos obligatorios.");
                return;
        }
        console.log("Datos a enviar:", formData);
        
            const { data, error } = await supabase
                .from('cash_clousure')
                .insert([formData]);
    
            if (error) {
                console.error('Error:', error.message);
                alert("Ocurrió un error al registrar el cierre de caja. Por favor, inténtalo nuevamente.");
            } else {
                console.log('Cierre de caja registrado:', data);
                alert("¡Cierre de caja registrado con éxito!");
            }
    };

    return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding={4} minHeight="100vh">
            <Box width="100%" maxWidth="800px">
                <Box display="flex" justifyContent="space-between" borderBottom="1px solid black" paddingBottom={2} marginBottom={4}>
                    <Button onClick={() => handleNavigate('/CashClousure')}>Consultar Cierre</Button>
                    <Button onClick={() => handleNavigate('/Admin')}>Volver a Opciones</Button>
                    <Button onClick={() => handleNavigate('/LoginForm')}>Cerrar Sesión</Button>
                </Box>

                <Box as="form" onSubmit={handleSubmit}>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4} marginBottom={4}>
                        <FormControl isRequired>
                            <FormLabel>Óptica</FormLabel>
                            <Select name="branch" value={formData.branch} onChange={handleChange}>
                                <option value="VEOPTICS">VEOPTICS</option>
                                <option value="SOS">SOS</option>
                            </Select>
                        </FormControl>

                        <FormControl id="month" isRequired mt={4}>
                            <FormLabel>Mes</FormLabel>
                            <Select name="month" value={formData.month} onChange={handleChange}>
                                <option value="Diciembre">Diciembre</option>
                                <option value="Enero">Enero</option>
                                <option value="Febrero">Febrero</option>
                                <option value="Marzo">Marzo</option>
                                <option value="Marzo">Abril</option>
                                <option value="Marzo">Mayo</option>
                                <option value="Marzo">Junio</option>
                                <option value="Marzo">Julio</option>
                                <option value="Marzo">Agosto</option>
                                <option value="Marzo">Septiembre</option>
                                <option value="Marzo">Octubre</option>
                                <option value="Marzo">Noviembre</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Desde</FormLabel>
                            <Input type="date" name="since" value={formData.since} onChange={handleChange} />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Hasta</FormLabel>
                            <Input type="date" name="till" value={formData.till} onChange={handleChange} />
                        </FormControl>
                    </Box>

                    <Box display="grid" gridTemplateColumns= "repeat(5, 1fr)" gap={8} marginBottom={8}>
                        <FormControl>
                            <FormLabel>Fecha</FormLabel>
                            <Input type="date" name="date" value={formData.date} onChange={handleChange}/>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Encargado</FormLabel>
                            <Select name="responsible" value={formData.responsible} onChange={handleChange}>
                                <option value="Tefa">Tefa</option>
                                <option value="Andrés">Andrés</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>VALOR EFECT</FormLabel>
                            <Input type="number" name="cash_value" value={formData.cash_value} onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>VALOR TRANS</FormLabel>
                            <Input type="number" name="transferred_value" value={formData.transferred_value} onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>VALOR DATA</FormLabel>
                            <Input type="number" name="data_value" value={formData.data_value} onChange={handleChange} />
                        </FormControl>

                    </Box>

                    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4} marginBottom={4}>
                        <FormControl>
                            <FormLabel>EFEC</FormLabel>
                            <Input type="number" name="cash" value={formData.cash} onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>TRANS</FormLabel>
                            <Input type="number" name="transfer" value={formData.transfer} onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>DATAFAST</FormLabel>
                            <Input type="number" name="data_fast" value={formData.data_fast} onChange={handleChange} />
                        </FormControl>

                    </Box>

                        <FormControl isRequired mt={7}>
                            <FormLabel>Total</FormLabel>
                            <Input type="number" name="total" value={formData.total} onChange={handleChange} />
                        </FormControl>

                    <Button type="submit" colorScheme="blue" width="100%" mt={5}>Registrar Cierre</Button>
                
                </Box>
            </Box>
        </Box>
    );
};

export default CashClousure;
