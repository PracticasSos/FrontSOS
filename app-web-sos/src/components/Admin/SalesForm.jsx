import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase";
import { Box, Button, FormControl, FormLabel, Input, Select, List, ListItem, Textarea, SimpleGrid, Heading, Alert, Divider, AlertIcon, Table, Thead, Th, Tr, Tbody, Td } from "@chakra-ui/react";
import { Form, useNavigate } from "react-router-dom";


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
    discount_frame: 0, 
    discount_lens: 0,
    total_p_frame:0,
    total_p_lens:0,
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
  const [inventario, setInventario] = useState([]);
  const [filteredInventario, setFilteredInventario] = useState([]);
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
    const price = formData.p_frame + formData.p_lens;
    setFormData((prevState) => ({
      ...prevState,
      price, 
    }));
  }, [formData.p_frame, formData.p_lens]);
  
  useEffect(() => {
    const total_p_frame = formData.p_frame - (formData.p_frame * formData.discount_frame) / 100;
    const total_p_lens = formData.p_lens - (formData.p_lens * formData.discount_lens) / 100;
    const total = total_p_frame + total_p_lens;
    
    setFormData((prevState) => ({
      ...prevState,
      total_p_frame,
      total_p_lens,
      total,
    }));
  }, [formData.p_frame, formData.p_lens, formData.discount_frame, formData.discount_lens]);

  useEffect(() => {
    const balance = formData.total - formData.credit;
    setFormData((prevState) => ({
      ...prevState,
      balance: balance,
    }));
  }, [formData.total, formData.credit]);
  
  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
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
  
  const handleCreditChange = (e) => {
    const value = parseFloat(e.target.value) || 0;  
    setFormData((prevState) => ({
      ...prevState,
      credit: value, 
    }));
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
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, pt_phone')
      if ( error ) {
        console.error('Error fetching patients:', error);
      } else {
      setPatients(data);
      setFilteredPatients(data);
      }
    }

    const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearch(value);
  
      const filtered = patients.filter(patient =>
        `${patient.pt_phone}`
          .toLowerCase()
          .includes(value.toLowerCase())
      );
  
      setFilteredPatients(filtered);
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
          setFormData((prevState) => ({
            ...prevState,
            frame: `${data[0].brand}, ${data[0].color}, ${data[0].reference}`,
            p_frame: data[0].price,
          }));
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
      setFormData((prev) => ({
        ...prev,
        patient_id: patient.id,
        pt_phone: patient.pt_phone || '', // Establecer número de teléfono inicial
      }));
      setSearchTermPatients(fullName);
      setFilteredPatients([]);
    
      const measures = patientMeasures.filter(
        (measure) => measure.patient_id === patient.id
      );
      setFilteredMeasures(measures);
    };
  
  const handleLensSelect = (lenss) => {
    const name = `${lenss.lens_type}`;
    setFormData((prevState) => ({
      ...prevState,
      lens_id: lenss.id,
      p_lens: lenss.lens_price,
    }));
    setSearchTermLens(name);
    setFilteredLens([]);
    setFormData({ ...formData, p_lens: lenss.lens_price });
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.patient_id || !formData.branchs_id || !formData.date) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
  
    try {
      // Insertar en la tabla "sales"
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .insert([formData]);
  
      if (salesError) throw salesError;
  
      // Actualizar el número de teléfono en la tabla "patients"
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .update({ pt_phone: formData.pt_phone })
        .eq("id", formData.patient_id);
  
      if (patientError) throw patientError;
  
      alert("Venta registrada y paciente actualizado exitosamente.");
      handleReset();
    } catch (error) {
      console.error("Error al procesar la operación:", error.message);
      alert("Hubo un error al procesar la operación.");
    }
  };

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
      discount_frame: 0, 
      discount_lens: 0,
      total_p_frame:0,
      total_p_lens:0,
      payment_in: "",
      pt_phone: "",
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
        
        <SimpleGrid columns={[1, 4]} spacing={4}>
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
          <FormControl>
              <FormLabel>Teléfono</FormLabel>
              <Input
                type="number"
                name="pt_phone"
                value={formData.pt_phone}
                onChange={(e) => handleChange(e)} 
              />
          </FormControl>
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
          placeholder="Ej. venetti, rojo, 778, 1"
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
                onClick={() => handleSuggestionClick(item)} 
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
            <SimpleGrid columns={[1,3]}>
              <Box padding={4} maxWidth="500px"  textAlign="left"> 
              <SimpleGrid columns={[1, 2]}>
                  <FormControl>
                    <FormLabel>P. Armazón</FormLabel>
                    <Input type="number" name="p_frame" placeholder="$100"  width="auto" maxWidth="100px"  value={formData.p_frame.toFixed(2)} isReadOnly />
                  </FormControl>
                  <FormControl>
                    <FormLabel>% Descuento</FormLabel>
                    <Input type="number" name="discount_frame" value={formData.discount_frame}  width="auto" maxWidth="100px" onChange={handleDiscountChange}/>
                  </FormControl>
                  <FormControl>
                    <FormLabel>P. Lunas</FormLabel>
                    <Input type="number" name="p_lens" placeholder="$80" width="auto" maxWidth="100px" value={formData.p_lens.toFixed(2)} isReadOnly />
                  </FormControl>
                  <FormControl>
                    <FormLabel>% Descuento</FormLabel>
                    <Input type="number" name="discount_lens" value={formData.discount_lens}  width="auto" maxWidth="100px"  onChange={handleDiscountChange}/>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Precio</FormLabel>
                    <Input type="number" name="price" placeholder="$100"  width="auto" maxWidth="100px" value={formData.price} readOnly/>
                  </FormControl>
                </SimpleGrid>
              </Box>
              <Box padding={4} maxWidth="500px" >
              <SimpleGrid column={1}>
                <FormControl >
                  <FormLabel>Total P. Armazón</FormLabel>
                  <Input
                    type="number" name="total_p_frame" width="auto" maxWidth="100px" value={formData.total_p_frame.toFixed(2)} isReadOnly/>
                </FormControl>
                <FormControl >
                  <FormLabel>Total P. Lunas</FormLabel>
                  <Input
                    type="number" name="total_p_lens" width="auto" maxWidth="100px" value={formData.total_p_lens.toFixed(2)} isReadOnly/>
                </FormControl>
              </SimpleGrid>
              </Box>

              <Box textAlign="right"  width="350px" padding="4">
                <FormControl>
                  <FormLabel>Mensaje</FormLabel>
                  <Textarea name="message" placeholder="Escribe un mensaje personalizado..."  height="150px" minHeight="100px" />
                </FormControl>
                </Box>
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={4}>
            <Box padding={4} maxWidth="400px" margin="0 auto" ml={170} >
              <SimpleGrid columns={1} spacing={4}>
                <FormControl>
                  <FormLabel>Total</FormLabel>
                  <Input type="number" name="total" placeholder="$150" width="auto" maxWidth="200px" value={formData.total.toFixed(2)} isReadOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Abono</FormLabel>
                  <Input type="number" name="credit" placeholder="$130" width="auto" maxWidth="200px" value={formData.credit} onChange={handleCreditChange}/>
                </FormControl>
                <FormControl>
                  <FormLabel>Saldo</FormLabel>
                  <Input type="number" name="balance" placeholder="$20" width="auto" maxWidth="200px" value={formData.balance.toFixed(2)} isReadOnly />
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
                <Button type= "submit" colorScheme="teal" width="60%">WhatsApp</Button>
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