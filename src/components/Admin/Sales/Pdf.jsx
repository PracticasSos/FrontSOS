import { useEffect, useState } from "react";
import { Box, Button, SimpleGrid, useToast, Spinner } from "@chakra-ui/react";
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
      .eq("id", 3);  // Solo obtener la sucursal con id 3

    if (error) {
      console.error("Error fetching branchs data:", error);
    } else {
      setBranchs(data);  // Almacenar las sucursales que coincidan
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
      
      buttons.forEach((button) => {
        button.style.display = "none";
      });

      // Ajustamos el canvas con una escala
      const canvas = await html2canvas(salesContent, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // Usamos A4 como tamaño fijo (210mm x 297mm)
      const pdf = new jsPDF("p", "mm", "a4");

      // Definimos el tamaño máximo para ajustar el contenido a A4
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      // Ajustar la imagen al tamaño de la página A4 (manteniendo la proporción)
      let imgWidth = pdfWidth - 20; // Margen de 10mm a cada lado
      let imgHeight = (canvas.height / canvas.width) * imgWidth;

      // Si la altura es mayor que la altura del A4, ajustamos la altura
      if (imgHeight > pdfHeight - 20) {
        const scaleFactor = (pdfHeight - 20) / imgHeight;
        imgWidth *= scaleFactor;
        imgHeight = pdfHeight - 20;
      }

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight); // Agregar la imagen con las dimensiones ajustadas
      const pdfBlob = pdf.output("blob");

      toast({
        title: "PDF Generado",
        description: "El documento se ha generado correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const fileName = `venta-${formData.patient_id}-${Date.now()}.pdf`;

      if (!isLaboratoryOrder) {  // Solo guardamos la venta si no es un Laboratorio Order
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
      }

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
      
      const buttons = targetRef.current?.querySelectorAll("button");
      buttons?.forEach((button) => {
        button.style.display = "inline-block";
      });
      setGenerating(false);
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
    setGenerating(true);
    try {
      const buttons = targetRef?.current?.querySelectorAll("button");
      buttons?.forEach((button) => {
        button.style.display = "none";
      });

      const pdfUrl = await handleDownloadPdf();
      if (pdfUrl) {
        const message = formData.message || "Aquí tienes el documento de tu venta.";

        if (isLaboratoryOrder) {
          // Enviar solo si es el usuario correcto (id 1) y la sucursal correcta (id 3)
          if (!user || user.id !== 1) {
            throw new Error("Usuario no autorizado para enviar WhatsApp.");
          }

          if (!branchs || branchs.length === 0 || branchs[0].id !== 3) {
            throw new Error("Sucursal no autorizada para enviar WhatsApp.");
          }

          const phoneNumber = user.pt_phone;
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
          // Enviar a los pacientes en el caso de "Sales"
          const phoneNumber = formData.pt_phone;
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
        }
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
      buttons?.forEach((button) => {
        button.style.display = "inline-block";
      });
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
