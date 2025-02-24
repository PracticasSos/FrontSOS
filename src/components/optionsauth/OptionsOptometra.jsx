import React from 'react';
import { Box, SimpleGrid, Text, Image, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import registrarPacienteIcon from "../../assets/registrarPacientes.svg";
import medidasIcon from "../../assets/medidas.svg"
import historiaClinicaIcon from "../../assets/historiaClinica.svg"

const options = [
  { label: "REGISTRAR PACIENTE", icon: registrarPacienteIcon },
  { label: "HISTORIAL PACIENTE", icon:  historiaClinicaIcon },  
  { label: "REGISTRAR MEDIDAS", icon: medidasIcon }
];

const OptometraDashBoard = () => {
  const navigate = useNavigate();

  const handleOptionClick = (label) => {
    switch (label) {
      case "REGISTRAR PACIENTE":
        navigate('/RegisterPatient');
        break;
      case "HISTORIAL PACIENTE":
        navigate('/PatientHistory');
        break;
      case "REGISTRAR MEDIDAS":
        navigate('/RegisterMeasures');
        break;
      default:
        break;
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
              <Image
                src={option.icon}
                alt={option.label}
                boxSize="40px"
                mb={3}
                mx="auto"
              />
              <Text>{option.label}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </>
    );
};

export default OptometraDashBoard;