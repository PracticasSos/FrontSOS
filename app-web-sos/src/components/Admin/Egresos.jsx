import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  Badge,
  SimpleGrid,
  Input,
} from "@chakra-ui/react";

const Egresos = () => {
  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [users, setUsers] = useState([]);
  const [labs, setLabs] = useState([]);
  const [newEgreso, setNewEgreso] = useState({
    user_id: "",
    lab_id: "",
    value: "",
    payment_in: "",
    specification: "",
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
      .select(`id, date, value, specification, payment_in, users (firstname), labs (name)`)
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
    const { error } = await supabase.from("egresos").insert({
      ...newEgreso,
      date: new Date().toISOString().split("T")[0],
      branchs_id: selectedBranch,
    });

    if (error) {
      console.error("Error saving egreso:", error);
      return;
    }

    setNewEgreso({ user_id: "", lab_id: "", value: "", payment_in: "", specification: "" });
    fetchEgresos();
  };

  return (
    <Box p={6} maxW="1300px" mx="auto" boxShadow="md" borderRadius="lg" bg="gray.50">
      <Heading mb={4} textAlign="center" size="lg" color="teal.500">
        Egresos - {branches.find((b) => b.id === selectedBranch)?.name || "Seleccione Sucursal"}
      </Heading>

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
