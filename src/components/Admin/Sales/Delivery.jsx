import { FormControl, FormLabel, Input, Box, Text, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";

const Delivery = ({ saleData, setSaleData }) => {
  const [deliveryDays, setDeliveryDays] = useState(null);
  const [selectedDateText, setSelectedDateText] = useState("");

  const handleDateChange = (e) => {
    const selectedDateTime = new Date(e.target.value);
    const now = new Date();

    const diffInMs = selectedDateTime - now;
    const diffInDaysRaw = diffInMs / (1000 * 60 * 60 * 24);
    const diffInDays = diffInDaysRaw > 0 ? Math.round(diffInDaysRaw) : 0;

    setDeliveryDays(diffInDays);

    const formatted = selectedDateTime.toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setSelectedDateText(formatted);

    setSaleData((prev) => ({
      ...prev,
      delivery_time: diffInDays,
      delivery_datetime: selectedDateTime.toISOString(),
    }));
  };

  // Colores adaptativos
  const boxBg = useColorModeValue('gray.100', 'gray.700');
  const boxColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectBg = useColorModeValue('white', 'gray.600');

  return (
    <Box 
      bg={boxBg} 
      p={6} 
      borderRadius="xl" 
      color={boxColor} 
      mx="auto" 
      maxW="700px" 
      textAlign="center"
    >
      <FormControl w="100%" maxW="500px" mx="auto">
        <FormLabel fontSize="md" color={labelColor}>
          Fecha y hora
        </FormLabel>
        <Input
          type="datetime-local"
          name="delivery_date"
          onChange={handleDateChange}
          focusBorderColor="teal.500"
          borderRadius="full"
          height="50px"
          pl={4}
          pr={4}
          bg={selectBg}
          borderColor={borderColor}
          color={textColor}
          _hover={{
            borderColor: useColorModeValue('gray.300', 'gray.500')
          }}
          _focus={{
            borderColor: useColorModeValue('blue.500', 'blue.300'),
            boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
          }}
        />
      </FormControl>

      <Box mt={4}>
        {deliveryDays !== null ? (
          <>
            <Text fontSize="md" fontWeight="medium" color={textColor}>
              📅 Entrega en {deliveryDays} día{deliveryDays !== 1 ? "s" : ""}
            </Text>
            <Text fontSize="sm" color={secondaryTextColor} mt={1}>
              📌 Fecha seleccionada: {selectedDateText}
            </Text>
          </>
        ) : (
          <Text fontSize="sm" color={secondaryTextColor}>
            Seleccione una fecha y hora para ver el tiempo de entrega
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default Delivery;