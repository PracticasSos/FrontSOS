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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [labsList, setLabsList] = useState([]);
    const [selectedLab, setSelectedLab] = useState('');
    const [observations, setObservations] = useState('');
    const [lensTypes, setLensTypes] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const navigate = useNavigate();

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
            fetchLabs();
            fetchSalesData();
            fetchMeasures();
            fetchLens();
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

    const fetchLabs = async () => {
        const { data, error } = await supabase
            .from('labs')
            .select('id, name');
        if (error) {
            console.error('Error fetching labs:', error);
        } else {
            setLabsList(data);
        }
    };


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const fetchLens = async () => {
        const { data, error } = await supabase.from("lens").select("id, lens_type");
        if (error) {
          console.error("Error fetching lens types:", error);
        } else {
          setLensTypes(data);
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
                    branchs:branchs_id(name)
                `)
                .eq("patient_id", patientData.id)
                .order("date", { ascending: false })
                .limit(1)
                .single();

            if (error) throw error;
            setSalesData(data);
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };
      
      const updateLensType = async (saleId, lensType) => {
        const { error } = await supabase
          .from("sales") 
          .update({ lens_type: lensType }) 
          .eq("id", saleId); 
      
        if (error) {
          console.error("Error updating lens type in sales:", error);
        } else {
          console.log("Lens type updated successfully!");
        }
      };
      
      const handleLensChange = (e) => {
        const search = e.target.value.toLowerCase();
        setIsTyping(true); 
        setSelectedSale((prevSale) => ({
          ...prevSale,
          lens: { lens_type: search },
        }));
      
        if (selectedSale?.id) {
          updateLensType(selectedSale.id, search);
        }
      };
      
    
      const handleLensSelect = (lens) => {
        setSelectedSale((prevSale) => ({
          ...prevSale,
          lens: { lens_type: lens.lens_type },
        }));
      
        if (selectedSale?.id) {
          updateLensType(selectedSale.id, lens.lens_type);
        }
      
        setIsTyping(false); 
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
            default:
                navigate('/');
        }
    };

    return (
        <Box className="sales-form" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
        <Heading as="h2" size="lg" mb={4}>Orden de Laboratorio</Heading>
        <Box display="flex" justifyContent="space-between" width="100%" maxWidth="900px" mb={4}>
            <Button onClick={() => handleNavigate("/OrderLaboratoryList")} colorScheme="teal">Lista de Laboratorio</Button>
            <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
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
                    <Box padding={4} maxWidth="500px" textAlign="left">
                        <SimpleGrid columns={1}>
                            <FormControl mb={4}>
                                <FormLabel>Óptica</FormLabel>
                                <Input 
                                    type="text" 
                                    value={salesData?.branchs?.name || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Fecha</FormLabel>
                                <Input 
                                    type="text" 
                                    value={salesData?.date || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
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
                            <FormLabel>Tipo de Lentes</FormLabel>
                            <Input
                                type="text"
                                value={salesData?.lens?.lens_type || ""}
                                onChange={handleLensChange}
                                onFocus={handleInputFocus} 
                                placeholder="Escribe para buscar..."
                            />
                            {isTyping && salesData?.lens?.lens_type?.trim()?.length > 0 && (
                                <Box
                                border="1px solid #ccc"
                                borderRadius="md"
                                mt={2}
                                maxHeight="150px"
                                overflowY="auto"
                                bg="white"
                                zIndex="10"
                                position="relative"
                                >
                                {lensTypes
                                    .filter((lens) =>
                                    lens.lens_type.toLowerCase().includes(salesData.lens.lens_type.toLowerCase())
                                    )
                                    .map((lens) => (
                                    <Box
                                        key={lens.id}
                                        padding={2}
                                        _hover={{ bg: "teal.100", cursor: "pointer" }}
                                        onMouseDown={() => handleLensSelect(lens)} 
                                    >
                                        {lens.lens_type}
                                    </Box>
                                    ))}
                                </Box>
                            )}
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Laboratorio</FormLabel>
                                <Select
                                    value={selectedLab}
                                    onChange={(e) => setSelectedLab(e.target.value)} 
                                    width="auto" 
                                    maxWidth="300px"
                                >
                                    <option value="">Seleccionar Laboratorio</option>
                                    {labsList.map(lab => (
                                        <option key={lab.id} value={lab.id}>
                                            {lab.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                    </Box>

                    <SimpleGrid columns={1}>
                        <FormControl mb={4}>
                            <FormLabel>Observaciones</FormLabel>
                            <Textarea
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder="Ingrese observaciones..."
                                width="auto" 
                                maxWidth="300px"
                            />
                        </FormControl>
                        <Box  width="100%" padding={4}>
                            <SimpleGrid columns={1} spacing={4}>
                                <Button onClick={handleWhatsAppClick} colorScheme="teal" width="60%">WhatsApp</Button>
                                <Button onClick={handlePDFClick}colorScheme="teal" width="60%">PDF</Button>
                            </SimpleGrid>
                        </Box>
                    </SimpleGrid>
                </SimpleGrid>
            </Box>
        </Box>
    </Box>
    );
};

export default LaboratoryOrder;
