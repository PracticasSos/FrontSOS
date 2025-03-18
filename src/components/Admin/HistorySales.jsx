import { Box, useToast, Button, FormControl, FormLabel, Input, Select,  Textarea, SimpleGrid, Heading, Alert, Divider, AlertIcon, Table, Thead, Th, Tr, Tbody, Td, Text } from "@chakra-ui/react";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";

const HistorySales = () => {
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editableData, setEditableData] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        const { data, error } = await supabase
            .from('sales')
            .select('*');
        if (error) {
            toast({ title: 'Error', description: 'Error al obtener las ventas', status: 'error' });
        } else {
            setSales(data);
        }
    };

    const handleEdit = (sale) => {
        setEditingId(sale.id);
        setEditableData(sale);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableData((prev) => ({ ...prev, [name]: value }));
    };
     const handleSave = async (id) => {
        const { error } = await supabase.from('sales').update(editableData).match({ id });
        if (!error) {
            toast({ title: 'Éxito', description: 'Venta actualizada correctamente.', status: 'success' });
            setEditingId(null);
            fetchSales();
        } else {
            toast({ title: 'Error', description: 'No se pudo actualizar la venta.', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('sales').delete().match({ id });
        if (!error) {
            toast({ title: 'Éxito', description: 'Venta eliminada correctamente.', status: 'success' });
            fetchSales();
        } else {
            toast({ title: 'Error', description: 'No se pudo eliminar la venta.', status: 'error' });
        }
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
                <Button onClick={() => handleNavigate("/ListSales")} colorScheme="teal">Consultar Lista</Button>
                <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
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
                      </SimpleGrid>
                    </Box>
                  </SimpleGrid>
                </Box>
              </Box>
            </Box>
    );

}