import { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Input, Box } from "@chakra-ui/react";

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
                                    />
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default Measures;
