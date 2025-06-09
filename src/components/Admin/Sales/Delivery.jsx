import { FormControl, FormLabel, Input, Box, Text } from "@chakra-ui/react";
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

  return (
    <Box bg="gray.100" p={6} borderRadius="xl" color="gray.700" mx="auto" maxW="700px" textAlign="center">
      <FormControl w="100%" maxW="500px" mx="auto">
        <FormLabel fontSize="md" color="gray.600">
          Fecha y hora
        </FormLabel>
        <Input
          type="datetime-local"
          name="delivery_date"
          onChange={handleDateChange}
          borderColor="gray.300"
          focusBorderColor="teal.500"
          borderRadius="full"
          height="50px"
          bg="white"
          pl={4}
          pr={4}
        />
      </FormControl>

      <Box mt={4}>
        {deliveryDays !== null ? (
          <>
            <Text fontSize="md" fontWeight="medium" color="gray.700">
              📅 Entrega en {deliveryDays} día{deliveryDays !== 1 ? "s" : ""}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              📌 Fecha seleccionada: {selectedDateText}
            </Text>
          </>
        ) : (
          <Text fontSize="sm" color="gray.600">
            Seleccione una fecha y hora para ver el tiempo de entrega
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default Delivery;
