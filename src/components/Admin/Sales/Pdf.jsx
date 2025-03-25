import { useEffect, useState } from "react";
import { Box, Button, SimpleGrid, useToast } from "@chakra-ui/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "../../../api/supabase";

const Pdf = ({ formData, targetRef }) => {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      const session = data?.session;

      if (error) {
        console.error("Error al obtener la sesión:", error);
        setLoading(false);
        return;
      }

      let storedUser = localStorage.getItem("user");
      storedUser = storedUser ? JSON.parse(storedUser) : null;

      if (session?.user) {
        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user));
      } else if (storedUser) {
        setUser(storedUser);
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleDownloadPdf = async () => {
    if (!targetRef?.current) {
      toast({
        title: "Error",
        description: "No se encontró el contenido para generar el PDF.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const salesContent = targetRef.current;
      const buttons = salesContent.querySelectorAll("button");
      buttons.forEach((button) => {
        button.style.display = "none";
      });

      const canvas = await html2canvas(salesContent, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      const pdfBlob = pdf.output("blob");

      toast({
        title: "PDF Generado",
        description: "El documento se ha generado correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      const fileName = `venta-${formData.patient_id}-${Date.now()}.pdf`;
      const { data, error } = await supabase.storage.from("sales").upload(fileName, pdfBlob, {
        contentType: "application/pdf",
      });

      if (error) throw error;

      toast({
        title: "PDF Subido",
        description: "El documento se ha guardado en la nube correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const { data: urlData, error: urlError } = supabase.storage.from("sales").getPublicUrl(fileName);
      if (urlError) throw urlError;
      buttons.forEach((button) => {
        button.style.display = "inline-block";
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error generando o subiendo el PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar o subir el PDF.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return null;
    }
  };

  const sendWhatsAppMessage = async () => {
    if (!formData || !formData.pt_phone) {
      toast({
        title: "Error",
        description: "No hay datos para generar el PDF.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const pdfUrl = await handleDownloadPdf();
      if (pdfUrl) {
        const message = formData.message || "Aquí tienes el documento de tu venta.";
        const phoneNumber = formData.pt_phone;

        if (!phoneNumber) throw new Error("Número de teléfono no disponible");

        const cleanPhone = phoneNumber.replace(/\D/g, "");
        if (!cleanPhone || cleanPhone.length < 8) throw new Error("Formato de número telefónico inválido");

        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`${message}\n\nPuedes descargar tu documento aquí: ${pdfUrl}`)}`;
        window.location.href = whatsappUrl;

        toast({
          title: "WhatsApp Enviado",
          description: "El PDF ha sido enviado correctamente.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("No se pudo generar el PDF");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box textAlign="right" width="100%" padding={4} ml={{ base: 0, md: 150 }}>
      <SimpleGrid columns={1} spacing={4}>
        <Button onClick={sendWhatsAppMessage} colorScheme="teal" width={{ base: "100%", md: "60%" }} isDisabled={!formData?.pt_phone}>
          Enviar por WhatsApp
        </Button>
        <Button onClick={handleDownloadPdf} colorScheme="teal" width={{ base: "100%", md: "60%" }}>
          Generar PDF
        </Button>
      </SimpleGrid>
    </Box>
  );
};

export default Pdf;
