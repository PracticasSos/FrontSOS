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

  useEffect(() => {
    signaturePadRef.current = new SignaturePad(canvasRef.current);
    // Pintar fondo blanco
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
    // Repintar fondo blanco
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
      bg="white"
      height={150}
      style={{
    border: "2px solidrgb(94, 97, 100)", 
    borderRadius: "12px",    
    background: "#fff",    
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", 
    display: "block"
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
