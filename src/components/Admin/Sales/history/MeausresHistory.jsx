import { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Input, Box, Heading, SimpleGrid, FormControl, FormLabel,  useToast, Button, Text} from "@chakra-ui/react";
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
    <Box mt={4} mb={4} px={[1, 2]}>
      <Box display={{ base: "none", lg: "block" }}  mb={4}>
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
                  {['OD', 'OI'].map((eye) => {
                    const prefix = eye === 'OD' ? 'right' : 'left';
                    return (
                      <Box
                        key={eye}
                        mb={6}
                        p={4}
                      >
                        <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={4}>
                          {eye === 'OD' ? 'Ojo Derecho (OD)' : 'Ojo Izquierdo (OI)'}
                        </Text>
      
                        <SimpleGrid columns={3} spacing={3}>
                          {[
                            { label: 'Esfera', name: 'sphere' },
                            { label: 'Cilindro', name: 'cylinder' },
                            { label: 'Eje', name: 'axis' },
                            { label: 'Prisma', name: 'prism' },
                            { label: 'AV VL', name: 'av_vl' },
                            { label: 'AV VP', name: 'av_vp' },
                            { label: 'ADD', name: 'add' },
                            { label: 'ALT', name: 'alt' },
                            { label: 'DNP', name: 'dnp' },
                          ].map(({ label, name }) => (
                            <FormControl key={name}>
                              <FormLabel fontSize="xs" color="gray.500" mb={1}>
                                {label}
                              </FormLabel>
                              <Input
                                name={`${name}_${prefix}`}
                                value={formData[`${name}_${prefix}`]}
                                onChange={handleChange}
                                
                                borderRadius="full"
                                bg="gray.100"
                                textAlign="center"
                               
                              />
                            </FormControl>
                          ))}
                        </SimpleGrid>
                      </Box>
                    );
                  })}
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
