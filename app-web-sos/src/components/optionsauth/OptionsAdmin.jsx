//import React from 'react';
import { Button, Box, SimpleGrid, Text, Icon } from '@chakra-ui/react';
import { FaClipboard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const options = [
  { label: "REGISTRAR PACIENTE" },
  { label: "HISTORIAL PACIENTE" },
  { label: "ORDEN DE LABORATORIO" },
  { label: "ENVIOS" },
  { label: "VENTA/ CONTRATO DE SERVICIO" },
  { label: "RETIROS" },
  { label: "CIERRE" },
  { label: "SALDOS" },
  { label: "EGRESOS" },
  { label: "GARANTIA" },
  { label: "CONSUL GARANTIA" },
  { label: "INVENTARIO" },
  { label: "USUARIOS" },
  { label: "LABORATORIOS" },
  { label: "SUCURSAL" },
  { label: "CONSULTAR CIERRE" },
  { label: "IMPRIMIR CERTIFICADO" }
];

const AdminDashBoard = () => {
  const navigate = useNavigate();

  const handleOptionClick = (label) => {
    if (label === "USUARIOS") {
      navigate('/Register');
    }
    // añadir más condiciones para otras opciones si es necesario
    if (label === "REGISTRAR PACIENTE") {
      navigate('/RegisterPatient');
    }
  };

  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <>
    <Button onClick={() => handleNavigate('/Login')} mt={4}>
          Cerrar Sesión
        </Button>
      <SimpleGrid columns={[2, null, 4]} spacing={5}>
      {options.map((option, index) => (
        <Box
          key={index}
          textAlign="center"
          p={5}
          boxShadow="md"
          borderRadius="md"
          _hover={{ bg: "gray.100", cursor: "pointer" }}
          onClick={() => handleOptionClick(option.label)}
        >
          <Icon as={FaClipboard} boxSize={10} mb={3} />
          <Text>{option.label}</Text>
        </Box>
      ))}
    </SimpleGrid>
    </>
  );
};

export default AdminDashBoard;
