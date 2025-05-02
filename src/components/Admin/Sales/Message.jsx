import { useEffect, useState } from "react";
import { Box, FormControl, FormLabel, Textarea, Checkbox, Text } from "@chakra-ui/react";

const MessageInput = ({ selectedBranch, formData, setFormData }) => {
    const baseMessage = `
    ¡Hola! 👋
    
    Muchas gracias por confiar en nosotros. Te adjuntamos el contrato de servicio de {{BRANCH}} con todos los detalles de tu pedido. Si tienes alguna pregunta, no dudes en contactarnos.
    
    ¡Estamos aquí para ayudarte! 😊
    `;
    
    const [message, setMessage] = useState(baseMessage.replace("{{BRANCH}}", selectedBranch || "VEOPTICS"));
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const updatedMessage = baseMessage.replace("{{BRANCH}}", selectedBranch || "VEOPTICS");
        setMessage(updatedMessage);
        setFormData((prev) => ({ ...prev, message: updatedMessage }));
    }, [selectedBranch]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" width={["90%", "80%", "400px"]} mx="auto">
            <FormControl>
                <FormLabel fontSize="lg" fontWeight="bold" color="teal.600">
                    Mensaje
                </FormLabel>
                <Textarea
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        setFormData((prev) => ({ ...prev, message: e.target.value }));
                    }}
                    height="150px"
                    minHeight="100px"
                    borderColor="teal.400"
                    focusBorderColor="teal.600"
                />
            </FormControl>
            <Checkbox mt={4} colorScheme="teal" isChecked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>
                <Text fontSize="sm">
                    ACEPTA LAS CONDICIONES DE NO DEVOLUCIÓN DE {selectedBranch || "VEOPTICS"}
                </Text>
            </Checkbox>
        </Box>
    );
};

export default MessageInput;
