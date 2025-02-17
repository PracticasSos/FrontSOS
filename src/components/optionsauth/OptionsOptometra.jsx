//import React from 'react';
import { Box, SimpleGrid, Text, Icon } from '@chakra-ui/react';
import { FaClipboard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const options = [
  { label: "REGISTRAR PACIENTE" },
  {label: "REGISTAR CIERRE"}, 
  { label: "HISTORIAL PACIENTE" }
];

const OptometraDashBoard = () => {
  const navigate = useNavigate();

  const handleOptionClick = (label) => {
    if (label === "REGISTRAR PACIENTE") {
      navigate('/RegisterPatient');
    }
    // añadir más condiciones para otras opciones si es necesario
    if (label === "HISTORIAL PACIENTE") {
      navigate('');
    }

    if(label === "Consultar Cierra") {
      navigate('/CashClousure')
    }
  };

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
          onClick={() => handleOptionClick(option.label)}
        >
          <Icon as={FaClipboard} boxSize={10} mb={3} />
          <Text>{option.label}</Text>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default OptometraDashBoard;