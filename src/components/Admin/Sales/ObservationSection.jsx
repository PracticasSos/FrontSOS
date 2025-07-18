import { useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Image,
  Spinner,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import { supabase } from "../../../api/supabase";
import { FiCamera, FiUpload } from "react-icons/fi";

const ObservationSection = ({ setFormData }) => {
  const cameraInputRef = useRef();
  const fileInputRef = useRef();

  const [observation, setObservation] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

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
        observation_img: data.publicUrl,
      }));
    }

    setUploading(false);
  };

  const boxBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectBg = useColorModeValue('white', 'gray.600');

  return (
    <Box bg={boxBg}  borderRadius="md" p={4} mb={4} maxW="530px" mx="auto">
      <FormControl>
        <Textarea
          value={observation}
          onChange={(e) => {
            setObservation(e.target.value);
            setFormData((prev) => ({ ...prev, observation: e.target.value }));
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

        <input
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          className="no-pdf"
          ref={cameraInputRef}
          onChange={handleFileChange}
        />
        <input
          type="file"
          accept="image/*"
          hidden
          className="no-pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

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
  );
};

export default ObservationSection;
