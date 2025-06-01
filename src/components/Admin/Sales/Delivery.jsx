import { FormControl, FormLabel, Input, Box, Text } from "@chakra-ui/react";
import { useState } from "react";

const Delivery = ({ saleData, setSaleData }) => {
  const [deliveryDays, setDeliveryDays] = useState(null);
  const [selectedDateText, setSelectedDateText] = useState("");

  const handleDateChange = (e) => {
    const selectedDateTime = new Date(e.target.value); // fecha y hora del input
    const now = new Date();

    const diffInMs = selectedDateTime - now;
    const diffInDaysRaw = diffInMs / (1000 * 60 * 60 * 24);
    const diffInDays = diffInDaysRaw > 0 ? Math.round(diffInDaysRaw) : 0;

    setDeliveryDays(diffInDays);

    // Guardar el texto formateado (en el idioma local)
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
    <>
      <FormControl>
        <FormLabel fontSize="lg" fontWeight="bold" color="teal.600">
          Entrega (Fecha y hora)
        </FormLabel>
        <Input
          type="datetime-local"
          name="delivery_date"
          onChange={handleDateChange}
          borderColor="teal.400"
          focusBorderColor="teal.600"
          borderRadius="md"
          p={2}
        />
      </FormControl>

      <Box
        mt={4}
        p={3}
        borderWidth="1px"
        borderRadius="md"
        borderColor="gray.300"
        bg="gray.50"
        textAlign="center"
      >
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
          <Text fontSize="md" fontWeight="medium" color="gray.700">
            Seleccione una fecha y hora para ver el tiempo de entrega
          </Text>
        )}
      </Box>
    </>
  );
};

export default Delivery;
