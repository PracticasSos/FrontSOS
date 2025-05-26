import { useEffect, useState } from "react";
import { Box, Button, SimpleGrid, useToast } from "@chakra-ui/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "../../api/supabase";

const PdfMeasures = ({ formData, targetRef, selectedPatient }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const waitForImagesToLoad = async (container) => {
  const images = container.querySelectorAll('img');
  const promises = [];

  images.forEach((img) => {
    if (!img.complete || img.naturalHeight === 0) {
      promises.push(
        new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        })
      );
    }
  });

  return Promise.all(promises);
  };


  const handleDownloadPdf = async () => {
    if (!targetRef?.current) {
      toast({
        title: "Error",
        description: "No se encontró el contenido para generar el PDF.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return null;
    }

    setLoading(true);

    try {
      const content = targetRef.current;
      const buttons = content.querySelectorAll("button");
      buttons.forEach((btn) => (btn.style.display = "none"));

      await waitForImagesToLoad(content);

      const canvas = await html2canvas(content, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = 297;

      let imgWidth = pdfWidth - 20;
      let imgHeight = (canvas.height / canvas.width) * imgWidth;

      if (imgHeight > pdfHeight - 20) {
        const scaleFactor = (pdfHeight - 20) / imgHeight;
        imgWidth *= scaleFactor;
        imgHeight = pdfHeight - 20;
      }

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      const pdfBlob = pdf.output("blob");
      const fileName = `medidas-${formData.patient_id}-${Date.now()}.pdf`;

      const { error } = await supabase.storage
        .from("measures")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
        });

      if (error) throw error;

      const { data: urlData, error: urlError } = supabase.storage
        .from("measures")
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      toast({
        title: "PDF Generado",
        description: "El documento ha sido subido correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar o subir el PDF.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return null;
    } finally {
      const buttons = targetRef?.current?.querySelectorAll("button");
      buttons?.forEach((btn) => (btn.style.display = "inline-block"));
      setLoading(false);
    }
  };

  const sendWhatsAppMessage = async () => {
    const patient = selectedPatient;

    if (!patient?.pt_phone) {
      toast({
        title: "Error",
        description: "No hay número de teléfono del paciente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const pdfUrl = await handleDownloadPdf();
    if (!pdfUrl) return;

    const message = formData.message || "Aquí tienes el documento de tus medidas.";
    const phoneNumber = patient.pt_phone.replace(/\D/g, "");

    if (phoneNumber.length < 8) {
      toast({
        title: "Error",
        description: "Número de teléfono inválido.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      `${message}\n\nPuedes descargar tu documento aquí: ${pdfUrl}`
    )}`;
    window.open(whatsappUrl, "_blank");

    toast({
      title: "WhatsApp Enviado",
      description: "El PDF ha sido enviado correctamente.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <SimpleGrid>
      <Box p={5}>
        <Button onClick={handleDownloadPdf} isLoading={loading}>
          Generar PDF
        </Button>
        <Button onClick={sendWhatsAppMessage} isLoading={loading} ml={3}>
          Enviar por WhatsApp
        </Button>
      </Box>
    </SimpleGrid>
  );
};

export default PdfMeasures;
