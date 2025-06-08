import { useEffect, useRef, useState } from "react";
import {
    Box,
    FormControl,
    FormLabel,
    Textarea,
    Button,
    Icon,
    Image,
    Spinner,
    HStack, Stack
} from "@chakra-ui/react";
import { supabase } from "../../../api/supabase";
import { FiCamera, FiUpload } from "react-icons/fi";
import TermsCondition from "./TermsCondition";

const MessageInput = ({ selectedBranch, formData, setFormData }) => {
    const cameraInputRef = useRef();
    const fileInputRef = useRef();

    const baseMessage = `¡Hola! 👋  
Muchas gracias por confiar en nosotros. Te adjuntamos el contrato de servicio de {{BRANCH}} con todos los detalles de tu pedido. Si tienes alguna pregunta, no dudes en contactarnos.
¡Estamos aquí para ayudarte! 😊
    `;

    const [message, setMessage] = useState(baseMessage.replace("{{BRANCH}}", selectedBranch || "VEOPTICS"));
    const [isChecked, setIsChecked] = useState(false);
    const [observation, setObservation] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState("");

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `observation/${fileName}`;

        const { error } = await supabase.storage.from("observation").upload(filePath, file);

        if (error) {
            console.error("Error al subir la imagen:", error.message);
        } else {
            const { data } = supabase.storage.from("observation").getPublicUrl(filePath);
            setUploadedUrl(data.publicUrl);
            setFormData((prev) => ({
                ...prev,
                observation_img: data.publicUrl
            }));
        }

        setUploading(false);
    };

    return (
  <Box
     p={4} mb={4} 
  >
    <Stack spacing={6} >
      {/* Campo Mensaje */}
      <Box bg="gray.100" borderRadius="md" p={4} mb={4} >
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
      {/* Campo Observación + Imagen */}
       <Box bg="gray.100" borderRadius="md" p={4} mb={4}>
      <FormControl>
        <FormLabel fontSize="lg" fontWeight="bold" color="gray.600">
          Observación
        </FormLabel>
        <Textarea
          value={observation}
          onChange={(e) => {
            setObservation(e.target.value);
            setFormData((prev) => ({ ...prev, observation: e.target.value }));
          }}
          minHeight="100px"
          resize="vertical"
          bg="white"
        />

        {/* Inputs ocultos */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          ref={cameraInputRef}
          onChange={handleFileChange}
        />
        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* Botones */}
        <HStack spacing={4} mt={3} flexWrap="wrap">
          <Button
            leftIcon={<Icon as={FiCamera} />}
            size="sm"
            color="gray.600"
            variant="outline"
            onClick={() => cameraInputRef.current.click()}
          >
            Tomar foto
          </Button>
          <Button
            leftIcon={<Icon as={FiUpload} />}
            size="sm"
            color="gray.600"
            variant="outline"
            onClick={() => fileInputRef.current.click()}
          >
            Subir imagen
          </Button>
          {uploading && <Spinner size="sm" />}
        </HStack>

        {/* Vista previa de imagen */}
        {uploadedUrl && (
          <Box mt={4}>
            <Image
              src={uploadedUrl}
              alt="Observación"
              maxW="100%"
              height="auto"
              borderRadius="md"
              objectFit="contain"
            />
          </Box>
        )}
      </FormControl>
      </Box>

      {/* Términos y condiciones */}
      <TermsCondition
        selectedBranch={selectedBranch}
        formData={formData}
        setFormData={setFormData}
      />
    </Stack>
  </Box>
);

};

export default MessageInput;
