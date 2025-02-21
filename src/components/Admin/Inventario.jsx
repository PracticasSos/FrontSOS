import { useNavigate } from "react-router-dom";
import {Box, Button, FormControl, FormLabel, Input, Heading, VStack, HStack, useToast, Select} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase.js";

const Inventario = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    brand: "",
    quantity: 0,
    price: 0,
    branchs_id: "",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase.from("branchs").select("id, name");
      if (error) {
        console.error("Error fetching branches:", error);
      } else {
        setBranches(data);
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNavigate = (route) => {
    navigate(route);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from("inventario").insert([formData]);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el inventario.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error:", error);
    } else {
      toast({
        title: "Éxito",
        description: "Inventario registrado correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFormData({
        brand: "",
        quantity: 0,
        price: 0,
        branchs_id: "",
      });
    }
  };

  return (
    <Box
      bg="gray.50"
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={4}
    >
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        shadow="md"
        width="100%"
        maxWidth="500px"
      >
        <Heading as="h2" size="lg" textAlign="center" mb={6}>
          Registro de Inventario
        </Heading>
        <HStack justifyContent="space-between" mb={4}>
          <Button colorScheme="blue" onClick={() => handleNavigate("/ListInventory")}>
            Listar Inventario
          </Button>
          <Button colorScheme="gray" onClick={() => handleNavigate("/Admin")}>
            Opciones
          </Button>
          <Button colorScheme="red" onClick={() => handleNavigate("/LoginForm")}>
            Cerrar Sesión
          </Button>
        </HStack>
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel>Marca</FormLabel>
            <Input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Ingrese la marca"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Cantidad</FormLabel>
            <Input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Ingrese la cantidad"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Precio</FormLabel>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Ingrese el precio"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Sucursal</FormLabel>
            <Select
              name="branchs_id"
              value={formData.branchs_id}
              onChange={handleChange}
              placeholder="Seleccione una sucursal"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full">
            Registrar
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};
export default Inventario;

