import React from "react";
import { Button, Box, Heading} from "@chakra-ui/react";
import { useNavigate, Outlet  } from "react-router-dom";

const RegisterMeasures = () => {
  const navigate = useNavigate();

  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
      <Heading mb={4}>Registro de Medidas</Heading>
      <Box display="flex" gap={4}>
        <Button colorScheme="teal" onClick={() => handleNavigate("MeasuresUse")}>
          Medidas en Uso
        </Button>
        <Button colorScheme="blue" onClick={() => handleNavigate("MeasuresFinal")}>
          Medidas Finales
        </Button>
      </Box>
      <Box mt={8}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default RegisterMeasures;
