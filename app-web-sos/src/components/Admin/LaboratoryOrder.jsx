import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate } from "react-router-dom";
import { Box, Heading, Button, FormControl, FormLabel, Input, Table, Thead, Tbody, Tr, Th, Td, Textarea, Select, SimpleGrid } from "@chakra-ui/react";

const LaboratoryOrder = () => {
    const [salesList, setSalesList] = useState([]);
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

    const handleNavigate = (route) => {
        navigate(route);
    };

    useEffect(() => {
        fetchLabs();
        fetchPatients();
        fetchLens();
    }, []);

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

    const fetchPatients = async () => {
        const { data, error } = await supabase
            .from('patients')
            .select('id, pt_firstname, pt_lastname, pt_ci');
        if (error) {
            console.error('Error fetching patients:', error);
        } else {
            setPatientsList(data);
        }
    };

    const fetchSales = async (patientId) => {
        const { data, error } = await supabase
            .from('sales')
            .select(`
                id, 
                date, 
                frame, 
                lens:lens_id(lens_type), 
                branchs:branchs_id(name)
            `)
            .eq('patient_id', patientId)
            .order('date', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error fetching sales:', error);
        } else {
            setSalesList(data);
            setSelectedSale(data[0]); 
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
      

    const handlePatientSelect = async (patient) => {
        setSelectedPatient(patient);
        setSearchTerm(`${patient.pt_firstname} ${patient.pt_lastname}`);

        const { data: rxData, error: rxError } = await supabase
            .from('rx_final')
            .select('*')
            .eq('patient_id', patient.id);

        if (rxError) {
            console.error('Error fetching measures:', rxError);
        } else {
            setFilteredMeasures(rxData);
        }

        await fetchSales(patient.id);
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
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()); // Filtra por nombre y apellido
    });

    return (
        <Box className="sales-form" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
        <Heading as="h2" size="lg" mb={4}>Orden de Laboratorio</Heading>
        <Box display="flex" justifyContent="space-between" width="100%" maxWidth="900px" mb={4}>
            <Button onClick={() => handleNavigate("/ConsultarCierre")} colorScheme="teal">Consultas de Cierre</Button>
            <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">Volver a Opciones</Button>
            <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
        </Box>
        <Box as="form" width="100%" maxWidth="1000px" padding={6} boxShadow="lg" borderRadius="md">
           
            <FormControl id="patient-search" mb={4}>
                <FormLabel>Buscar Paciente</FormLabel>
                <Input
                    type="text"
                    placeholder="Buscar por nombre, apellido o cédula..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </FormControl>

            {searchTerm && !selectedPatient && (
                <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
                    {filteredPatients.map((patient) => (
                        <Box
                            key={patient.id}
                            padding={2}
                            _hover={{ bg: "teal.100", cursor: "pointer" }}
                            onClick={() => handlePatientSelect(patient)} 
                        >
                            {patient.pt_firstname} {patient.pt_lastname}
                        </Box>
                    ))}
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
                                    value={selectedSale?.branchs?.name || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Paciente</FormLabel>
                                <Input 
                                    type="text" 
                                    value={selectedPatient ? `${selectedPatient.pt_firstname} ${selectedPatient.pt_lastname}` : ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Fecha</FormLabel>
                                <Input 
                                    type="text" 
                                    value={selectedSale?.date || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                                <FormLabel>Armazón</FormLabel>
                                <Input 
                                    type="text" 
                                    value={selectedSale?.frame || ""}
                                    isReadOnly
                                    width="auto" 
                                    maxWidth="300px"
                                />
                            </FormControl>
                            <FormControl mb={4}>
                            <FormLabel>Tipo de Lentes</FormLabel>
                            <Input
                                type="text"
                                value={selectedSale?.lens?.lens_type || ""}
                                onChange={handleLensChange}
                                onFocus={handleInputFocus} 
                                placeholder="Escribe para buscar..."
                            />
                            {isTyping && selectedSale?.lens?.lens_type?.trim()?.length > 0 && (
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
                                    lens.lens_type.toLowerCase().includes(selectedSale.lens.lens_type.toLowerCase())
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
