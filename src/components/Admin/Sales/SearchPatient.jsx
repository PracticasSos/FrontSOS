import { useEffect, useState } from "react";
import { SimpleGrid, FormControl, FormLabel, Input, Box, Select } from "@chakra-ui/react";
import { supabase } from "../../../api/supabase"; 

const SearchPatient = ({ onFormDataChange, initialFormData = {} }) => {
    const [branches, setBranches] = useState([]);
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [formData, setFormData] = useState(initialFormData);  

    useEffect(() => {
        fetchData('branchs', setBranches);
        fetchPatients();
    }, []);

    useEffect(() => {
        if (onFormDataChange && Object.keys(formData).length > 0) {
            const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
            if (hasChanges) {
                onFormDataChange(formData);
            }
        }
    }, [formData]); 

    const fetchData = async (table, setData) => {
        const { data, error } = await supabase
            .from(table)
            .select('*');
        
        if (error) {
            console.error(`Error fetching ${table}:`, error);
        } else {
            setData(data);
        }
    };

    const fetchPatients = async () => {
        const { data, error } = await supabase
            .from('patients')
            .select('id, pt_firstname, pt_lastname, pt_ci, pt_phone');
        
        if (error) {
            console.error('Error fetching patients:', error);
        } else {
            setPatients(data);
            setFilteredPatients(data);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);

        const filtered = patients.filter(patient => {
            const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`.toLowerCase();
            return fullName.includes(value) || patient.pt_ci?.toLowerCase().includes(value);
        });

        setFilteredPatients(filtered);
    };

    const handlePatientSelect = (patient) => {
        const fullName = `${patient.pt_firstname} ${patient.pt_lastname}`;

        setFormData((prev) => ({
            ...prev,
            patient_id: patient.id,
            pt_phone: patient.pt_phone ? patient.pt_phone.toString() : "",
        }));

        setSearch(fullName);
        setFilteredPatients([]);

        if (onFormDataChange) {
            onFormDataChange({
                ...formData,
                patient_id: patient.id,
                pt_phone: patient.pt_phone ? patient.pt_phone.toString() : "",
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "pt_phone") {
            const numericValue = value.replace(/[^0-9]/g, ''); 
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue || null,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const renderInputField = (label, name, type, isRequired = false) => (
        <FormControl id={name} isRequired={isRequired}>
            <FormLabel>{label}</FormLabel>
            <Input
                type={type}
                name={name}
                value={formData[name] || ""}
                onChange={handleChange}
            />
        </FormControl>
    );

    return (
        <SimpleGrid columns={[1, 4]} spacing={4}>
            <FormControl id="patient-search">
                <FormLabel>Buscar Paciente</FormLabel>
                <Input 
                    type="text" 
                    placeholder="Buscar por nombre..." 
                    value={search} 
                    onChange={handleSearchChange} 
                />
                {search && (
                    <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
                        {filteredPatients.map((patient) => (
                            <Box 
                                key={patient.id} 
                                padding={2} 
                                _hover={{ bg: "teal.100", cursor: "pointer" }} 
                                onClick={() => handlePatientSelect(patient)}
                            >
                                {patient.pt_firstname} {patient.pt_lastname}
                            </Box>
                        ))}
                    </Box>
                )}
            </FormControl>
            <FormControl id="branchs_id" isRequired>
                <FormLabel>Sucursal</FormLabel>
                <Select 
                    name="branchs_id" 
                    value={formData.branchs_id || ""} 
                    onChange={handleChange}
                >
                    <option value="">Seleccione una sucursal</option>
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name || branch.id}
                        </option>
                    ))}
                </Select>
            </FormControl>
            {renderInputField("Fecha", "date", "date", true)}
            <FormControl>
                <FormLabel>Teléfono</FormLabel>
                <Input
                    type="text"
                    name="pt_phone"
                    value={formData.pt_phone || ""}
                    onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    onChange={handleChange} 
                />
            </FormControl>
        </SimpleGrid>
    );
};

export default SearchPatient;