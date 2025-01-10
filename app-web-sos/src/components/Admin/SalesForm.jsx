import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase";
import { Box, Button, FormControl, FormLabel, Input, Select, List, ListItem, Textarea, SimpleGrid, Heading, Alert, Divider, AlertIcon, Table, Thead, Th, Tr, Tbody, Td } from "@chakra-ui/react";
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
  const [setInventario] = useState([]);
  const [setFilteredInventario] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
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
    fetchData('inventario', (data) => {
      setInventario(data);
      setFilteredInventario(data);
    });
  }, []);

  useEffect(() => {
    const total = formData.p_frame + formData.p_lens;
    setFormData({ ...formData, total });
  }, [formData.p_frame, formData.p_lens]);
  

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

    const handleFrameInputChange = async (e) => {
      const value = e.target.value;
      setInputValue(value);
  
      const [brand, color, reference] = value.split(",").map((v) => v.trim());
  
      if (brand && color && reference) {
        try {
          const { data, error } = await supabase
            .from("inventario")
            .select("brand, color, reference, price")
            .ilike("brand", `%${brand}%`)
            .ilike("color", `%${color}%`)
            .ilike("reference", `%${reference}%`);
  
          if (error || !data || data.length === 0) {
            setSuggestions([]);
            return;
          }
  
          setSuggestions(data); 
          setFormData({ ...formData, frame: `${data[0].brand}, ${data[0].color}, ${data[0].reference}`, p_frame: data[0].price });

        } catch (err) {
          console.error("Error al obtener sugerencias:", err);
        }
      } else {
        setSuggestions([]);
      }
    };
  
    const handleSuggestionClick = (suggestion) => {
      setInputValue(`${suggestion.brand}, ${suggestion.color}, ${suggestion.reference}, `);
      setSuggestions([]);
      setFormData({ ...formData, frame: `${suggestion.brand}, ${suggestion.color}, ${suggestion.reference}` });
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
    setFormData({ ...formData, p_lens: lenss.lens_price });
  }

  const handleSubmit = async () => {
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
  
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="900px" mb={4}>
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
          <Box p={5} maxWidth="800px" mx="auto">
            <SimpleGrid columns={[1, 2]} spacing={4}>
            <FormControl>
        <FormLabel>Armazón</FormLabel>
        <Input
          type="text"
          name="frame"
          placeholder="Ej. GUESS, rojo, 778, 1"
          value={inputValue} 
          onChange={handleFrameInputChange} 
          onBlur={() => {}} 
        />

        {suggestions.length > 0 && (
          <List border="1px solid #ddd" borderRadius="5px" maxHeight="200px" overflowY="auto" mt={2}>
            {suggestions.map((item, index) => (
              <ListItem
                key={index}
                padding="8px"
                cursor="pointer"
                onClick={() => handleSuggestionClick(item)} // Manejar la selección de una opción
              >
                {item.brand} - {item.color} - {item.reference}
              </ListItem>
            ))}
          </List>
        )}
      </FormControl>
              <FormControl>
                <FormLabel>Entrega</FormLabel>
                <Select name="delivery_time" placeholder="Selecciona un tiempo">
                  <option value="1 día">1 día</option>
                  <option value="2 días">2 días</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Lunas</FormLabel>
                <Input
                  type="text"
                  placeholder="Buscar por tipo..."
                  value={searchTermLens}
                  onChange={handleSearchLens}
                />
                {searchTermLens && (
                  <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
                    {filteredLens.map((lens) => (
                      <Box
                        key={lens.id}
                        p={2}
                        _hover={{ bg: 'teal.100', cursor: 'pointer' }}
                        onClick={() => handleLensSelect(lens)}
                      >
                        {lens.lens_type}
                      </Box>
                    ))}
                  </Box>
                )}
              </FormControl>
            </SimpleGrid>
            <Divider my={5} />
            <SimpleGrid columns={[1,2]}>
              <Box padding={4} maxWidth="500px"  textAlign="left"> 
              <SimpleGrid columns={[1, 2]}>
                  <FormControl>
                    <FormLabel>P. Armazón</FormLabel>
                    <Input type="number" name="p_frame" placeholder="$100"  width="auto" maxWidth="100px"  value={formData.p_frame} isReadOnly />
                  </FormControl>
                  <FormControl>
                    <FormLabel>% Descuento</FormLabel>
                    <Input type="number" name="p_frame" placeholder="-5$"  width="auto" maxWidth="100px"/>
                  </FormControl>
                  <FormControl>
                    <FormLabel>P. Lunas</FormLabel>
                    <Input type="number" name="p_lens" placeholder="$80" width="auto" maxWidth="100px" value={formData.p_lens} isReadOnly />
                  </FormControl>
                  <FormControl>
                    <FormLabel>% Descuento </FormLabel>
                    <Input type="number" name="p_lens" placeholder="-5%" width="auto" maxWidth="100px" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Precio</FormLabel>
                    <Input type="number" name="price" placeholder="$100"  width="auto" maxWidth="100px" />
                  </FormControl>
                </SimpleGrid>
              </Box>
              <Box textAlign="right"  width="400px" padding="4">
                <FormControl>
                  <FormLabel>Mensaje</FormLabel>
                  <Textarea name="message" placeholder="Escribe un mensaje personalizado..."  height="150px" minHeight="120px" />
                </FormControl>
                </Box>
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={4}>
            <Box padding={4} maxWidth="400px" margin="0 auto" ml={170} >
              <SimpleGrid columns={1} spacing={4}>
                <FormControl>
                  <FormLabel>Total</FormLabel>
                  <Input type="number" name="total" placeholder="$150" width="auto" maxWidth="200px" />
                </FormControl>
                <FormControl>
                  <FormLabel>Abono</FormLabel>
                  <Input type="number" name="credit" placeholder="$130" width="auto" maxWidth="200px" />
                </FormControl>
                <FormControl>
                  <FormLabel>Saldo</FormLabel>
                  <Input type="number" name="balance" placeholder="$20" width="auto" maxWidth="200px" />
                </FormControl>
                <FormControl>
                  <FormLabel>Pago en</FormLabel>
                  <Select name="payment_in" placeholder="Selecciona pago en" width="auto" maxWidth="200px">
                    <option value="efectivo">Efectivo</option>
                    <option value="datafast">Datafast</option>
                    <option value="transferencia">Transferencia</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>
            <Box textAlign="right" width="100%" padding={4} ml={150}>
              <SimpleGrid columns={1} spacing={4}>
                <Button type="submit" colorScheme="teal" width="60%">Guardar</Button>
                <Button onClick={handleReset} colorScheme="gray" width="60%">Limpiar</Button>
                <Button onClick={handleWhatsApp} colorScheme="teal" width="60%">WhatsApp</Button>
                <Button type="submit" colorScheme="teal" width="60%">PDF</Button>
                <Button type="submit" colorScheme="teal" width="60%">Orden de laboratorio</Button>
              </SimpleGrid>
            </Box>
          </SimpleGrid>

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