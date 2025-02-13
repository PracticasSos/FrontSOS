import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Box, Heading, Button, FormControl, FormLabel, Input, Table, Thead, Tbody, Tr, Th, Td, Textarea, Select, SimpleGrid, Text } from "@chakra-ui/react";

const Retreats = () => {
    const { patientId } = useParams();
    console.log(patientId);
    const location = useLocation();
    const [salesData, setSalesData] = useState(null);
    const [patientData, setPatientData] = useState(location.state?.patientData || null);
    const [patientsList, setPatientsList] = useState([]);
    const [filteredMeasures, setFilteredMeasures] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [pendingSales, setPendingSales] = useState([]);
    const [message, setMessage] = useState("");
    const [paymentBalance, setPaymentBalance] = useState("");
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
                    date,
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
                    payment_in,
                    payment_balance
                `)
                .eq("patient_id", patientData.id); 
    
            if (error) throw error;
    
            console.log("Sales Data:", data); 
    
            if (!Array.isArray(data)) {
                throw new Error("Supabase did not return an array");
            }
            const correctSale = data.find(sale => sale.date === location.state?.selectedDate);
    
            setSalesData(correctSale || null); 
            setPendingSales(data);
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

    const handleSendWhatsApp = async () => {
        if (!salesData || !patientData) {
            alert("Faltan datos para completar la operación.");
            return;
        }
    
        try {
            const phoneNumber = patientData.pt_phone;
            const formattedMessage = message || "Pedido listo para retiro.";
    
            // Obtener el crédito actual
            const currentCredit = salesData.credit || 0;
            const updatedBalance = (salesData.balance || 0) + currentCredit;
            const updatedCredit = 0; // Siempre debe pasar a 0
    
            // Actualizar la venta con el nuevo balance y credit en 0
            const { error: updateSalesError } = await supabase
                .from('sales')
                .update({ 
                    is_completed: true,
                    credit: updatedCredit,  // Se pone en 0
                    balance: updatedBalance, // Se suma el crédito al balance (abono)
                    payment_balance: paymentBalance // Actualiza el valor de payment_balance
                })
                .eq('id', salesData.id);
    
            if (updateSalesError) {
                console.error('Error actualizando la venta:', updateSalesError);
                throw updateSalesError;
            }
    
            sendWhatsAppMessage(phoneNumber, formattedMessage);
            
            setPendingSales(prevSales => 
                prevSales.filter(sale => sale.id !== salesData.id)
            );
    
            navigate("/RetreatsPatients", { 
                state: { 
                    updatedPendingSales: pendingSales.filter(sale => sale.id !== salesData.id) 
                } 
            });
    
            alert("Mensaje enviado, retiro marcado como completado y saldo actualizado.");
        } catch (err) {
            console.error("Error al procesar la venta:", err);
            alert("Hubo un problema al completar la operación.");
        }
    };
    
    const fetchPendingSales = async () => {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .neq('is_completed', false);  
        
        if (error) {
            console.error('Error fetching sales:', error);
        } else {
            setPendingSales(data);
        }
    };
    
    const sendWhatsAppMessage = (phoneNumber, message) => {
        if (!phoneNumber) {
            alert("El número de teléfono no está disponible.");
            return;
        }
    
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
        window.open(whatsappUrl, "_blank");
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
                                    width="50%" 
                                    maxWidth="100px"  
                                    minWidth="250px"  
                                    height="100px"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)} 
                                />
                            </FormControl>
                            <Button colorScheme="teal" minWidth="250px" width="50%" maxWidth="100px" mt={4} onClick={handleSendWhatsApp}>Enviar</Button>
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
                            <FormControl mb={4}>
                                <FormLabel>Pago en</FormLabel>
                                <Select
                                    value={paymentBalance}
                                    onChange={(e) => setPaymentBalance(e.target.value)}
                                    width="auto"
                                    maxWidth="300px"
                                >
                                    <option value="">Seleccione</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="datafast">Datafast</option>
                                    <option value="transferencia">Transferencia</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                    </SimpleGrid>
                </Box>
        </Box>
    </Box>
    );
};

export default Retreats;