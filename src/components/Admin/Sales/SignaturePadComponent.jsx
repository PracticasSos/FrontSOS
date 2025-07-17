import React, { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";
import { Box, Button, useColorModeValue } from "@chakra-ui/react";

const SignaturePadComponent = ({ onSave }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  // Colores adaptativos - TODOS los hooks al inicio
  const canvasBg = useColorModeValue('#fff', '#2D3748');
  const borderColor = useColorModeValue('rgb(94, 97, 100)', '#4A5568');
  const boxShadow = useColorModeValue(
    '0 2px 8px rgba(0,0,0,0.08)', 
    '0 2px 8px rgba(0,0,0,0.3)'
  );
  const penColor = useColorModeValue('#000', '#fff'); // Movido aquí

  const initializeCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = canvasBg;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: canvasBg,
        penColor: penColor // Usar la variable definida arriba
      });
      initializeCanvas();
    }
  }, [canvasBg, penColor]); // Agregar penColor como dependencia

  useEffect(() => {
    const interval = setInterval(() => {
      const signatureDataUrl = getSignatureDataUrl();
      if (signatureDataUrl) {
        onSave(signatureDataUrl); 
      }
    }, 1000); 

    return () => clearInterval(interval); 
  }, [onSave]);

  const getSignatureDataUrl = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      return signaturePadRef.current.toDataURL();
    }
    return null; 
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      initializeCanvas();
    }
  };

  return (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    p={2} // ← Reducir padding de 4 a 2
    width={["90%", "80%", "400px"]}
    mx="auto"
    mb={0} // ← Eliminar margen inferior
  >
    <canvas
      ref={canvasRef}
      width={510}
      height={150}
      style={{
        border: `2px solid ${borderColor}`, 
        borderRadius: "12px",    
        background: canvasBg,    
        boxShadow: boxShadow, 
        display: "block"
      }}
    />
    <Box display="flex" flexDirection="column" mt={2} width="full" maxWidth="200px"> {/* ← Reducir mt de 4 a 2 */}
      <Button colorScheme="blue" onClick={clearSignature}>
        Borrar Firma
      </Button>
    </Box>
  </Box>
);
};

export default SignaturePadComponent;