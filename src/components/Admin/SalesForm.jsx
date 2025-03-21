import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase";
import { Box, Button, FormControl, FormLabel, Input, Select,  Textarea, SimpleGrid, Heading, Alert, Divider, AlertIcon, Table, Thead, Th, Tr, Tbody, Td, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";


const SalesForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patient_id: "",
    branchs_id: "",
    date: "",
    inventario_id: "",
    lens_id: 0,
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
    pt_phone:"",
  });

  const [branches, setBranches] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTermPatients, setSearchTermPatients] = useState("");
  const [searchTermLens, setSearchTermLens] = useState("");
  const [lenss, setLenss] = useState([]);
  const [filteredLens, setFilteredLens] = useState([]);
  const [patientMeasures, setPatientMeasures] = useState([]);
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
    fetchLatestRxFinal();
    fetchData('inventario', (data) => {
      setInventario(data);
      setFilteredInventario(data);
    });
  }, []);

  useEffect(() => {
    const price = (formData.p_frame || 0) + (formData.p_lens || 0);
    setFormData((prevState) => ({
      ...prevState,
      price,
    }));
  }, [formData.p_frame, formData.p_lens]);
  
  useEffect(() => {
    const total_p_frame = (formData.p_frame || 0) - ((formData.p_frame || 0) * (formData.discount_frame || 0)) / 100;
    const total_p_lens = (formData.p_lens || 0) - ((formData.p_lens || 0) * (formData.discount_lens || 0)) / 100;
    const total = total_p_frame + total_p_lens;
  
    setFormData((prevState) => ({
      ...prevState,
      total_p_frame,
      total_p_lens,
      total,
    }));
  }, [formData.p_frame, formData.p_lens, formData.discount_frame, formData.discount_lens]);
  
  useEffect(() => {
    const credit = (formData.total || 0) - (formData.balance || 0);
    setFormData((prevState) => ({
      ...prevState,
      credit: credit,
    }));
  }, [formData.total, formData.balance]);
  
  
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
    const value = parseFloat(e.target.value) || '';  
    setFormData((prevState) => ({
      ...prevState,
      balance: value, 
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
    
      const brand = value.trim();
    
      if (!brand) {
        setSuggestions([]);
        return;
      }
    
      try {
        const { data, error } = await supabase
          .from("inventario")
          .select("id, brand, price")
          .ilike("brand", `%${brand}%`);
    
        if (error) throw error;
    
        setSuggestions(data.length > 0 ? data : []);
      } catch (err) {
        console.error("Error al obtener sugerencias:", err);
        setSuggestions([]);
      }
    };
    
    const handleSuggestionClick = (suggestion) => {
      setInputValue(suggestion.brand);
      setSuggestions([]); 
      setFormData((prevFormData) => ({
        ...prevFormData,
        inventario_id: suggestion.id,
        frame: suggestion.brand,
        p_frame: suggestion.price,
      }));
    };
    

    const fetchLatestRxFinal = async () => {
      try {
        const { data, error } = await supabase
          .from("rx_final")
          .select("*")
          .order("created_at", { ascending: false });
  
        if (error) throw error;
  
        const latestMeasuresByPatient = {};
        data.forEach((measure) => {
          if (
            !latestMeasuresByPatient[measure.patient_id] ||
            new Date(measure.created_at) >
              new Date(latestMeasuresByPatient[measure.patient_id].created_at)
          ) {
            latestMeasuresByPatient[measure.patient_id] = measure;
          }
        });
  
        const latestMeasuresArray = Object.values(latestMeasuresByPatient);
  
        setPatientMeasures(latestMeasuresArray || []);
        setFilteredMeasures([]);
      } catch (err) {
        console.error("Error fetching latest rx_final:", err);
        setError("Error al obtener los últimos datos de rx_final");
      }
    };
  
    const handlePatientSelect = (patient) => {
      const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`;
  
      setFormData((prev) => ({
        ...prev,
        patient_id: patient.id,
        pt_phone: patient.pt_phone ? patient.pt_phone.toString() : "",
      }));
  
      setSearchTermPatients(fullName);
      setFilteredPatients([]);
  
      const patientLatestMeasures = patientMeasures.filter(
        (measure) => measure.patient_id === patient.id
      );
  
      setFilteredMeasures(patientLatestMeasures);
  
      console.log("Medidas encontradas para el paciente:", patientLatestMeasures);
    };

    const handleLensSelect = (lens) => {
      const name = `${lens.lens_type}`;
      setFormData((prevState) => ({
        ...prevState,
        lens_id: lens.id, 
        p_lens: lens.lens_price, 
      }));
      setSearchTermLens(name); 
      setFilteredLens([]);
    };
    

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "pt_phone") {
      const numericValue = value.replace(/[^0-9]/g, ''); 
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.patient_id || !formData.branchs_id || !formData.date) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
  
    const formDataWithDefaults = {
      ...formData,
      discount_frame: formData.discount_frame || 0,
      discount_lens: formData.discount_lens || 0,
      total_p_frame: formData.total_p_frame || 0,
      total_p_lens: formData.total_p_lens || 0,
      p_frame: formData.p_frame || 0,
      p_lens: formData.p_lens || 0,
      total: formData.total || 0,
      credit: formData.credit || 0,
      balance: formData.balance || 0,
    };

    console.log("Datos de formulario antes de enviar:", formDataWithDefaults);
  
    try {
      const { pt_phone, ...salesDataWithoutPhone } = formDataWithDefaults;
      console.log("Datos sin teléfono para ventas:", salesDataWithoutPhone);
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .insert([salesDataWithoutPhone]);
  
      if (salesError) throw salesError;
  
      if (pt_phone) {
        console.log("Actualizando teléfono del paciente:", pt_phone);
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .update({ pt_phone })
          .eq("id", formDataWithDefaults.patient_id);
  
        if (patientError) throw patientError;
      }
  
      alert("Venta registrada y paciente actualizado exitosamente.");
      handleReset();
    } catch (error) {
      console.error("Error al procesar la operación:", error.message);
      alert("Hubo un error al procesar la operación.");
    }
  };
  
  const handleReset = () => {
    const currentPhone = formData.pt_phone;
    setFormData({
      patient_id: "",
      branchs_id: "",
      date: "",
      inventario_id: "",
      lens_id: 0,
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
      message: "",
      pt_phone: currentPhone,
    });
  };

  const generateAndUploadPDF = async (formData) => {
    const pdf = new jsPDF();

    pdf.text(`Paciente: ${formData.patient_id}`, 10, 10);
    pdf.text(`Fecha: ${formData.date}`, 10, 20);
    pdf.text(`Mensaje: ${formData.message}`, 10, 30);
    
    const pdfBlob = pdf.output("blob");
    const fileName = `sales-${formData.patient_id}-${Date.now()}.pdf`;
    const { data, error } = await supabase.storage
      .from("sales") 
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
      });
  
    if (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }

    const { publicURL, error: urlError } = supabase.storage.from("sales").getPublicUrl(fileName);
    
    if (urlError) {
      console.error("Error generating public URL:", urlError);
      throw urlError;
    }
  
    return publicURL;
  };
  
  const sendWhatsAppMessage = (phoneNumber, pdfUrl, message) => {
    const baseUrl = "https://wa.me/";
    const fullMessage = `${message}\n\nPuedes descargar tu documento aquí: ${pdfUrl}`;
    const whatsappUrl = `${baseUrl}${phoneNumber}?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, "_blank");
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

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const differenceInTime = selectedDate.getTime() - today.getTime();
    let differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
    // Contar desde mañana
    if (differenceInDays > 0) {
      differenceInDays += 1;
    }
  
    setFormData({ ...formData, delivery_time: differenceInDays });
  };
  

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
    <Box className="sales-form" display="flex" flexDirection="column" alignItems="center"  minHeight="100vh">
      <Heading mb={4}>Registrar Venta</Heading>
  
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
  
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="900px" mb={4}>
        <Button onClick={() => handleNavigate("/CashClousure")} colorScheme="teal">Consultas de Cierre</Button>
        <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
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
                type="text"
                name="pt_phone"
                value={formData.pt_phone}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Filtra caracteres
                }}
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
                name="inventario_id"
                placeholder="Ej. Armazón ..."
                value={inputValue}
                onChange={handleFrameInputChange}
              />

              {suggestions.length > 0 && (
                <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
                  {suggestions.map((item, index) => (
                    <Box
                      key={index}
                      p={2}
                      _hover={{ bg: 'teal.100', cursor: 'pointer' }}
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.brand} 
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>
            <FormControl>
              <FormLabel fontSize="lg" fontWeight="bold" color="teal.600">Entrega</FormLabel>
              <Input 
                type="date" 
                name="delivery_date" 
                onChange={handleDateChange} 
                borderColor="teal.400" 
                focusBorderColor="teal.600"
                borderRadius="md"
                p={2}
              />
              <Box 
                mt={3} 
                p={3} 
                borderWidth="1px" 
                borderRadius="md" 
                borderColor="gray.300" 
                backgroundColor="gray.50"
                textAlign="center"
              >
                <Text fontSize="md" fontWeight="medium" color="gray.700">
                  {formData.delivery_time 
                    ? `📅 Entrega en ${formData.delivery_time} días` 
                    : 'Seleccione una fecha para ver el tiempo de entrega'}
                </Text>
              </Box>
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
                  <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Escribe un mensaje personalizado..."  height="150px" minHeight="100px" />
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
                  <Input type="number" name="balance" placeholder="$130" width="auto" maxWidth="200px" value={formData.balance} onChange={handleCreditChange}/>
                </FormControl>
                <FormControl>
                  <FormLabel>Saldo</FormLabel>
                  <Input type="number" name="credir" placeholder="$20" width="auto" maxWidth="200px" value={formData.credit.toFixed(2)} isReadOnly  />
                </FormControl>
                <FormControl>
                  <FormLabel>Pago en</FormLabel>
                  <Select name="payment_in"  value={formData.payment_in}  onChange={handleChange} placeholder="Selecciona pago en" width="auto" maxWidth="200px">
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
                <Button onClick={handleWhatsAppClick} colorScheme="teal" width="60%">WhatsApp</Button>
                <Button onClick={handlePDFClick}colorScheme="teal" width="60%">PDF</Button>
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