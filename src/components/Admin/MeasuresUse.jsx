import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase";
import { Box, Button, FormControl, Input, SimpleGrid, Heading, Alert, AlertIcon, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const MeasuresUse = () => {
    const navigate = useNavigate ();

    const [formData, setFormData] = useState({
        patient_id: "",
        sphere_right: "",
        cylinder_right:"",
        axis_right: "",
        prism_right:"",
        add_right:"",
        av_vl_right:"",
        av_vp_right:"",
        dnp_right:"",
        alt_right:"",
        sphere_left:"",
        cylinder_left:"",
        axis_left:"",
        prism_left:"",
        add_left:"",
        av_vl_left:"",
        av_vp_left:"",
        dnp_left:"",
        alt_left:"",
    });

    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState ([]);
    const [searchTermPatients, setSearchTermPatients] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData('patients', data => {
            setPatients(data);
            setFilteredPatients(data);
        });
    }, []);

    const fetchData = async (table, setter) => {
        try {
            const { data, error } = await supabase.from(table).select("*");
            if (error) throw error;
            setter(data);
        } catch (err) {
            console.error(`Error fetching ${table}:`, err);
            setError(`Error al obtener los datos de ${table}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearchPatients = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchTermPatients(searchTerm);

        setFilteredPatients(
            patients.filter((patient) => {
              const fullname = `${patient.pt_firstname} ${patient.pt_lastname}`.toLowerCase();
              return fullname.includes(searchTerm) || patient.pt_ci?.toLowerCase().includes(searchTerm);
            })
          );
        };

    const handlePatientSelect = (patient) => {
        const fullname = `${patient.pt_firstname} ${patient.pt_lastname}`;
        setFormData({ ...formData, patient_id: patient.id });
        setSearchTermPatients(fullname);
        setFilteredPatients([]);     
    };

    const handleSubmit = async () => {
        if (!formData.patient_id) {
            alert ("Por favor completa los campos obligatorios.");
            return;
        }
        try {
            const { data, error } = await supabase.from("rx_uso").insert([formData]);
            if (error) throw error;
            console.log("Medidas registradas:", data);
            alert("Medidas registradas exitosamente.");
        } catch (error) {
            console.error("Error al registrar medidas:", error.message);
            alert("Hubo un error al registar la venta.");
        }
    };

    const handleNavigate = (route) => navigate (route);

    return (
        <Box className="register-measure" display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
            <Heading mb={4}>Registrar Medidas en Uso</Heading>
            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon/>
                    {error}
                </Alert>
            )}

            <Box display="flex" justifyContent="space-between" gap={4} width="100%" maxWidth="800px" mb={4}>
                <Button onClick={() => handleNavigate("/ConsultarCierre")} colorScheme="teal">Consultar Medidas</Button>
                <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">Volver a Opciones</Button>
                <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
            </Box>
            <Box as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit();}} width="100%" maxWidth="1300px" padding={6} boxShadow="lg" borderRadius="md">
                <SimpleGrid columns={[1, 2]} spacing={4}>
                    <FormControl id="patient-search">
                        <Input type="text" placeholder="Buscar por nombre..." value={searchTermPatients} onChange={handleSearchPatients}/>
                        {searchTermPatients && (
                            <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
                                {filteredPatients.map((patient) => (
                                    <Box key={patient.id} padding={2} _hover={{ bg: "teal.100", cursor: "pointer" }} onClick={() => handlePatientSelect(patient)}>
                                        {patient.pt_firstname} {patient.pt_lastname}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </FormControl>
                </SimpleGrid>
                <Table variant="simple" mb={4}>
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
                        <Tr>
                        <Td>OD</Td>
                        <Td><Input name="sphere_right" value={formData.sphere_right} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="cylinder_right" value={formData.cylinder_right} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="axis_right" value={formData.axis_right} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="prism_right" value={formData.prism_right} onChange={handleChange} placeholder="0"  /></Td>
                        <Td><Input name="add_right" value={formData.add_right} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="av_vl_right" value={formData.av_vl_right} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="av_vp_right" value={formData.av_vp_right} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="dnp_right" value={formData.dnp_right} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="alt_right" value={formData.alt_right} onChange={handleChange} placeholder="0" /></Td>
                        </Tr>
                    </Tbody>
                    <Tbody>
                        <Tr>
                        <Td>OI</Td>
                        <Td><Input name="sphere_left" value={formData.sphere_left} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="cylinder_left" value={formData.cylinder_left} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="axis_left" value={formData.axis_left} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="prism_left" value={formData.prism_left} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="add_left" value={formData.add_left} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="av_vl_left" value={formData.av_vl_left} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="av_vp_left" value={formData.av_vp_left} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="dnp_left" value={formData.dnp_left} onChange={handleChange} placeholder="0" /></Td>
                        <Td><Input name="alt_left" value={formData.alt_left} onChange={handleChange} placeholder="0" /></Td>
                        </Tr>
                    </Tbody>
                </Table>
                <SimpleGrid columns={2} spacing={4} mt={4}>
                    <Button colorScheme="green" onClick={handleSubmit}>GUARDAR</Button>
                    <Button colorScheme="red">ELIMINAR</Button>
                </SimpleGrid>
            </Box>
        </Box>
    );
};

export default MeasuresUse;
