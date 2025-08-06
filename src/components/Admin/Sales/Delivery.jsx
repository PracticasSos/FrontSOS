import { FormControl, FormLabel, Input, Box, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { useState } from "react";

const Delivery = ({ saleData, setSaleData }) => {
  const [deliveryDays, setDeliveryDays] = useState(null);
  const [selectedDateText, setSelectedDateText] = useState("");
  const [miniDateTime, setMinDateTime] = useState("");
  const toast = useToast();

  useEffect(() => {
    const now = new Date();
    // Ajustar a zona horaria local
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const formatted = localNow.toISOString().slice(0, 16);
    setMinDateTime(formatted);
  }, []);

  const handleDateChange = (e) => {
    if (!e.target.value) {
      setDeliveryDays(null);
      setSelectedDateText("");
      setSaleData((prev) => ({
        ...prev,
        delivery_time: null,
        delivery_datetime: null,
      }));
      return;
    }

    // Crear fecha desde el input (ya está en zona horaria local)
    const selectedDateTime = new Date(e.target.value);
    const now = new Date();

    // Verificar si es fecha pasada
    if (selectedDateTime < now) {
      toast({
        title: "Fecha inválida",
        description: "No se puede seleccionar una fecha anterior a la actual.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      e.target.value = "";
      setDeliveryDays(null);
      setSelectedDateText("");
      setSaleData((prev) => ({
        ...prev,
        delivery_time: null,
        delivery_datetime: null,
      }));
      return;
    }

    // Calcular diferencia en días (más preciso)
    const diffInMs = selectedDateTime.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = Math.ceil(diffInHours / 24); // Redondear hacia arriba

    setDeliveryDays(diffInDays);

    // Formatear fecha para mostrar
    const formatted = selectedDateTime.toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false // Formato 24h
    });

    setSelectedDateText(formatted);

    // Guardar en saleData con la fecha exacta seleccionada
    setSaleData((prev) => ({
      ...prev,
      delivery_time: `${diffInDays} día${diffInDays !== 1 ? "s" : ""}`,
      delivery_datetime: selectedDateTime.toISOString(),
      delivery_formatted: formatted
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
          Fecha y hora de entrega
        </FormLabel>
        <Input
          type="datetime-local"
          name="delivery_date"
          min={miniDateTime}
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