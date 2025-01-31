import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Box, Heading, Button, FormControl, FormLabel, Input, Table, Thead, Tbody, Tr, Th, Td, Textarea, Select, SimpleGrid, Text } from "@chakra-ui/react";

const LaboratoryOrder = () => {
    const { patientId } = useParams();
    console.log(patientId);
    const location = useLocation();
    const [salesData, setSalesData] = useState(null);
    const [patientData, setPatientData] = useState(location.state?.patientData || null);
    const [patientsList, setPatientsList] = useState([]);
    const [filteredMeasures, setFilteredMeasures] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const navigate = useNavigate();

    const handleNavigate = (route) => {
        navigate(route);
    };

    useEffect(() => {
        if (patientId) {
            fetchPatientData();
        } else {
            console.error("patientId is undefined or invalid.");
            alert("Error: El ID del paciente no está disponible.");
        }
    }, [patientId]);

    useEffect(() => {
        if (patientData?.id) {
            fetchSalesData();
            fetchMeasures();
        }
    }, [patientData]);

    const fetchPatientData = async () => {
        if (!patientId) {
            console.error("patientId is undefined or invalid.");
            return; 
        }
        try {
            const { data, error } = await supabase
                .from("patients")
                .select("*")
                .eq("id", patientId)
                .single();

            if (error) throw error;
            setPatientData(data);
        } catch (error) {
            console.error("Error fetching patient data:", error);
            alert("Error al cargar los datos del paciente.");
        }
    };

      const fetchSalesData = async () => {
        try {
            const { data, error } = await supabase
                .from("sales")
                .select(`
                    id,
                    frame,
                    lens:lens_id(lens_type),
                    branchs:branchs_id(name), 
                    delivery_time, 
                    p_frame, 
                    p_lens,
                    price,
                    discount_frame, 
                    discount_lens,
                    total,
                    balance,
                    credit,
                    payment_in
                `)
                .eq("patient_id", patientData.id)
                .limit(1)
                .single();

            if (error) throw error;
            console.log("Sales Data:", data);
            setSalesData(data);
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };
      
    
      const handleInputFocus = () => {
        setIsTyping(true);
      };
      
      const handleInputBlur = () => {
        setTimeout(() => {
          setIsTyping(false); 
        }, 200); 
      };
      

      const fetchMeasures = async () => {
        try {
            const { data, error } = await supabase
                .from("rx_final")
                .select("*")
                .eq("patient_id", patientId);

            if (error) throw error;
            setFilteredMeasures(data);
        } catch (error) {
            console.error("Error fetching measures:", error);
        }
    };

    const handlePDFClick = async () => {
        try {
          const pdfUrl = await generateAndUploadPDF(formData);
          alert(`PDF generado: ${pdfUrl}`);
        } catch (err) {
          console.error("Error generando el PDF:", err);
          alert("Hubo un problema al generar el PDF.");
        }
      };

    const handleWhatsAppClick = async () => {
        try {
          const pdfUrl = await generateAndUploadPDF(formData);
          const message = formData.message || "Aquí tienes el documento solicitado.";
          const phoneNumber = formData.pt_phone;
    
          sendWhatsAppMessage(phoneNumber, pdfUrl, message);
        } catch (err) {
          console.error("Error enviando mensaje por WhatsApp:", err);
          alert("Hubo un problema al enviar el mensaje.");
        }
      };

    const filteredPatients = patientsList.filter(patient => {
        if (searchTerm === '') {
            return true; 
        }
        const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`;
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()); 
    });

    return (
        <Box className="sales-form" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
        <Heading as="h2" size="lg" mb={4}>Orden de Laboratorio</Heading>
        <Box display="flex" justifyContent="space-between" width="100%" maxWidth="900px" mb={4}>
            <Button onClick={() => handleNavigate("/RetreatsPatients")} colorScheme="teal">Lista de Retiros</Button>
            <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">Volver a Opciones</Button>
            <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
        </Box>
        <Box as="form" width="100%" maxWidth="1000px" padding={6} boxShadow="lg" borderRadius="md">
           
        {patientData && (
        <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <Text fontSize="lg">
            <strong>Nombre:</strong> {patientData.pt_firstname} {patientData.pt_lastname}
          </Text>
          <Text fontSize="lg">
            <strong>Cédula:</strong> {patientData.pt_ci}
          </Text>
          <Text fontSize="lg">
            <strong>Teléfono:</strong> {patientData.pt_phone || "No disponible"}
          </Text>
        </Box>
      )}
            <Box mt={4}>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Rx Final</Th>
                            <Th>Esfera</Th>
                            <Th>Cilindro</Th>
                            <Th>Eje</Th>
                            <Th>Prisma</Th>
                            <Th>ADD</Th>
                            <Th>AV VL</Th>
                            <Th>AV VP</Th>
                            <Th>DNP</Th>
                            <Th>ALT</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {[
                            { side: "OD", prefix: "right" },
                            { side: "OI", prefix: "left" },
                        ].map(({ side, prefix }) => (
                            <Tr key={prefix}>
                                <Td>{side}</Td>
                                {[
                                    "sphere",
                                    "cylinder",
                                    "axis",
                                    "prism",
                                    "add",
                                    "av_vl",
                                    "av_vp",
                                    "dnp",
                                    "alt",
                                ].map((field) => (
                                    <Td key={field}>
                                        <Input
                                            name={`${field}_${prefix}`}
                                            value={
                                                filteredMeasures.length > 0
                                                    ? filteredMeasures[0][`${field}_${prefix}`] || ""
                                                    : ""
                                            }
                                            isReadOnly
                                        />
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
            <Box p={5} maxWidth="800px" mx="auto">
                    <SimpleGrid columns={[1, 2]} spacing={4}>
                        <SimpleGrid columns={[1, 1]}>
                            <FormControl mb={4}>
                                <FormLabel>Armazón</FormLabel>
                                <Input
                                    type="text"
                                    value={salesData?.frame || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Lunas</FormLabel>
                                <Input
                                    type="text"
                                    value={salesData?.lens.lens_type || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Tiempo de entrega</FormLabel>
                                <Input
                                    type="text"
                                    value={salesData?.delivery_time || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Mensaje</FormLabel>
                                <Input 
                                    type="text"
                                    isReadOnly
                                   width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={[1, 1]} >
                            <FormControl mb={4}>
                                <FormLabel>Precio Armazón</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.p_frame || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Precio Lunas</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.p_lens || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Precio Sugerido</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.price || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Descuento Armazón</FormLabel>
                                <Input 
                                    type="number" 
                                    value={salesData?.discount_frame ?? ""} 
                                    isReadOnly 
                                    width="auto" 
                                    maxWidth="300px" />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Descuento.L</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.discount_lens || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Precio Total</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.total || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Abono</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.balance || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Saldo</FormLabel>
                                <Input
                                    type="number"
                                    value={salesData?.credit || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Pago en</FormLabel>
                                <Input
                                    type="text"
                                    value={salesData?.payment_in || ""}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                        </SimpleGrid>
                    </SimpleGrid>
                </Box>
        </Box>
    </Box>
    );
};

export default LaboratoryOrder;
