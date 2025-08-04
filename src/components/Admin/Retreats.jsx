import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Box, Heading, Button, FormControl, FormLabel, Input, Table, Thead, Tbody, Tr, Th, Td, HStack, Select, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import SmartHeader from "../header/SmartHeader";
import { FaEye } from 'react-icons/fa';

const Retreats = () => {
    const { saleId } = useParams();
    const location = useLocation();
    const [salesData, setSalesData] = useState(null);
    const [patientData, setPatientData] = useState(location.state?.patientData || null);
    const [patientsList, setPatientsList] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [pendingSales, setPendingSales] = useState([]);
    const [message, setMessage] = useState("");
    const [paymentBalance, setPaymentBalance] = useState("");
    const navigate = useNavigate();

    const handleNavigate = (route = null) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (route) {
            navigate(route);
            return;
        }
        if (!user || !user.role_id) {
            navigate('/LoginForm');
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
            case 4:
                navigate('/SuperAdmin');
                break;
            default:
                navigate('/');
        }
    };

    useEffect(() => {
        if (saleId) {
            fetchPatientData();
        } else {
            console.error("Sale is undefined or invalid.");
            alert("Error: El ID de la venta no está disponible.");
        }
    }, [saleId]);

    const fetchPatientData = async () => {
        try {
            const { data, error } = await supabase
                .from("sales")
                .select(`
                    *,
                    patients (
                        id,
                        pt_firstname,
                        pt_lastname,
                        pt_ci,
                        pt_phone
                    ),
                    rx_final:measure_id (*),
                    inventario:inventario_id(brand),
                    lens:lens_id(lens_type)
                `)
                .eq("id", saleId)
                .single();
    
            if (error) throw error;
    
            setPatientData(data.patients); 
            setSalesData(data); 
        } catch (error) {
            console.error("Error fetching patient data:", error);
            alert("Error al cargar los datos de la venta.");
        }
    };
    
    const fetchSalesData = async () => {
        try {
            const { data, error } = await supabase
                .from("sales")
                .select(`
                    id,
                    date,
                    inventario:inventario_id(brand),
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
                    payment_balance, 
                    meausre_id
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

    const handleSendWhatsApp = async () => {
        if (!salesData || !patientData) {
            alert("Faltan datos para completar la operación.");
            return;
        }
    
        try {
            const phoneNumber = patientData.pt_phone;
            const formattedMessage = message || "Pedido listo para retiro.";
            const currentCredit = salesData.credit || 0;
            const updatedBalance = (salesData.balance || 0) + currentCredit;
            const updatedCredit = 0; 
    
            const { error: updateSalesError } = await supabase
                .from('sales')
                .update({ 
                    is_completed: true,
                    credit: updatedCredit,  
                    balance: updatedBalance, 
                    payment_balance: paymentBalance 
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

    const moduleSpecificButton = (
      <Button 
        onClick={() => handleNavigate('/RetreatsPatients')} 
        bg={useColorModeValue(
          'rgba(255, 255, 255, 0.8)', 
          'rgba(255, 255, 255, 0.1)'
        )}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={useColorModeValue(
          'rgba(56, 178, 172, 0.3)', 
          'rgba(56, 178, 172, 0.5)'
        )}
        color={useColorModeValue('teal.600', 'teal.300')}
        size="sm"
        borderRadius="15px"
        px={4}
        _hover={{
          bg: useColorModeValue(
            'rgba(56, 178, 172, 0.1)', 
            'rgba(56, 178, 172, 0.2)'
          ),
          borderColor: 'teal.400',
          transform: 'translateY(-1px)',
        }}
        transition="all 0.2s"
      >
        <HStack spacing={2} align="center" justify="center">
          <FaEye size="14px" />
          <Text fontWeight="600" lineHeight="1" m={0}>
            Lista de Retiros
          </Text>
        </HStack>
      </Button>
      );

    return (
        <Box className="sales-form" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
        <Heading as="h2" size="lg" mb={4}>Retiros</Heading>
        <SmartHeader moduleSpecificButton={moduleSpecificButton} />
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
                                                 salesData?.rx_final?.[`${field}_${prefix}`] || ""
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
                                    value={salesData?.inventario?.brand ?? "Sin marca"}
                                    isReadOnly
                                    width="auto"
                                    maxWidth="300px"
                                />
                            </FormControl>
                            
                            <FormControl mb={4}>
                                <FormLabel>Lunas</FormLabel>
                                <Input
                                    type="text"
                                    value={salesData?.lens?.lens_type ?? ""}
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