import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase.js";
import { Box, Button, Heading, Input, Table, Tbody, Td, Th, Thead, Tr, Select, useToast} from "@chakra-ui/react";

const InventarioList = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [branches, setBranches] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchInventory();
    fetchBranches();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from("inventario")
      .select("id, price, brand, quantity, branchs_id, branchs(name)");

    if (error) {
      console.error("Error fetching inventory:", error);
    } else {
      setInventoryList(data);
    }
  };

  const fetchBranches = async () => {
    const { data, error } = await supabase.from("branchs").select("id, name");
    if (!error) {
      setBranches(data);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("inventario").delete().match({ id });
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el inventario.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Éxito",
        description: "Inventario eliminado correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchInventory();
    }
  };

  const handleEdit = (id, item) => {
    setEditingId(id);
    setEditableData(item);
  };

  const handleChange = (e, field) => {
    setEditableData({ ...editableData, [field]: e.target.value });
  };

  const handleSave = async (id) => {
    const { error } = await supabase
      .from("inventario")
      .update({
        brand: editableData.brand,
        quantity: editableData.quantity,
        price: editableData.price,
        branchs_id: editableData.branchs_id,
      })
      .match({ id });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el inventario.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Éxito",
        description: "Inventario actualizado correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditingId(null);
      fetchInventory();
    }
  };

  return (
    <Box  p={6} minHeight="100vh">
      <Heading as="h2" size="lg" mb={4} color="black">
        Lista de Inventario
      </Heading>
      <Button colorScheme="blue" onClick={() => navigate("/Register")} mr={2}>
        Registrar Inventario
      </Button>
      <Button colorScheme="gray" onClick={() => navigate("/Admin")}>
        Volver a Opciones
      </Button>
      <Input
        placeholder="Buscar por marca"
        value={search}
        onChange={handleSearchChange}
        mt={4}
        mb={4}
        bg="white"
        color="black"
      />
      <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
        <Table minWidth="800px" variant="striped" colorScheme="teal">
          <Thead bg="blue.300">
            <Tr>
              <Th color="white">Marca</Th>
              <Th color="white">Cantidad</Th>
              <Th color="white">Precio</Th>
              <Th color="white">Sucursal</Th>
              <Th color="white">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {inventoryList
              .filter((item) => item.brand.toLowerCase().includes(search.toLowerCase()))
              .map((item) => (
                <Tr
                  key={item.id}
                  onClick={(e) => {
                    if (editingId && editingId !== item.id) setEditingId(null);
                    e.stopPropagation();
                  }}
                >
                  <Td>
                    {editingId === item.id ? (
                      <Input value={editableData.brand} onChange={(e) => handleChange(e, "brand")} />
                    ) : (
                      item.brand
                    )}
                  </Td>
                  <Td>
                    {editingId === item.id ? (
                      <Input type="number" value={editableData.quantity} onChange={(e) => handleChange(e, "quantity")} />
                    ) : (
                      item.quantity
                    )}
                  </Td>
                  <Td>
                    {editingId === item.id ? (
                      <Input type="number" value={editableData.price} onChange={(e) => handleChange(e, "price")} />
                    ) : (
                      item.price
                    )}
                  </Td>
                  <Td>
                    {editingId === item.id ? (
                      <Select value={editableData.branchs_id} onChange={(e) => handleChange(e, "branchs_id")}>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </Select>
                    ) : (
                      item.branchs?.name || "N/A"
                    )}
                  </Td>
                  <Td>
                    {editingId === item.id ? (
                      <Button colorScheme="green" size="sm" onClick={() => handleSave(item.id)}>
                        Guardar
                      </Button>
                    ) : (
                      <Button colorScheme="teal" size="sm" mr={2} onClick={() => handleEdit(item.id, item)}>
                        Editar
                      </Button>
                    )}
                    <Button colorScheme="red" size="sm" onClick={() => handleDelete(item.id)}>
                      Eliminar
                    </Button>
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default InventarioList;
