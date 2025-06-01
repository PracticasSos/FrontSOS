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
    const [showTerms, setShowTerms] = useState(false);

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
        <Box display="flex" flexDirection="column" alignItems="center" width={["90%", "80%", "400px"]} mx="auto">

            <Button size="sm" colorScheme="teal" variant="link" mb={2} onClick={() => setShowTerms(!showTerms)}>
                {showTerms ? "Ocultar Términos y Condiciones" : "Ver Términos y Condiciones"}
            </Button>

            <Collapse in={showTerms} animateOpacity>
                <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={3}
                    mb={4}
                    maxH="300px"
                    overflowY="auto"
                    background="gray.50"
                    fontSize="sm"
                >
                    <ReactMarkdown>{termsText}</ReactMarkdown>
                </Box>
            </Collapse>

            <Checkbox mt={2} colorScheme="teal" isChecked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>
                <Text fontSize="sm">
                    ACEPTA LAS CONDICIONES DE NO DEVOLUCIÓN DE {selectedBranch || "VEOPTICS"}
                </Text>
            </Checkbox>
        </Box>
    );
};

export default TermsCondition;
