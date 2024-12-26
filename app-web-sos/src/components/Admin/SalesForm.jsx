import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase";
import { Box, Button, FormControl, FormLabel, Input, Select, Textarea, SimpleGrid, Heading, Alert, AlertIcon, Table, Thead, Th, Tr, Tbody, Td } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";


const SalesForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patient_id: "",
    branchs_id: "",
    date: "",
    frame: "",
    lens_id: "",
    delivery_time: "",
    p_frame: 0,
    price: 0,
    p_lens: 0,
    total: 0,
    credit: 0,
    balance: 0,
    payment_in: "",
    message: "",
  });

  const [branches, setBranches] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTermPatients, setSearchTermPatients] = useState("");
  const [searchTermLens, setSearchTermLens] = useState("");
  const [lenss, setLenss] = useState([]);
  const [filteredLens, setFilteredLens] = useState([]);
  const [patientMeasures, setPatientMeausres] = useState([]);
  const [filteredMeasures, setFilteredMeasures] = useState([]);
  const [error, setError] = useState(null); 


  useEffect(() => {
    fetchData('branchs', setBranches);
    fetchData('patients', (data) =>  {
      setPatients(data);
      setFilteredPatients(data);
    });
    fetchData('lens', (data) => {
      setLenss(data);
      setFilteredLens(data);
    });
    fetchData('rx_final', setPatientMeausres);
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
    const terms = e.target.value.toLowerCase().split(" ");
    setSearchTermPatients(e.target.value);
  
    setFilteredPatients(
      patients.filter((patient) => {
        const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`.toLowerCase();
        return terms.every((term) => 
          fullName.includes(term) || patient.pt_ci?.toLowerCase().includes(term)
        );
      })
    );
  };
    
    const handleSearchLens = (e) => {
      const terms = e.target.value.toLowerCase().split(" ");
      setSearchTermLens(e.target.value);
    
      setFilteredLens(
        lenss.filter((lenss) => {
          const name = `${lenss.lens_type}`.toLowerCase();
          return terms.every((term) => 
            name.includes(term)
          );
        })
      );
    };
 


  const handlePatientSelect = (patient) => {
    const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`;
    setFormData({ ...formData, patient_id: patient.id })
    setSearchTermPatients(fullName);
    setFilteredPatients([]);

    const measures = patientMeasures.filter(
      (measure) => measure.patient_id === patient.id
    );
    setFilteredMeasures(measures);
  };
  
  const handleLensSelect = (lenss) => {
    const name = `${lenss.lens_type}`;
    setFormData({ ...formData, lens_id: lenss.id})
    setSearchTermLens(name);
    setFilteredLens([]);
  }

  const handleSubmit = async () => {
    // Validar los campos obligatorios
    if (!formData.patient_id || !formData.branchs_id || !formData.date) {
      console.error("Campos obligatorios faltantes:", {
        patient_id: formData.patient_id,
        branchs_id: formData.branchs_id,
        date: formData.date,
      });
      alert("Por favor completa los campos obligatorios.");
      return;
    }
  
    try {
      const { data, error } = await supabase.from("sales").insert([formData]);
      if (error) {
        console.error("Error de Supabase al insertar venta:", error);
        throw error;
      }
      console.log("Venta registrada exitosamente:", data);
      alert("Venta registrada exitosamente.");
      handleReset(); 
    } catch (error) {
      console.error("Error al registrar venta:", error.message);
      alert("Hubo un error al registrar la venta.");
    }
  };
  

  const handleWhatsApp = () => {
    const phoneNumber = "593939731833";
    const message = encodeURIComponent("!Hola¡ Quiero saber sobre mi orden");
    const whatsAppUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsAppUrl, "_blank");
  }

  const handleReset = () => {
    setFormData({
      patient_id: "",
      branchs_id: "",
      date: "",
      frame: "",
      lens: "",
      delivery_time: "",
      p_frame: 0,
      p_lens: 0,
      price:0,
      total: 0,
      credit: 0,
      balance: 0,
      payment_in: "",
      message: "",
    });
  };

  const handleNavigate = (route) => navigate(route);

  return (
    <Box className="sales-form" display="flex" flexDirection="column" alignItems="center"  minHeight="100vh">
      <Heading mb={4}>Registrar Venta</Heading>
  
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
  
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
        <Button onClick={() => handleNavigate("/ConsultarCierre")} colorScheme="teal">Consultas de Cierre</Button>
        <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">Volver a Opciones</Button>
        <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
      </Box>
  
      <Box as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit();}} width="100%" maxWidth="1000px" padding={6} boxShadow="lg" borderRadius="md">
        
        <SimpleGrid columns={[1, 3]} spacing={4}>

          <FormControl id="patient-search">
            <FormLabel>Buscar Paciente</FormLabel>
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

          <FormControl id="branchs_id" isRequired>
            <FormLabel>Sucursal</FormLabel>
            <Select name="branchs_id" value={formData.branchs_id} onChange={handleChange}>
              <option value="">Seleccione una sucursal</option>
              {branches.map((branchs) => (
                <option key={branchs.id} value={branchs.id}>
                  {branchs.name || branchs.id}
                </option>
              ))}
            </Select>
          </FormControl>
          {renderInputField("Fecha", "date", "date", true)}
        </SimpleGrid>
        <Box mt = {4} mb={4}>
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
            value={
              filteredMeasures.length > 0
                ? filteredMeasures[0][`${field}_${prefix}`] || ""
                : ""
            }
            onChange={handleChange}
          />
        </Td>
      ))}
    </Tr>
  ))}
</Tbody>


           </Table>
          </Box>
        <SimpleGrid columns={[1, 2]} spacing={4}>
          {renderInputField("Armazón", "frame", "text")}
            <FormControl id="lens-search">
                <FormLabel>Buscar Lunas</FormLabel>
                  <Input
                    type="text"
                    placeholder="Buscar por tipo..."
                    value={searchTermLens}
                    onChange={handleSearchLens}
                  />
                  {searchTermLens && (
                  <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
                    {filteredLens.map((lenss) => (
                        <Box
                          key={lenss.id}
                          padding={2}
                          _hover={{ bg: "teal.100", cursor: "pointer" }}
                          onClick={() => handleLensSelect(lenss)}
                        >
                        {lenss.lens_type}
                      </Box>
                    ))}
                </Box>
                )}
            </FormControl>
          {renderSelectField("Tiempo de Entrega", "delivery_time", [
            { id: "1 día", name: "1 día" },
            { id: "2 días", name: "2 días" },
          ])}
          {renderInputField("P. Armazón", "p_frame", "number")}
          {renderInputField("P. Lunas", "p_lens", "number")}
          {renderInputField("Precio", "price", "number")}
          {renderInputField("Total", "total", "number")}
          {renderInputField("Abono", "credit", "number")}
          {renderInputField("Saldo", "balance", "number")}
          {renderSelectField("Pago en", "payment_in", [
            { id: "efectivo", name: "Efectivo" },
            { id: "datafast", name: "Datafast" },
            { id: "transferencia", name: "Transferencia"}
          ], { required: true})}
          {renderTextareaField("Mensaje", "message")}
        </SimpleGrid>
  
        <Box display="flex" justifyContent="space-around" mt={6}>
          <Button type="submit" colorScheme="teal">Guardar</Button>
          <Button onClick={handleReset} colorScheme="gray">Limpiar</Button>
          <Button onClick={handleWhatsApp} colorScheme="teal">WhatsApp</Button>
          <Button type="submit" colorScheme="teal">PDF</Button>
          <Button type="submit" colorScheme="teal">Orden de laboratorio</Button>
        </Box>
      </Box>
    </Box>
  );
  

  function renderInputField(label, name, type, isRequired = false) {
    return (
      <FormControl id={name} isRequired={isRequired}>
        <FormLabel>{label}</FormLabel>
        <Input type={type} name={name} value={formData[name]} onChange={handleChange} />
      </FormControl>
    );
  }

  function renderTextareaField(label, name) {
    return (
      <FormControl id={name}>
        <FormLabel>{label}</FormLabel>
        <Textarea name={name} value={formData[name]} onChange={handleChange} />
      </FormControl>
    );
  }

  function renderSelectField(label, name, options, isRequired = false) {
    return (
      <FormControl id={name} isRequired={isRequired}>
        <FormLabel>{label}</FormLabel>
        <Select name={name} value={formData[name]} onChange={handleChange}>
          <option value="">Seleccione {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name || option.id}
            </option>
          ))}
        </Select>
      </FormControl>
    );
  }
};

export default SalesForm;