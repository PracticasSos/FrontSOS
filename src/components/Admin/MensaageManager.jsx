import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Heading,
  useToast,
  Spinner,
  Flex,
  IconButton,
  Text,
   useColorModeValue 
} from "@chakra-ui/react";
import { supabase } from "../../api/supabase";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const MessageManager = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [tenantId, setTenantId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
    getTenantId(); 
  }, []);

  const getTenantId = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      const tid = user?.user_metadata?.tenant_id;
      if (!tid) throw new Error("El usuario no tiene tenant_id.");
      setTenantId(tid);
    } catch (error) {
      toast({ title: "Error al obtener tenant_id", description: error.message, status: "error" });
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("messages").select("id, content");
    if (error) {
      toast({ title: "Error al obtener mensajes", status: "error" });
    } else {
      setMessages(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from("messages")
        .update({ content: newMessage })
        .eq("id", editingId);

      if (error) {
        toast({ title: "Error al actualizar", status: "error" });
      } else {
        toast({ title: "Mensaje actualizado", status: "success" });
        setEditingId(null);
      }
    } else {
      // ✅ Insertamos también el tenant_id
      const { error } = await supabase
        .from("messages")
        .insert({ content: newMessage, tenant_id: tenantId });

      if (error) {
        toast({ title: "Error al guardar", description: error.message, status: "error" });
      } else {
        toast({ title: "Mensaje guardado", status: "success" });
      }
    }

    setNewMessage("");
    fetchMessages();
    setLoading(false);
  };

  const handleEdit = (message) => {
    setNewMessage(message.content);
    setEditingId(message.id);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) {
      toast({ title: "Error al eliminar", status: "error" });
    } else {
      toast({ title: "Mensaje eliminado", status: "success" });
      fetchMessages();
    }
    setLoading(false);
  };

  const handleNavigate = (route = null) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (route) {
            navigate(route);
            return;
        }
        if (!user || !user.role_id) {
            navigate('/LoginForm');
            return;
        }
        switch (user.role_id) {
            case 1:
                navigate('/Admin');
                break;
            case 2:
                navigate('/Optometra');
                break;
            case 3:
                navigate('/Vendedor');
                break;
            case 4:
                navigate('/SuperAdmin');
                break;
            default:
                navigate('/');
        }
    };

    const boxBg = useColorModeValue('gray.100', 'gray.700');
        const textColor = useColorModeValue('gray.800', 'white');
        const borderColor = useColorModeValue('gray.200', 'gray.600');
        const selectBg = useColorModeValue('white', 'gray.600');

  return (
    <Box p={6} maxW="800px" mx="auto">
      <Heading size="lg" mb={4} textAlign="center">Gestión de Mensajes</Heading>
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
        <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
        <Button onClick={() => handleNavigate('/Login')} colorScheme="red">Cerrar Sesión</Button>
      </Box>
      <VStack spacing={4} align="stretch">
        <Textarea
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={5}
        />
        <Button colorScheme="teal" onClick={handleSave} isLoading={loading} alignSelf="flex-end">
          {editingId ? "Actualizar Mensaje" : "Guardar Mensaje"}
        </Button>

        <Heading size="md" mt={6}>Mensajes Guardados</Heading>
        {loading && <Spinner />}
        {!loading && messages.length === 0 && <Text>No hay mensajes guardados.</Text>}
        {!loading && messages.map((msg) => (
          <Flex key={msg.id} p={4} boxShadow="md" borderRadius="md" justify="space-between" align="center" bg={selectBg} borderColor={borderColor} color={textColor} _hover={{
            borderColor: useColorModeValue('gray.300', 'gray.500')
          }}
          _focus={{
            borderColor: useColorModeValue('blue.500', 'blue.300'),
            boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
          }}
          >
            <Text whiteSpace="pre-wrap">{msg.content}</Text>
            <Box>
              <IconButton icon={<EditIcon />} size="sm" mr={2} onClick={() => handleEdit(msg)} />
              <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => handleDelete(msg.id)} />
            </Box>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default MessageManager;
