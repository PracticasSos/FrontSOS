import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase";
import { Box, Button, FormControl, Input, SimpleGrid, Heading, Alert, AlertIcon, Table, Thead, Tbody, Tr, Th, Td, Textarea, RadioGroup, Radio, Stack, Checkbox, Text} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const MeasuresFinal = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patient_id: "",
    sphere_right: 0,
    cylinder_right: 0,
    axis_right: 0,
    prism_right: 0,
    add_right: 0,
    av_vl_right: 0,
    av_vp_right: 0,
    dnp_right: 0,
    alt_right: 0,
    sphere_left: 0,
    cylinder_left: 0,
    axis_left: 0,
    prism_left: 0,
    add_left: 0,
    av_vl_left: 0,
    av_vp_left: 0,
    dnp_left: 0,
    alt_left: 0,
  });

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTermPatients, setSearchTermPatients] = useState("");
  const [error, setError] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [nearVision, setNearVision] = useState("Aprobado");
  const [needsLensesNear, setNeedsLensesNear] = useState(false);
  const [farVision, setFarVision] = useState("20/20");
  const [needsLensesFar, setNeedsLensesFar] = useState(false);
  const [colorPerception, setColorPerception] = useState(true);
  const [colorPerceptionDiferentation, setColorPerceptionDiferentation ] = useState(true);
  const [colorIssues, setColorIssues] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase.from("patients").select("*");
      if (error) throw error;
      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Error al obtener los datos de pacientes");
    }
  };

  const handleSave = () => {
    const data = {
      diagnosis,
      nearVision,
      needsLensesNear,
      farVision,
      needsLensesFar,
      colorPerception,
      colorIssues,
    };
    console.log("Datos guardados:", data);
    alert("Datos guardados exitosamente");
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
        return (
          fullname.includes(searchTerm) ||
          patient.pt_ci?.toLowerCase().includes(searchTerm)
        );
      })
    );
  };

  const handlePatientSelect = (patient) => {
    setFormData({ ...formData, patient_id: patient.id });
    setSearchTermPatients(`${patient.pt_firstname} ${patient.pt_lastname}`);
    setFilteredPatients([]);
  };

  const handleSubmit = async () => {
    if (!formData.patient_id) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
    try {
      const { data, error } = await supabase.from("rx_uso").insert([formData]);
      if (error) throw error;
      console.log("Medidas registradas:", data);
      alert("Medidas registradas exitosamente.");
    } catch (error) {
      console.error("Error al registrar medidas:", error.message);
      alert("Hubo un error al registrar las medidas.");
    }
  };

  const handleNavigate = (route) => navigate(route);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
      <Heading mb={4}>Registrar Medidas Finales</Heading>
        {error && (
            <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
            </Alert>
        )}
      <Box display="flex" justifyContent="space-between" gap={4} width="100%" maxWidth="800px" mb={4} >
        <Button onClick={() => handleNavigate("/ConsultarCierre")} colorScheme="teal" >
          Consultar Medidas
        </Button>
        <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">
          Volver a Opciones
        </Button>
        <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">
          Cerrar Sesión
        </Button>
      </Box>
      <Box as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} width="100%" maxWidth="1300px" padding={6} boxShadow="lg" borderRadius="md">
        <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
          <FormControl id="patient-search">
            <Input type="text" placeholder="Buscar por nombre..." value={searchTermPatients} onChange={handleSearchPatients} />
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
                      value={formData[`${field}_${prefix}`]}
                      onChange={handleChange}
                    />
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Box p={6} maxWidth="1000px" margin="0 auto" border="1px solid #ccc" borderRadius="8px">
            <Heading size="md" mb={4}>
                Su diagnóstico es:
            </Heading>
            <Textarea
                placeholder="Escriba el diagnóstico del paciente"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                mb={4}
            />

            <Box mb={6}>
                <Heading size="sm" mb={2}>
                    Visión cercana
                </Heading>
                <Text mb={2}>Capacidad de leer como mínimo, las letras de la escala 1 de la carta normalizada Jaeger, las letras TIMES ROMAN tamaño 4.5 o equivalente, a una distancia no inferior a 30 cm.</Text>
                <RadioGroup value={nearVision} onChange={setNearVision} mb={2}>
                    <Stack direction="row">
                        <Radio value="Aprobado">Aprobado</Radio>
                        <Radio value="No Aprobado">No Aprobado</Radio>
                    </Stack>
                </RadioGroup>
                <Checkbox
                    isChecked={needsLensesNear}
                    onChange={(e) => setNeedsLensesNear(e.target.checked)}
                >
                Precisa lentes
                </Checkbox>
            </Box>

            <Box mb={6}>
                <Heading size="sm" mb={2}>
                    Visión lejana
                </Heading>
                <RadioGroup value={farVision} onChange={setFarVision} mb={2}>
                    <Stack direction="row">
                        <Radio value="20/20">
                        Mayor o igual a 20/20 en la escala SNELLEN
                        </Radio>
                        <Radio value="Menor a 20/20">Menor a 20/20</Radio>
                    </Stack>
                </RadioGroup>
                <Checkbox
                isChecked={needsLensesFar}
                onChange={(e) => setNeedsLensesFar(e.target.checked)}
                >
                Precisa lentes
                </Checkbox>
            </Box>

            <Box mb={6}>
                <Heading size="sm" mb={2}>
                    Percepción de colores
                </Heading>
                <Checkbox
                    isChecked={colorPerception}
                    onChange={(e) => setColorPerception(e.target.checked)}
                >
                    Ha demostrado capacidad para distinguir y diferenciar los colores.
                </Checkbox>
            </Box>

            <Box mb={6}>
                <Checkbox
                    isChecked={colorPerceptionDiferentation}
                    onChange={(e) => setColorPerceptionDiferentation(e.target.checked)}
                >
                    Tiene problemas para distinguir o diferenciar los siguientes colores.
                </Checkbox>
                    {!colorPerception && (
                        <Input
                            placeholder="Especifique los colores con los que tiene problemas"
                            value={colorIssues}
                            onChange={(e) => setColorIssues(e.target.value)}
                            mt={2}
                        />
                    )}
            </Box>

            <Stack direction="row" spacing={4}>
                <Button colorScheme="teal" onClick={handleSave}>GUARDAR</Button>
                <Button colorScheme="red">ELIMINAR</Button>
            </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default MeasuresFinal;
