import { useEffect, useState } from "react";
import {
  Box,
  Button,
  SimpleGrid,
  useToast,
  Spinner,
  Text,
} from "@chakra-ui/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "../../../api/supabase";

const Pdf = ({ formData, targetRef, isLaboratoryOrder = false }) => {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [branchs, setBranchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  const fetchBranchsData = async () => {
    const { data, error } = await supabase
      .from("branchs")
      .select("id, cell")
      .eq("id", 3);

    if (error) {
      console.error("Error fetching branchs data:", error);
    } else {
      setBranchs(data);
    }
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
    return;
  }

  setGenerating(true);

  try {
    const salesContent = targetRef.current;
    const buttons = salesContent.querySelectorAll("button");
    buttons.forEach((b) => (b.style.display = "none"));
    const icons = salesContent.querySelectorAll(".chakra-select__icon");
    icons.forEach((icon) => (icon.style.display = "none"));
    const fileInputs = salesContent.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => input.remove());

    // Captura canvas
    const canvas = await html2canvas(salesContent, {
      scale: 1.2,
      backgroundColor: "#fff", // 🧽 Fuerza fondo blanco
      ignoreElements: (el) => el.classList?.contains("no-pdf"),
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgProps = {
      width: pdfWidth - 20,
      height: (canvas.height / canvas.width) * (pdfWidth - 20),
    };

    let y = 10;
    const pageHeight = pdfHeight - 20;
    let position = 0;

    if (imgProps.height < pageHeight) {
      pdf.addImage(imgData, "JPEG", 10, y, imgProps.width, imgProps.height);
    } else {
      while (position < imgProps.height) {
        const sourceCanvas = document.createElement("canvas");
        sourceCanvas.width = canvas.width;
        sourceCanvas.height = (pageHeight * canvas.width) / imgProps.width;

        const ctx = sourceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          (position * canvas.width) / imgProps.width,
          canvas.width,
          sourceCanvas.height,
          0,
          0,
          canvas.width,
          sourceCanvas.height
        );

        const segmentImgData = sourceCanvas.toDataURL("image/jpeg", 0.7);
        if (position !== 0) pdf.addPage();
        pdf.addImage(segmentImgData, "JPEG", 10, y, imgProps.width, pageHeight);
        position += pageHeight;
      }
    }

    const pdfBlob = pdf.output("blob");
    const fileName = `venta-${formData.patient_id}-${Date.now()}.pdf`;

    const { data, error } = await supabase.storage
      .from("sales")
      .upload(fileName, pdfBlob, {
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

    const { data: urlData, error: urlError } = supabase.storage
      .from("sales")
      .getPublicUrl(fileName);

    if (urlError) throw urlError;
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
  } finally {
    const buttons = targetRef.current?.querySelectorAll("button");
    buttons?.forEach((b) => (b.style.display = "inline-block"));
    const icons = targetRef.current?.querySelectorAll(".chakra-select__icon");
    icons?.forEach((i) => (i.style.display = "inline-block"));
    setGenerating(false);
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

    setGenerating(true);
    try {
      const buttons = targetRef?.current?.querySelectorAll("button");
      buttons?.forEach((b) => (b.style.display = "none"));

      const pdfUrl = await handleDownloadPdf();

      if (pdfUrl) {
        const message = formData.message || "Aquí tienes el documento de tu venta.";

        const phoneNumber = isLaboratoryOrder && user?.id === 1 && branchs?.[0]?.id === 3
          ? user.pt_phone
          : formData.pt_phone;

        const cleanPhone = phoneNumber?.replace(/\D/g, "");

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
    } finally {
      const buttons = targetRef?.current?.querySelectorAll("button");
      buttons?.forEach((b) => (b.style.display = "inline-block"));
      setGenerating(false);
    }
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
        {generating && (
          <Box mt={4} display="flex" alignItems="center">
            <Spinner size="sm" mr={2} />
            <Text>Cargando, por favor espera...</Text>
          </Box>
        )}
      </Box>
    </SimpleGrid>
  );
};

export default Pdf;
