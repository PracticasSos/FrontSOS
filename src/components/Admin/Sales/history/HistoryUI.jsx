import { useEffect, useState } from "react";
import { FormControl, FormLabel, Select, Input, Grid, GridItem, Box , Flex } from "@chakra-ui/react";
import { supabase } from "../../../../api/supabase";

const HistoryUI = ({
  frameName = "",
  lensName = "",
  total_p_frame = "",
  total_p_lens = "",
  onFormDataChange,
  initialFormData = {},
}) => {
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchData("branchs", setBranches);
  }, []);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  useEffect(() => {
    if (initialFormData.sale_id) {
      fetchSaleById(initialFormData.sale_id);
    }
  }, [initialFormData.sale_id]);

  const fetchData = async (table, setData) => {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      console.error(`Error fetching ${table}:`, error);
    } else {
      setData(data);
    }
  };

  const fetchSaleById = async (saleId) => {
    const { data, error } = await supabase
      .from("sales")
      .select("branchs_id, date")
      .eq("id", saleId)
      .single();

      

    if (error) {
      console.error("Error fetching sale data:", error);
    } else if (data) {
      const updated = {
        ...formData,
        branchs_id: data.branchs_id,
        date: data.date,
      };
      setFormData(updated);
      onFormDataChange(updated);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    onFormDataChange(updated);
  };

  const total = (parseFloat(total_p_frame) || 0) + (parseFloat(total_p_lens) || 0);
  return (
    <Box w="100%" maxW="500px" mx="auto" px={[8, 2]}>
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
        gap={3}
        w="100%"
      >
        {/* Fecha */}
        <GridItem colSpan={2}>
          <Flex
            justify="flex-end"
            align="center"
            gap={2}
            flexWrap="wrap"
          >
            <FormLabel htmlFor="date" mb="0" whiteSpace="nowrap" fontSize="sm">
              Fecha
            </FormLabel>
            <Input
              id="date"
              type="date"
              name="date"
              value={initialFormData.date || ""}
              onChange={e => onFormDataChange({ date: e.target.value })}
              w="100%"
              h="40px"
              borderRadius="full"
              fontSize="sm"
              bg="white"
              maxW={["100%", "200px"]}
            />
          </Flex>
        </GridItem>

        {/* Sucursal */}
        <GridItem colSpan={2}>
          <FormControl isRequired>
            <FormLabel fontSize="sm">Sucursal</FormLabel>
            <Select
              name="branchs_id"
              value={initialFormData.branchs_id || ""}
              onChange={handleChange}
              w="100%"
              h="40px"
              borderRadius="full"
              fontSize="sm"
              bg="white"
            >
              <option value="">Seleccione una sucursal</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name || branch.id}
                </option>
              ))}
            </Select>
          </FormControl>
        </GridItem>

        {/* Armazón y Total Armazón */}
        <GridItem>
          <FormControl>
            <FormLabel fontSize="sm">Armazón</FormLabel>
            <Input
              name="frame1"
              value={frameName}
              isReadOnly
              minW="180px"
              maxW="100px"
              h="40px"
              borderRadius="full"
              fontSize="sm"
              bg="white"
            />
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel fontSize="sm">Total</FormLabel>
            <Input
              name="total_p_frame"
              value={Number(total_p_frame ?? 0).toFixed(2)}
              isReadOnly
              w="100%"
              h="40px"
              borderRadius="full"
              fontSize="sm"
              bg="white"
            />
          </FormControl>
        </GridItem>

        {/* Lunas y Total Lunas */}
        <GridItem>
          <FormControl>
            <FormLabel fontSize="sm">Lunas</FormLabel>
            <Input
              name="lens1"
              value={lensName}
              isReadOnly
              minW="180px"
              maxW="100px"
              h="40px"
              borderRadius="full"
              fontSize="sm"
              bg="white"
            />
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel fontSize="sm">Total</FormLabel>
            <Input
              name="total_p_lens"
              value={Number(total_p_lens ?? 0).toFixed(2)}
              isReadOnly
              w="100%"
              h="40px"
              borderRadius="full"
              fontSize="sm"
              bg="white"
            />
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <Flex justify="flex-end">
            <FormControl maxW="200px" w="100%">
              <FormLabel fontSize="sm">Total</FormLabel>
              <Input
                name="total"
                value={Number(total).toFixed(2)}
                isReadOnly
                h="40px"
                borderRadius="full"
                fontSize="md"
                bg="white"
              />
            </FormControl>
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default HistoryUI;