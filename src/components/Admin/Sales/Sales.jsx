import React, { useState, useEffect, useRef } from "react";
import SearchPatient from "./SearchPatient";
import Measures from "./Measures";
import SelectItems from "./SelectItems";
import PriceCalculation from "./PriceCalculation";
import { supabase } from "../../../api/supabase";
import { Box, Heading, Button, SimpleGrid, FormControl, FormLabel, Input, Text, Grid, Stack } from "@chakra-ui/react";
import Total from "./Total";
import Pdf from "./Pdf";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SignaturePadComponent from "./SignaturePadComponent";
import MessageInput from "./Message";
import { useToast } from "@chakra-ui/react";
import Delivery from "./Delivery";


const Sales = () => {
  const [saleData, setSaleData] = useState({
    patient_id: "",
    branchs_id: "",
    date: "",
    pt_phone: "",
    brand_id: "", 
    lens_id: "", 
    delivery_time: "",
    delivery_datetime: "",
  });
  const [formData, setFormData] = useState({
    p_frame: 0,
    p_lens: 0,
    discount_frame: 0,
    discount_lens: 0,
    total_p_frame: 0,
    total_p_lens: 0,
    total: 0,
    credit: 0,
    balance: 0,
    payment_in: 0,
    message: "",
    measure_id: "",
    signature: ""
  });
  const [patientMeasures, setPatientMeasures] = useState([]);
  const [filteredMeasures, setFilteredMeasures] = useState([]);
  const [deliveryDays, setDeliveryDays] = useState(0);
  const [saleRegistered, setSaleRegistered] = useState(false);
  const [saleId, setSaleId] = useState(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const navigate = useNavigate();
  const salesRef = useRef(null);
  const [branchName, setBranchName] = useState("");
  const location = useLocation();
  const { patientId} = useParams();
  const toast = useToast();

  const handleFormDataChange = (newFormData) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...newFormData,
    }));

    const saleDataUpdates = {};

    if (newFormData.brand_id !== undefined) {
      saleDataUpdates.brand_id = newFormData.brand_id;
    }

    if (newFormData.lens_id !== undefined) {
      saleDataUpdates.lens_id = newFormData.lens_id;
    }

    if (Object.keys(saleDataUpdates).length > 0) {
      setSaleData((prevSaleData) => ({
        ...prevSaleData,
        ...saleDataUpdates,
      }));
    }
  };

  useEffect(() => {
    const fetchBranchName = async () => {
        if (!saleData.branchs_id) return;
        
        const { data, error } = await supabase
            .from("branchs")
            .select("name")
            .eq("id", saleData.branchs_id)
            .single();
        
        if (error) {
            console.error("Error obteniendo nombre de sucursal:", error);
            return;
        }

        setBranchName(data?.name || "VEOPTICS");
    };

    fetchBranchName();
  }, [saleData.branchs_id]);
  
  useEffect(() => {
    fetchLatestRxFinal();
  }, []);

  const fetchLatestRxFinal = async () => {
    try {
      const { data, error } = await supabase
        .from("rx_final")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const latestMeasuresByPatient = {};
      data.forEach((measure) => {
        if (
          !latestMeasuresByPatient[measure.patient_id] ||
          new Date(measure.created_at) >
            new Date(latestMeasuresByPatient[measure.patient_id].created_at)
        ) {
          latestMeasuresByPatient[measure.patient_id] = measure;
        }
      });

      const latestMeasuresArray = Object.values(latestMeasuresByPatient);
      setPatientMeasures(latestMeasuresArray || []);
    } catch (err) {
      console.error("Error fetching latest rx_final:", err);
    }
  };

  const handlePatientDataChange = (formData) => {
    setSaleData((prevData) => {
      const updatedData = {
        ...prevData,
        patient_id: formData.patient_id,
        branchs_id: formData.branchs_id,
        date: formData.date,
        pt_phone: formData.pt_phone,
        brand_id: formData.brand || prevData.brand_id,
        lens_id: formData.lens_type || prevData.lens_id,
      };
      return updatedData;
    });

    if (formData.patient_id) {
      const patientLatestMeasures = patientMeasures.filter(
        (measure) => measure.patient_id === formData.patient_id
      );
      setFilteredMeasures(patientLatestMeasures);

      if (patientLatestMeasures.length > 0) {
        const latestMeasure = patientLatestMeasures[0];
        setFormData((prevFormData) => ({
          ...prevFormData,
          measure_id: latestMeasure.id,
        }));
      }
    }
  };
  

  const handleSubmit = async () => {
    const signatureDataUrl = formData.signature;
      if (!signatureDataUrl) {
      console.error("La firma no ha sido proporcionada.");
      return;
    }
    if (formData.brand_id) {
      const { data: frame, error } = await supabase
        .from("inventario")
        .select("quantity")
        .eq("id", formData.brand_id)
        .single();
      if (error || !frame) {
        console.error("Error obteniendo cantidad:", error);
        return;
      }
      if (frame.quantity > 0) {
        const { error: updateError } = await supabase
          .from("inventario")
          .update({ quantity: frame.quantity - 1 })
          .eq("id", formData.brand_id);
  
        if (updateError) {
          console.error("Error actualizando cantidad:", updateError);
        }
      } else {
        console.log("No hay suficiente cantidad para el armazón seleccionado.");
        return; 
      }
    }

    const saleDataToSave = {
      date: saleData.date,
      delivery_time: saleData.delivery_time,
      delivery_datetime: saleData.delivery_datetime,
      p_frame: isNaN(parseFloat(formData.p_frame)) ? 0 : parseFloat(formData.p_frame),
      p_lens: isNaN(parseFloat(formData.p_lens)) ? 0 : parseFloat(formData.p_lens),
      price: isNaN(parseFloat(formData.total)) ? 0 : parseFloat(formData.total),
      total: isNaN(parseFloat(formData.total)) ? 0 : parseFloat(formData.total),
      credit: isNaN(parseFloat(formData.credit)) ? 0 : parseFloat(formData.credit),
      balance: isNaN(parseFloat(formData.balance)) ? 0 : parseFloat(formData.balance),
      payment_in: formData.payment_in,
      patient_id: saleData.patient_id || null,
      lens_id: saleData.lens_id || null,
      branchs_id: saleData.branchs_id || null,
      total_p_frame: isNaN(parseFloat(formData.total_p_frame)) ? 0 : parseFloat(formData.total_p_frame),
      total_p_lens: isNaN(parseFloat(formData.total_p_lens)) ? 0 : parseFloat(formData.total_p_lens),
      discount_frame: isNaN(parseFloat(formData.discount_frame)) ? 0 : parseFloat(formData.discount_frame),
      discount_lens: isNaN(parseFloat(formData.discount_lens)) ? 0 : parseFloat(formData.discount_lens),
      inventario_id: saleData.brand_id || null,
      measure_id: formData.measure_id || null,
      signature: formData.signature || null,
    };

    try {

      const { data, error } = await supabase
        .from("sales")
        .insert([saleDataToSave])
        .select();
      if (error) throw error;
      setSaleRegistered(true);
      if (data && data.length > 0) {
        setSaleId(data[0].id);
        setPdfGenerated(true);
        toast({
          title: "Venta registrada con éxito.",
          description: "La venta ha sido guardada correctamente.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error al registrar la venta:", err);
    }
  };

  const pdfData = {
    ...saleData,
    ...formData,
    sale_id: saleId,
  };

  const handleSaveSignature = (signatureDataUrl) => {
    setFormData((prev) => ({
      ...prev,
      signature: signatureDataUrl,
    }));
  };

  const handleNavigate = (route = null) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (route) {
      navigate(route);
      return;
    }
    if (!user || !user.role_id) {
      navigate('/Login');
      return;
    }
    switch (user.role_id) {
      case 1:
        navigate('/Admin');
        break;
      case 2:
        navigate('/Optometra');
        break;
      case 3:
        navigate('/Vendedor');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Box ref={salesRef} w="full" px={4}>
      <Box className="sales-form" display="flex" flexDirection="column" alignItems="center" minHeight="100vh" p={4}>
        <Heading mb={4} textAlign="center">Registro de Venta</Heading>
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} width="full" maxWidth="900px" mb={4}>
          <Button onClick={() => handleNavigate("/CashClousure")} colorScheme="teal">Consultas de Cierre</Button>
          <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
          <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
        </Box>
  
        <Box width="full" maxWidth="1500px" p={6} boxShadow="lg" borderRadius="md">
          <SearchPatient onFormDataChange={handlePatientDataChange} initialFormData={saleData} />
          <Measures initialFormData={saleData} filteredMeasures={filteredMeasures} />

          <Box p={5} width="full" maxW="2000px" overflowX="auto">
            <Text
              fontSize="xl"
              fontWeight="bold"
              mb={6}
              textAlign="center"
              color="teal.600"
            >
              Detalles de Venta
            </Text>
            <Box minWidth="1200px">
              <Grid
                templateColumns="repeat(3, 1fr)"
                gap={4}
                mb={4}
                fontWeight="bold"
                textAlign="center"
                color="gray.700"
              >
                <Text>Armazón / Lunas</Text>
                <Text>Precio Armazón / Lunas</Text>
                <Text>Totales</Text>
              </Grid>

              <Grid templateColumns="repeat(3, 1fr)" gap={4} alignItems="start">
                <Box p={3}  minW="380px">
                  <SelectItems
                    onFormDataChange={handleFormDataChange}
                    initialFormData={formData}
                  />
                </Box>

                <Box p={3} minW="380px">
                  <PriceCalculation formData={formData} setFormData={setFormData} />
                </Box>

                <Box p={3}  minW="380px">
                  <Total formData={formData} setFormData={setFormData} />
                </Box>
              </Grid>
            </Box>
          </Box>

          <Box p={5} width="full" maxW="900px" mx="auto">
            <SimpleGrid columns={[1, 2]} spacing={6}>
              {/* Columna Izquierda: Fecha de Entrega */}
              <Box>
                <Delivery saleData={saleData} setSaleData={setSaleData} />
                <SignaturePadComponent
                    onSave={(signatureDataUrl) =>
                      setFormData((prev) => ({
                        ...prev,
                        signature: signatureDataUrl,
                      }))
                    }
                  />
              </Box>

              {/* Columna Derecha: Mensaje y Firma */}
              <Box>
                <Stack spacing={4}>
                  <MessageInput
                    selectedBranch={branchName}
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Stack>
              </Box>
            </SimpleGrid>
          </Box>
          <Button colorScheme="teal" width="full"  maxWidth="200px" mt={4} onClick={handleSubmit}>
            Registrar Venta
          </Button>
          {saleId && <Pdf formData={pdfData} targetRef={salesRef} />}
        </Box>
      </Box>
    </Box>
  );  
};

export default Sales;
