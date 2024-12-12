import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase";
import { Box, Button, FormControl, Input, SimpleGrid, Heading, Alert, AlertIcon, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const RegisterMeasures = () => {
    const navigate = useNavigate ();

    const [formData, setFormData] = useState({
        patient_id: "",
        sphere_right: "",
        cylinder_right:"",
        axis_right: "",
        prism_right:"",
        add_right:"",
        av_vl_right:"",
        dnp_right:"",
        alt_right:"",
        sphere_left:"",
        cylinder_left:"",
        axis_left:"",
        prims_left:"",
        add_left:"",
        av_vl_left:"",
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
              return fullname.includes(searchTerm);
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
            <Heading mb={4}>Registrar Medidas</Heading>
            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon/>
                    {error}
                </Alert>
            )}

            <Box display="flex" justifyContent="space-between" gap={4} width="100%" maxWidth="800px" mb={4}>
                <Button onClick={() => handleNavigate("/ConsultarCierre")} colorScheme="teal">Consultas de Cierre</Button>
                <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">Volver a Opciones</Button>
                <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
            </Box>
            <Box as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit();}} width="100%" maxWidth="800px" padding={6} boxShadow="lg" borderRadius="md">
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
                            <Th>DNP</Th>
                            <Th>ALT</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                        <Td>CD</Td>
                        <Td><Input name="sphere_right" value={formData.sphere_right} onChange={handleChange} /></Td>
                        <Td><Input name="cylinder_right" value={formData.cylinder_right} onChange={handleChange} /></Td>
                        <Td><Input name="axis_right" value={formData.axis_right} onChange={handleChange} /></Td>
                        <Td><Input name="prism_right" value={formData.prism_right} onChange={handleChange} /></Td>
                        <Td><Input name="add_right" value={formData.add_right} onChange={handleChange} /></Td>
                        <Td><Input name="av_vl_right" value={formData.av_vl_right} onChange={handleChange} /></Td>
                        <Td><Input name="dnp_right" value={formData.dnp_right} onChange={handleChange} /></Td>
                        <Td><Input name="alt_right" value={formData.alt_right} onChange={handleChange} /></Td>
                        </Tr>
                    </Tbody>
                </Table>
                <SimpleGrid columns={2} spacing={4} mt={4}>
                    <Button colorScheme="green" onClick={handleSubmit}>GUARDAR</Button>
                    <Button colorScheme="blue">MODIFICAR</Button>
                    <Button colorScheme="yellow">ACTUALIZAR</Button>
                    <Button colorScheme="red">ELIMINAR</Button>
                </SimpleGrid>
            </Box>
        </Box>
    );
};

export default RegisterMeasures;
