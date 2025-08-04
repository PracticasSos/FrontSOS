import { useNavigate } from "react-router-dom";
import {Box, Button, FormControl, FormLabel, Input, Heading, VStack, useToast, Select, useColorModeValue, Text, HStack} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase.js";
import { FaEye } from 'react-icons/fa';
import SmartHeader from "../header/SmartHeader.jsx";

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
    onClick={() => handleNavigate('/ListInventory')} 
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
        Listar Inventario
      </Text>
    </HStack>
  </Button>
  );

  return (
    <Box
      className="signup-form"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        minHeight="100vh"
    >
      
        <Heading as="h2" size="lg" textAlign="center" mb={6}>
          Registro de Inventario
        </Heading>
        <SmartHeader moduleSpecificButton={moduleSpecificButton} />
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
  );
};
export default Inventario;

