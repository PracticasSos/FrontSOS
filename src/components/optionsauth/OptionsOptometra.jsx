import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Text, Image, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import registrarPacienteIcon from "../../assets/registrarPaciente.svg";
import historialMedidasIcon from "../../assets/historialMedidas.svg";
import medidasIcon from "../../assets/medidas.svg"
import historiaClinicaIcon from "../../assets/historiaClinica.svg"

const options = [
  { label: "REGISTRAR PACIENTE", icon: registrarPacienteIcon },
  { label: "HISTORIAL PACIENTE", icon:  historiaClinicaIcon },  
  { label: "REGISTRAR MEDIDAS", icon: medidasIcon },
  { label: "HISTORIAL DE MEDIDAS", icon: historialMedidasIcon }
];

const OptometraDashBoard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        console.error('Error al obtener la sesión:', error);
        navigate('/Login');
      } else {
        setUser(session.user);
        localStorage.setItem('user', JSON.stringify(session.user));
      }
      setLoading(false);
    };

    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    if (userFromStorage) {
      setUser(userFromStorage);
      setLoading(false);
    } else {
      checkSession();
    }
  }, [navigate]);

  if (loading || !user) {
    return null; 
  }

  const handleOptionClick = (label) => {
    switch (label) {
      case "REGISTRAR PACIENTE":
        navigate('/RegisterPatient');
        break;
      case "HISTORIAL PACIENTE":
        navigate('/PatientHistory');
        break;
      case "HISTORIAL DE MEDIDAS":
        navigate('/HistoryMeasureList')
        break;
      case "REGISTRAR MEDIDAS":
        navigate('/MeasuresFinal');
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