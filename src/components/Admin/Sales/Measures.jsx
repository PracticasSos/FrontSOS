import { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Input, Box , Heading, SimpleGrid, FormControl, FormLabel} from "@chakra-ui/react";

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

    return (
        <Box mt={4} mb={4}>
          <Box display={{ base: "none", lg: "block" }} overflowX="auto" mb={4}>
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
                      {['OD', 'OI'].map((eye) => (
                        <Box key={eye} mb={6} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                          <Heading size="md" mb={3}>{eye === 'OD' ? 'Ojo Derecho (OD)' : 'Ojo Izquierdo (OI)'}</Heading>
                          <SimpleGrid columns={2} spacing={3}>
                            <FormControl>
                              <FormLabel fontSize="sm">Esfera</FormLabel>
                              <Input 
                                name={`sphere_${eye === 'OD' ? 'right' : 'left'}`} 
                                value={formData[`sphere_${eye === 'OD' ? 'right' : 'left'}`]} 
                                onChange={handleChange}
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Cilindro</FormLabel>
                              <Input 
                                name={`cylinder_${eye === 'OD' ? 'right' : 'left'}`} 
                                value={formData[`cylinder_${eye === 'OD' ? 'right' : 'left'}`]} 
                                onChange={handleChange}
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Eje</FormLabel>
                              <Input 
                                name={`axis_${eye === 'OD' ? 'right' : 'left'}`} 
                                value={formData[`axis_${eye === 'OD' ? 'right' : 'left'}`]} 
                                onChange={handleChange}
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Prisma</FormLabel>
                              <Input 
                                name={`prism_${eye === 'OD' ? 'right' : 'left'}`} 
                                value={formData[`prism_${eye === 'OD' ? 'right' : 'left'}`]} 
                                onChange={handleChange}
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">ADD</FormLabel>
                              <Input 
                                name={`add_${eye === 'OD' ? 'right' : 'left'}`} 
                                value={formData[`add_${eye === 'OD' ? 'right' : 'left'}`]} 
                                onChange={handleChange}
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">AV VL</FormLabel>
                              <Input 
                                name={`av_vl_${eye === 'OD' ? 'right' : 'left'}`} 
                                value={formData[`av_vl_${eye === 'OD' ? 'right' : 'left'}`]} 
                                onChange={handleChange}
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">AV VP</FormLabel>
                              <Input 
                                name={`av_vp_${eye === 'OD' ? 'right' : 'left'}`} 
                                value={formData[`av_vp_${eye === 'OD' ? 'right' : 'left'}`]} 
                                onChange={handleChange}
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">DNP</FormLabel>
                              <Input 
                                name={`dnp_${eye === 'OD' ? 'right' : 'left'}`} 
                                value={formData[`dnp_${eye === 'OD' ? 'right' : 'left'}`]} 
                                onChange={handleChange}
                                size="sm"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">ALT</FormLabel>
                              <Input 
                                name={`alt_${eye === 'OD' ? 'right' : 'left'}`} 
                                value={formData[`alt_${eye === 'OD' ? 'right' : 'left'}`]} 
                                onChange={handleChange}
                                size="sm"
                              />
                            </FormControl>
                          </SimpleGrid>
                        </Box>
                      ))}
                    </Box>
              
        </Box>
      );      
};

export default Measures;
