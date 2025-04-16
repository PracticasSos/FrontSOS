import { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Input, Box, Heading, SimpleGrid, FormControl, FormLabel,  useToast, Button} from "@chakra-ui/react";
import { supabase } from "../../../../api/supabase";

const fields = ["sphere", "cylinder", "axis", "prism", "add", "av_vl", "av_vp", "dnp", "alt"];


const MeasuresHistory = ({ saleId, onFormDataChange, initialFormData = {} }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [measureId, setMeasureId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const toast = useToast(); 

  useEffect(() => {
    const fetchMeasureIdFromSale = async () => {
      if (!saleId) return;

      const { data, error } = await supabase
        .from("sales")
        .select("measure_id")
        .eq("id", saleId)
        .single();

      if (error) {
        console.error("Error al obtener measure_id:", error);
      } else {
        setMeasureId(data.measure_id);
      }
    };

    fetchMeasureIdFromSale();
  }, [saleId]);

  useEffect(() => {
    const fetchRxData = async () => {
      if (!measureId) return;

      const { data, error } = await supabase
        .from("rx_final")
        .select("*")
        .eq("id", measureId)
        .single();

      if (error) {
        console.error("Error al obtener datos de medida:", error);
      } else {
        const updatedFormData = {};
        fields.forEach(field => {
          ["right", "left"].forEach(side => {
            const key = `${field}_${side}`;
            updatedFormData[key] = data[key] || "";
          });
        });
        setFormData(updatedFormData);
      }
    };

    fetchRxData();
  }, [measureId]);

  useEffect(() => {
    if (onFormDataChange && Object.keys(formData).length > 0) {
      onFormDataChange(formData);
    }
    const changed = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasChanges(changed);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateRxData = async () => {
    if (!measureId || !hasChanges) return;

    const { error } = await supabase
      .from("rx_final")
      .update(formData)
      .eq("id", measureId);

    if (error) {
      console.error("Error al actualizar las medidas:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar las medidas.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Medidas actualizadas",
        description: "Las medidas se han guardado correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setHasChanges(false);
    }
  };

  return (
    <Box mt={4} mb={4}>
      <Box display={{ base: "none", lg: "block" }} overflowX="auto" mb={4}>
        <Table variant="simple" mb={4}>
          <Thead>
            <Tr>
              <Th>Rx Final</Th>
              {fields.map(field => <Th key={field}>{field.toUpperCase()}</Th>)}
            </Tr>
          </Thead>
          <Tbody>
            {[
              { side: "OD", prefix: "right" },
              { side: "OI", prefix: "left" },
            ].map(({ side, prefix }) => (
              <Tr key={prefix}>
                <Td>{side}</Td>
                {fields.map((field) => (
                  <Td key={field}>
                    <Input
                      name={`${field}_${prefix}`}
                      value={formData[`${field}_${prefix}`] || ""}
                      onChange={handleChange}
                      fontSize={{ base: "sm", md: "md" }}
                    />
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box display={{ base: "block", lg: "none" }} mb={4}>
        {["OD", "OI"].map((eye) => (
          <Box key={eye} mb={6} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
            <Heading size="md" mb={3}>
              {eye === "OD" ? "Ojo Derecho (OD)" : "Ojo Izquierdo (OI)"}
            </Heading>
            <SimpleGrid columns={2} spacing={3}>
              {fields.map((field) => {
                const name = `${field}_${eye === "OD" ? "right" : "left"}`;
                return (
                  <FormControl key={name}>
                    <FormLabel fontSize="sm">{field.toUpperCase()}</FormLabel>
                    <Input
                      name={name}
                      value={formData[name] || ""}
                      onChange={handleChange}
                      size="sm"
                    />
                  </FormControl>
                );
              })}
            </SimpleGrid>
          </Box>
        ))}
      </Box>

      <Box mt={4} textAlign="center">
        <Button onClick={updateRxData} isDisabled={!hasChanges} colorScheme="blue">
          Actualizar Medidas
        </Button>
      </Box>
    </Box>
  );
};

export default MeasuresHistory;
