import React, { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";
import { Box, Button } from "@chakra-ui/react";

const SignaturePadComponent = ({ onSave }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    signaturePadRef.current = new SignaturePad(canvasRef.current);
  }, []);

  const saveSignature = () => {
    if (signaturePadRef.current) {
      const signatureDataUrl = signaturePadRef.current.toDataURL();
      onSave(signatureDataUrl); 
    }
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={4} border="1px solid gray" borderRadius="md">
      <canvas ref={canvasRef} width={300} height={150} style={{ border: "1px solid #ccc" }} />
      <Button colorScheme="blue" onClick={saveSignature} mt={2}>
        Guardar Firma
      </Button>
      <Button colorScheme="red" onClick={clearSignature} mt={2}>
        Borrar Firma
      </Button>
    </Box>
  );
};

export default SignaturePadComponent;
