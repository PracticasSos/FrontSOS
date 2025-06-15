import { useState } from "react";
import { Box, Button, Spinner, Text, useToast } from "@chakra-ui/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "../../api/supabase";

const PdfLaboratory = ({ formData, targetRef }) => {
  const toast = useToast();
  const [generating, setGenerating] = useState(false);

  const getWhatsAppNumber = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("phone_number")
      .eq("id", 1)
      .single();

    if (error || !data?.phone_number) {
      throw new Error("No se pudo obtener el número de WhatsApp del usuario 1.");
    }

    return data.phone_number.replace(/\D/g, ""); // Limpia el número
  };

  const handleGenerateAndSend = async () => {
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

    setGenerating(true);

    try {
      // Ocultar botones del DOM
      const content = targetRef.current;
      const buttons = content.querySelectorAll("button");
      buttons.forEach((b) => (b.style.display = "none"));

      // Captura canvas
      const canvas = await html2canvas(content, {
        scale: 1.2,
        backgroundColor: "#fff",
        ignoreElements: (el) => el.classList?.contains("no-pdf"),
      });

      // Preparar PDF
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const widthMM = 267;
      const heightMM = 455;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [widthMM, heightMM],
        compress: true,
        putOnlyUsedFonts: true,
      });

      pdf.setProperties({
        title: "Orden de Laboratorio",
        author: "Sistema de Óptica",
        pdfVersion: "1.7",
      });

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        widthMM,
        (canvas.height / canvas.width) * widthMM
      );

      // Subir a Supabase
        const patientId = formData?.patient_id || "desconocido";
        const fileName = `orden-laboratorio-${patientId}-${Date.now()}.pdf`;
        const pdfBlob = pdf.output("blob");

      const { error: uploadError } = await supabase.storage
        .from("laboratory")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
        });

      if (uploadError) throw uploadError;

      const { data: urlData, error: urlError } = supabase.storage
        .from("laboratory")
        .getPublicUrl(fileName);

      if (urlError || !urlData?.publicUrl) throw urlError;

      // Obtener número de teléfono y enviar por WhatsApp
      const number = await getWhatsAppNumber();
      const message = formData.message || "Orden de laboratorio generada.";
      const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(
        `${message}\n\nPuedes ver el documento aquí: ${urlData.publicUrl}`
      )}`;

      window.open(whatsappUrl, "_blank");

      toast({
        title: "Enviado por WhatsApp",
        description: "El PDF fue generado y enviado exitosamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema en el proceso.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      const buttons = targetRef?.current?.querySelectorAll("button");
      buttons?.forEach((b) => (b.style.display = "inline-block"));
      setGenerating(false);
    }
  };

  return (
    <Box p={4}>
      <Button onClick={handleGenerateAndSend} isLoading={generating}>
        Generar PDF y Enviar por WhatsApp
      </Button>
      {generating && (
        <Box mt={4} display="flex" alignItems="center">
          <Spinner size="sm" mr={2} />
          <Text>Generando PDF, por favor espera...</Text>
        </Box>
      )}
    </Box>
  );
};

export default PdfLaboratory;
