import { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Input, Box , Heading, SimpleGrid, FormControl, FormLabel, Text, useColorModeValue} from "@chakra-ui/react";

const Measures = ({ initialFormData = {}, onFormDataChange, filteredMeasures = [] }) => {
    const [formData, setFormData] = useState(initialFormData);
    
    useEffect(() => {
        if (filteredMeasures.length > 0) {
            const measureData = filteredMeasures[0];
            const updatedFormData = { ...formData };

            const fields = [
                "sphere", "cylinder", "axis", "prism", "add", "av_vl", "av_vp", "dnp", "alt"
            ];
            
            fields.forEach(field => {
                ["right", "left"].forEach(side => {
                    const key = `${field}_${side}`;
                    if (measureData[key] !== undefined) {
                        updatedFormData[key] = measureData[key];
                    }
                });
            });
            
            setFormData(updatedFormData);

            if (onFormDataChange && JSON.stringify(updatedFormData) !== JSON.stringify(initialFormData)) {
                onFormDataChange(updatedFormData); 
            }
        }
    }, [filteredMeasures, initialFormData, onFormDataChange]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

  const boxBg = useColorModeValue('gray.100', 'gray.700');
  const boxColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectBg = useColorModeValue('white', 'gray.600');

    return (
        <Box mt={4} mb={4} px={[1, 2]} >
          <Box display={{ base: "none", lg: "block" }}  mb={4}>
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
                              : formData[`${field}_${prefix}`] || ""
                          }
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
                          bg={selectBg}
          borderColor={borderColor}
          color={textColor}
          _hover={{
            borderColor: useColorModeValue('gray.300', 'gray.500')
          }}
          _focus={{
            borderColor: useColorModeValue('blue.500', 'blue.300'),
            boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
          }}
                          textAlign="center"
                         
                        />
                      </FormControl>
                    ))}
                  </SimpleGrid>
                </Box>
              );
            })}
      </Box>     
    </Box>
  );      
};

export default Measures;
