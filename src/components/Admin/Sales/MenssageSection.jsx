import { Box, FormControl, FormLabel, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const MessageSection = ({ selectedBranch, formData, setFormData }) => {
  const baseMessage = `¡Hola! 👋  
Muchas gracias por confiar en nosotros. Te adjuntamos el contrato de servicio de {{BRANCH}} con todos los detalles de tu pedido. Si tienes alguna pregunta, no dudes en contactarnos.
¡Estamos aquí para ayudarte! 😊
  `;

  const [message, setMessage] = useState(
    baseMessage.replace("{{BRANCH}}", selectedBranch || "VEOPTICS")
  );

  useEffect(() => {
    const updatedMessage = baseMessage.replace("{{BRANCH}}", selectedBranch || "VEOPTICS");
    setMessage(updatedMessage);
    setFormData((prev) => ({
      ...prev,
      message: updatedMessage,
      observation: "",
      observation_img: ""
    }));
  }, [selectedBranch]);

  return (
    <Box bg="gray.100" borderRadius="md" p={4} mb={4}>
      <FormControl>
        <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
          Mensaje
        </FormLabel>
        <Textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setFormData((prev) => ({ ...prev, message: e.target.value }));
          }}
          minHeight="100px"
          resize="vertical"
          bg="white"
        />
      </FormControl>
    </Box>
  );
};

export default MessageSection;
