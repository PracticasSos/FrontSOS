import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import termsText from "./TermsText.md?raw"; 
import {
    Box,
    Checkbox,
    Text,
    Button,
    Collapse,
    Textarea
} from "@chakra-ui/react";


const baseMessage = "Acepta las condiciones de no devolución de {{BRANCH}}.";

const TermsCondition = ({ selectedBranch, formData, setFormData }) => {
    const [message, setMessage] = useState(baseMessage.replace("{{BRANCH}}", selectedBranch || "VEOPTICS"));
    const [isChecked, setIsChecked] = useState(false);
    const [showFullTerms, setShowFullTerms] = useState(false);
    

    const handleCheckbox = (e) => {
        const checked = e.target.checked;
        setFormData((prev) => ({ ...prev, termsAccepted: checked }));
    };

    const lines = termsText.split("\n");
    const previewLines = lines.slice(0, 3).join("\n");
    const remainingLines = lines.slice(3).join("\n");

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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      bg="gray.100"
      p={4}
      borderRadius="lg"
      width={["100%", "100%", "400px"]}
    >
      {/* Caja blanca con resumen y contenido expandible */}
      <Box
        bg="white"
        p={3}
        borderRadius="lg"
        shadow="md"
        fontSize="sm"
        lineHeight="1.6"
        color="gray.700"
        width="100%"
        mb={3}
      >
        {/* Resumen visible siempre */}
        <ReactMarkdown>{previewLines}</ReactMarkdown>

        {/* Contenido extra colapsable (sin repetir lo anterior) */}
        <Collapse in={showFullTerms} animateOpacity>
          <Box mt={2}>
            <ReactMarkdown>{remainingLines}</ReactMarkdown>
          </Box>
        </Collapse>

        {/* Botón de acción */}
        <Button
          variant="link"
          size="sm"
          mt={2}
          color="teal.600"
          onClick={() => setShowFullTerms(!showFullTerms)}
          fontWeight="bold"
        >
          {showFullTerms ? "Leer menos" : "Leer más."}
        </Button>
      </Box>

      {/* Checkbox de aceptación */}
      <Checkbox
        isChecked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
        colorScheme="teal"
        fontSize="sm"
      >
        <Text fontSize="sm" color="gray.600">
          Acepta las condiciones de no devolución de {selectedBranch || "VEOPTICS"}.
        </Text>
      </Checkbox>
    </Box>
  );
};

export default TermsCondition;
