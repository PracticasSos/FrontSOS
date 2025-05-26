import React, { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";
import { Box, Button} from "@chakra-ui/react";

const SignaturePadComponent = ({ onSave }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    signaturePadRef.current = new SignaturePad(canvasRef.current);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const signatureDataUrl = getSignatureDataUrl();
      if (signatureDataUrl) {
        onSave(signatureDataUrl); 
      }
    }, 1000); 

    return () => clearInterval(interval); 
  }, []);

  const getSignatureDataUrl = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      return signaturePadRef.current.toDataURL();
    }
    return null; 
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  return (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    p={4}
    width={["90%", "80%", "400px"]}
    mx="auto"
  >
    <canvas
      ref={canvasRef}
      width={300}
      height={150}
      style={{
        border: "1px solid #ccc",
        borderRadius: "md",
      }}
    />
    <Box display="flex" flexDirection="column" mt={4} width="full" maxWidth="200px">
      <Button colorScheme="blue" onClick={clearSignature}>
        Borrar Firma
      </Button>
    </Box>
  </Box>
);

};

export default SignaturePadComponent;
