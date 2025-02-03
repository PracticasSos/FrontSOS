import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import { useNavigate} from "react-router-dom";
import {Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Select, Button, Badge, SimpleGrid, Input, Grid} from "@chakra-ui/react";

const Egresos = () => {
  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [labs, setLabs] = useState([]);
   const navigate = useNavigate();
  const [newEgreso, setNewEgreso] = useState({
    user_id: "",
    records: "",
    lab_id: "",
    value: 0,
    payment_in: "",
    specification: "",
    branchs_id: ""
  });

  useEffect(() => {
    fetchBranches();
    fetchUsers();
    fetchLabs();
  }, []);

  useEffect(() => {
    if (selectedBranch) fetchEgresos();
  }, [selectedBranch]);

  const fetchBranches = async () => {
    const { data, error } = await supabase.from("branchs").select("id, name");
    if (error) {
      console.error("Error fetching branches:", error);
      return;
    }
    setBranches(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("id, firstname");
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setUsers(data || []);
  };

  const fetchLabs = async () => {
    const { data, error } = await supabase.from("labs").select("id, name");
    if (error) {
      console.error("Error fetching labs:", error);
      return;
    }
    setLabs(data || []);
  };


  const fetchEgresos = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("egresos")
      .select(`id, records,  date, value, specification, payment_in, users (firstname), labs (name), branchs (name)`)
      .eq("date", today)
      .eq("branchs_id", selectedBranch);

    if (error) {
      console.error("Error fetching egresos:", error);
      return;
    }
    setRecords(data || []);
  };

  const handleInputChange = (field, value) => {
    setNewEgreso((prev) => ({ ...prev, [field]: value }));
  };


  const handleSaveEgreso = async () => {
    console.log("Selected Branch for newEgreso:", newEgreso.branchs_id);
  
    if (!newEgreso.branchs_id) {
      alert("Por favor, seleccione una sucursal para guardar el egreso.");
      return;
    }
  
    const { data, error } = await supabase.from("egresos").insert({
      ...newEgreso,
      date: new Date().toISOString().split("T")[0],
    });
  
    if (error) {
      console.error("Error saving egreso:", error);
      return;
    } else {
      console.log('Egresos registrados:', data);
      alert("¡Egresos registrado con éxito!");
    }
  
    setNewEgreso({
      user_id: "",
      records: "",
      lab_id: "",
      branchs_id: "", 
      value: 0,
      payment_in: "",
      specification: "",
    });
    fetchEgresos();
  };
  
  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
      <Heading mb={4} textAlign="center" size="lg" color="teal.500">
        Egresos - {branches.find((b) => b.id === selectedBranch)?.name || "Seleccione Sucursal"}
      </Heading>
      <Box mb={6} display="flex" justifyContent="center" >
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="900px" mb={4}>
        <Button onClick={() => handleNavigate("/PatientRecords")} colorScheme="teal">Cierre Diario</Button>
        <Button onClick={() => handleNavigate("/Admin")} colorScheme="blue">Volver a Opciones</Button>
        <Button onClick={() => handleNavigate("/LoginForm")} colorScheme="red">Cerrar Sesión</Button>
      </Box>
      </Box>
      <Box mb={6}>
        <Select
          placeholder="Seleccione una sucursal"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
      </Box>

      <Table variant="striped" colorScheme="teal" mb={6}>
        <Thead>
          <Tr>
            <Th>Orden</Th>
            <Th>Fecha</Th>
            <Th>Encargado</Th>
            <Th>Laboratorio</Th>
            <Th>Valor</Th>
            <Th>Especificación</Th>
            <Th>Sucursal</Th>
            <Th>Pago</Th>
          </Tr>
        </Thead>
        <Tbody>
          {records.map((record) => (
            <Tr key={record.id}>
              <Td>{record.id}</Td>
              <Td>{record.date}</Td>
              <Td>{record.users?.firstname || "Sin encargado"}</Td>
              <Td>{record.labs?.name || "Sin laboratorio"}</Td>
              <Td>{record.value}</Td>
              <Td>{record.specification}</Td>
              <Td>{record.branchs?.name || "Sin Sucursal"}</Td>
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

      <Heading size="md" color="teal.500" mb={4}>
        Agregar Nuevo Egreso
      </Heading>

      <SimpleGrid columns={[1, 2]} spacing={4} mb={6}>
        <Select
          placeholder="Seleccione Encargado"
          value={newEgreso.user_id}
          onChange={(e) => handleInputChange("user_id", e.target.value)}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstname}
            </option>
          ))}
        </Select>

        <Select
          placeholder="Seleccione Laboratorio"
          value={newEgreso.lab_id}
          onChange={(e) => handleInputChange("lab_id", e.target.value)}
        >
          {labs.map((lab) => (
            <option key={lab.id} value={lab.id}>
              {lab.name}
            </option>
          ))}
        </Select>

        <Select
          placeholder="Seleccione una sucursal"
          value={newEgreso.branchs_id}
          onChange={(e) => handleInputChange("branchs_id", e.target.value)}
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>


        <Input
          placeholder="Valor"
          type="number"
          value={newEgreso.value}
          onChange={(e) => handleInputChange("value", e.target.value)}
        />

        <Select
          placeholder="Método de Pago"
          value={newEgreso.payment_in}
          onChange={(e) => handleInputChange("payment_in", e.target.value)}
        >
          <option value="efectivo">Efectivo</option>
          <option value="datafast">Datafast</option>
          <option value="transferencia">Transferencia</option>
        </Select>

        <Input
          placeholder="Especificación"
          value={newEgreso.specification}
          onChange={(e) => handleInputChange("specification", e.target.value)}
        />
      </SimpleGrid>

      <Button colorScheme="teal" onClick={handleSaveEgreso}>
        Guardar Egreso
      </Button>
    </Box>
  );
};

export default Egresos;
