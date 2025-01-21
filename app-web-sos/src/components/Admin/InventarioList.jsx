import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase.js";
import { Box, Button, Heading, Input, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

const InvetarioList = () => {
    const [inventoryList, setInventoryList] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const handleNavigate = (route) => {
        navigate(route);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        const { data, error } = await supabase
            .from('inventario')
            .select('id, quantity, brand, reference, color, size, bridge, rod, c_unit, status');

        if (error) {
            console.error('Error fetching inventory:', error);
        } else {
            console.log(data);
            setInventoryList(data);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    return (
        <Box>
            <Heading as="h2" size="lg" mb={4}>Lista de Inventario</Heading>
            <Button onClick={() => handleNavigate('/Register')} mt={4} mr={2}>
                Registrar Inventario
            </Button>
            <Button onClick={() => handleNavigate('/Admin')} mt={4}>
                Volver a Opciones
            </Button>
            <Input
                placeholder="Buscar por marca, referencia o color"
                value={search}
                onChange={handleSearchChange}
                mb={4}
            />
            <Box overflowX="auto">
                <Table variant="simple" minWidth="800px">
                    <Thead>
                        <Tr>
                            <Th>Cantidad</Th>
                            <Th>Marca</Th>
                            <Th>Referencia</Th>
                            <Th>Color</Th>
                            <Th>Tamaño</Th>
                            <Th>Puente</Th>
                            <Th>Varilla</Th>
                            <Th>C. Unit</Th>
                            <Th>Estado</Th>
                            <Td>Tipo de moviemiento</Td>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {inventoryList.map(item => (
                            <Tr key={item.id}>
                                <Td>{item.quantity}</Td>
                                <Td>{item.brand}</Td>
                                <Td>{item.reference}</Td>
                                <Td>{item.color}</Td>
                                <Td>{item.size}</Td>
                                <Td>{item.bridge}</Td>
                                <Td>{item.rod}</Td>
                                <Td>{item.c_unit}</Td>
                                <Td>{item.status}</Td>
                                <Td>{item.movement_type}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};

export default InvetarioList;
