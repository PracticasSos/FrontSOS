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
    HStack
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
        <Box display="flex" flexDirection="column" alignItems="center" width={["90%", "80%", "400px"]} mx="auto">
            <FormControl mb={4}>
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

            <FormControl mb={4}>
                <FormLabel fontSize="md" fontWeight="bold" color="teal.600">
                    Observación
                </FormLabel>
                <Textarea
                    value={observation}
                    onChange={(e) => {
                        setObservation(e.target.value);
                        setFormData((prev) => ({ ...prev, observation: e.target.value }));
                    }}
                    height="100px"
                    borderColor="teal.300"
                    focusBorderColor="teal.500"
                />

                <Box mt={2}>
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

                    {/* Botones separados */}
                    <HStack spacing={4} mt={2}>
                        <Button
                            leftIcon={<Icon as={FiCamera} />}
                            size="sm"
                            colorScheme="teal"
                            variant="outline"
                            onClick={() => cameraInputRef.current.click()}
                        >
                            Tomar foto
                        </Button>

                        <Button
                            leftIcon={<Icon as={FiUpload} />}
                            size="sm"
                            colorScheme="teal"
                            variant="outline"
                            onClick={() => fileInputRef.current.click()}
                        >
                            Subir imagen
                        </Button>

                        {uploading && <Spinner size="sm" />}
                    </HStack>
                    {uploadedUrl && (
                        <Image src={uploadedUrl} alt="Observación" mt={3} boxSize="60px" borderRadius="md" />
                    )}
                </Box>
            </FormControl>
            <TermsCondition
            selectedBranch={selectedBranch}
            formData={formData}
            setFormData={setFormData}
            />
        </Box>
    );
};

export default MessageInput;
