import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Table,
    Tr,
    Td,
    Th,
    Thead,
    Tbody,
    Badge,
    Heading,
    Grid,
  } from "@chakra-ui/react";
  import { useNavigate } from "react-router-dom";
  import { useEffect, useState } from "react";
  import { supabase } from "../../api/supabase.js";
  
  const CashClousure = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [branchs, setBranchs] = useState([]);
    const [formData, setFormData] = useState({
      branch: "",
      since: "",
      till: "",
      month: "",
      responsible: "",
      cash_value: 0,
      transferred_value: 0,
      data_value: 0,
      cash: 0,
      transfer: 0,
      data_fast: 0,
      total: 0,
    });
  
    useEffect(() => {
      fetchBranchs();
    }, []);
  
    const fetchBranchs = async () => {
      const { data, error } = await supabase.from("branchs").select("name");
  
      if (error) {
        console.error("Error fetching branchs:", error);
        return;
      }
      setBranchs(data || []);
    };
  
    const handleBranchChange = async (event) => {
      const branchId = event.target.value;
      setSelectedBranch(branchId);
  
      if (branchId) {
        await fetchDailyRecords(branchId);
        await fetchExpenses(branchId);
      } else {
        resetData();
      }
    };
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: name.includes("_value") || name.includes("cash") || name === "total" ? Number(value) : value,
      });
    };
  
    const handleNavigate = (route) => {
      navigate(route);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!formData.branch || !formData.since || !formData.till || !formData.responsible) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
      }
  
      const { data, error } = await supabase.from("cash_clousure").insert([formData]);
  
      if (error) {
        console.error("Error:", error.message);
        alert("Ocurrió un error al registrar el cierre de caja. Por favor, inténtalo nuevamente.");
      } else {
        console.log("Cierre de caja registrado:", data);
        alert("¡Cierre de caja registrado con éxito!");
      }
    };
  
    return (
        <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
            <Heading mb={4} textAlign="center" size="lg" color="teal.500">
                Consultar Cierre - {branchs.find((b) => b.id === selectedBranch)?.name || "Seleccione una Sucursal"}
            </Heading>
            <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={4} 
                mb={6} 
                justifyItems="center" 
            >
                <Button onClick={() => handleNavigate("/ConsultarCierre")} colorScheme="teal" width="auto" maxWidth="200px">
                    Consultas de Cierre
                </Button>
                <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue" width="auto" maxWidth="200px">
                    Volver a Opciones
                </Button>
                <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red" width="auto" maxWidth="200px">
                    Cerrar Sesión
                </Button>
            </Grid>
            <Box as="form" onSubmit={handleSubmit}>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={6}>
                <FormControl isRequired>
                    <FormLabel>Óptica</FormLabel>
                    <Select placeholder="Seleccione una sucursal" value={selectedBranch} onChange={handleBranchChange}>
                    {branchs.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                        {branch.name}
                        </option>
                    ))}
                    </Select>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Mes</FormLabel>
                    <Select name="month" value={formData.month} onChange={handleChange}>
                    <option value="">Seleccione un mes</option>
                    <option value="Diciembre">Diciembre</option>
                    <option value="Enero">Enero</option>
                    <option value="Febrero">Febrero</option>
                    <option value="Marzo">Marzo</option>
                    <option value="Abril">Abril</option>
                    <option value="Mayo">Mayo</option>
                    <option value="Junio">Junio</option>
                    <option value="Julio">Julio</option>
                    <option value="Agosto">Agosto</option>
                    <option value="Septiembre">Septiembre</option>
                    <option value="Octubre">Octubre</option>
                    <option value="Noviembre">Noviembre</option>
                    </Select>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Desde</FormLabel>
                    <Input type="date" name="since" value={formData.since} onChange={handleChange} />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Hasta</FormLabel>
                    <Input type="date" name="till" value={formData.till} onChange={handleChange} />
                </FormControl>
                </Grid>

                <Table variant="striped" colorScheme="teal">
                <Thead>
                    <Tr>
                    <Th>Orden</Th>
                    <Th>Fecha</Th>
                    <Th>Sucursal</Th>
                    <Th>Nombre</Th>
                    <Th>Apellido</Th>
                    <Th>Armazón</Th>
                    <Th>Luna</Th>
                    <Th isNumeric>Total</Th>
                    <Th>Abono</Th>
                    <Th>Saldo</Th>
                    <Th>Pago</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {records.map((record) => (
                    <Tr key={record.id}>
                        <Td>{record.id}</Td>
                        <Td>{record.date}</Td>
                        <Td>{record.branchName}</Td>
                        <Td>{record.firstName}</Td>
                        <Td>{record.lastName}</Td>
                        <Td>{record.frame}</Td>
                        <Td>{record.lens}</Td>
                        <Td isNumeric>{record.total}</Td>
                        <Td>{record.credit}</Td>
                        <Td>{record.balance}</Td>
                        <Td>
                        <Badge
                            colorScheme={
                            record.payment_in === "efectivo"
                                ? "green"
                                : record.payment_in === "transferencia"
                                ? "blue"
                                : "orange"
                            }
                        >
                            {record.payment_in}
                        </Badge>
                        </Td>
                    </Tr>
                    ))}
                </Tbody>
                </Table>

                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mt={6}>
                <FormControl display="flex" justifyContent="center">
                    <FormLabel>EFEC</FormLabel>
                    <Input
                    type="number"
                    name="cash"
                    value={formData.cash}
                    onChange={handleChange}
                    width="auto"
                    maxWidth="150px" 
                    />
                </FormControl>

                <FormControl display="flex" justifyContent="center">
                    <FormLabel>TRANS</FormLabel>
                    <Input
                    type="number"
                    name="transfer"
                    value={formData.transfer}
                    onChange={handleChange}
                    width="auto"
                    maxWidth="150px" 
                    />
                </FormControl>

                <FormControl display="flex" justifyContent="center">
                    <FormLabel>DATAFAST</FormLabel>
                    <Input
                    type="number"
                    name="data_fast"
                    value={formData.data_fast}
                    onChange={handleChange}
                    width="auto"
                    maxWidth="150px" 
                    />
                </FormControl>
                </Grid>

                <FormControl isRequired mt={6} display="flex" justifyContent="center">
                    <FormLabel>Total</FormLabel>
                    <Input
                        type="number"
                        name="total"
                        value={formData.total}
                        onChange={handleChange}
                        width="auto"
                        maxWidth="150px" 
                    />
                </FormControl>

                <Button type="submit" colorScheme="blue" width="auto" maxWidth="200px" mt={6}>
                    Registrar Cierre
                </Button>
            </Box>
        </Box>       
    );
};
  
  export default CashClousure;
  