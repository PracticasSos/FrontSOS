import React from 'react';
import { Box, SimpleGrid, Text, Icon } from '@chakra-ui/react';
import { FaClipboard } from 'react-icons/fa';

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

const AdminDashboard = () => {
  return (
    <SimpleGrid columns={[2, null, 4]} spacing={5}>
      {options.map((option, index) => (
        <Box
          key={index}
          textAlign="center"
          p={5}
          boxShadow="md"
          borderRadius="md"
          _hover={{ bg: "gray.100", cursor: "pointer" }}
        >
          <Icon as={FaClipboard} boxSize={10} mb={3} />
          <Text>{option.label}</Text>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default AdminDashboard;
