import { useEffect, useState } from "react";
import { Box, Heading, Input, Button, Table, Thead, Tbody, Tr, Th, Td, FormLabel, Text } from "@chakra-ui/react";
import { supabase } from "../../../api/supabase";
import { useNavigate } from "react-router-dom";

const MessageClients = () => {
  const [contacts, setContacts] = useState([]);
  const [messageTemplate, setMessageTemplate] = useState("Hola {name}, te tenemos una promoción especial.");
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase.from("contacts").select("id, name, phone");

      if (error) throw error;

      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      alert("Hubo un problema al cargar los contactos.");
    }
  };

  const handleSendWhatsApp = (contact) => {
    if (!contact.phone) {
      alert("Número de teléfono no disponible.");
      return;
    }

    const personalizedMessage = messageTemplate.replace("{name}", contact.name);
    const encodedMessage = encodeURIComponent(personalizedMessage);
    const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" p={6}>
      <Heading mb={4}>Enviar Mensajes a Clientes</Heading>

      <Box mb={6} width="100%" maxWidth="600px">
        <FormLabel>Mensaje para todos</FormLabel>
        <Input
          type="text"
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          placeholder="Ej: Hola {name}, tu pedido está listo para retiro."
        />
        <Text fontSize="sm" color="gray.500" mt={1}>
          Puedes usar <strong>{'{name}'}</strong> para insertar el nombre del cliente.
        </Text>
      </Box>

      <Table variant="simple" width="100%" maxWidth="800px">
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Teléfono</Th>
            <Th>Acción</Th>
          </Tr>
        </Thead>
        <Tbody>
          {contacts.map((contact) => (
            <Tr key={contact.id}>
              <Td>{contact.name}</Td>
              <Td>{contact.phone || "No disponible"}</Td>
              <Td>
                <Button
                  colorScheme="teal"
                  size="sm"
                  onClick={() => handleSendWhatsApp(contact)}
                  isDisabled={!contact.phone}
                >
                  Enviar WhatsApp
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Button mt={6} colorScheme="blue" onClick={() => navigate("/")}>
        Volver a Inicio
      </Button>
    </Box>
  );
};

export default MessageClients;
