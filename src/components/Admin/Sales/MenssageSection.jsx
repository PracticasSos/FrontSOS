import { Box, FormControl, FormLabel, Textarea, useColorModeValue } from "@chakra-ui/react";
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

    const boxBg = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const selectBg = useColorModeValue('white', 'gray.600');

  return (
    <Box bg={boxBg}  borderRadius="md" p={4} mb={4} maxW="530px" mx="auto" >
      <FormControl>
        <Textarea
         borderRadius="md"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setFormData((prev) => ({ ...prev, message: e.target.value }));
          }}
          minHeight="100px"
          resize="vertical"
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
    </Box>
  );
};

export default MessageSection;
