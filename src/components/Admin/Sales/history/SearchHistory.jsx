import { useEffect, useState } from "react";
import { SimpleGrid, FormControl, FormLabel, Input, Box, Select } from "@chakra-ui/react";
import { supabase } from "../../../../api/supabase";

const SearchHistory = ({ onFormDataChange, initialFormData = {} }) => {
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchData("branchs", setBranches);
    }, []);

    useEffect(() => {
        if (initialFormData.sale_id) {
            fetchSaleById(initialFormData.sale_id);
        }
    }, [initialFormData.sale_id]);

    useEffect(() => {
        if (onFormDataChange && Object.keys(formData).length > 0) {
            const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
            if (hasChanges) {
                onFormDataChange(formData);
                updateSaleData();
            }
        }
    }, [formData]);

    const fetchData = async (table, setData) => {
        const { data, error } = await supabase.from(table).select("*");
        if (error) console.error(`Error fetching ${table}:`, error);
        else setData(data);
    };

    const fetchSaleById = async (id) => {
        const { data, error } = await supabase
            .from("sales")
            .select("*, patients (pt_firstname, pt_lastname, pt_phone)")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching sale:", error);
        } else if (data) {
            const updatedData = {
                sale_id: data.id,
                patient_id: data.patient_id,
                pt_phone: data.pt_phone || data.patients?.pt_phone || "",
                branchs_id: data.branchs_id,
                date: data.date,
                patient_name: `${data.patients?.pt_firstname || ""} ${data.patients?.pt_lastname || ""}`,
            };
            setFormData(updatedData);
            onFormDataChange && onFormDataChange(updatedData);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === "pt_phone" ? value.replace(/[^0-9]/g, "") : value;
        setFormData((prev) => ({
            ...prev,
            [name]: newValue || null,
        }));
    };

    const hasChanges = (currentData, originalData) => {
        return (
            currentData.branchs_id !== originalData.branchs_id ||
            currentData.date !== originalData.date ||
            currentData.pt_phone !== originalData.pt_phone
        );
    };

    const updateSaleData = async () => {
        if (hasChanges(formData, initialFormData)) {
            if (formData.sale_id) {
                const { error: saleError } = await supabase
                    .from("sales")
                    .update({
                        branchs_id: formData.branchs_id,
                        date: formData.date,
                    })
                    .eq("id", formData.sale_id);
        
                if (saleError) {
                    console.error("Error updating sale:", saleError);
                } else {
                    console.log("Venta actualizada correctamente");
                }
            }
        
            if (formData.patient_id && formData.pt_phone !== initialFormData.pt_phone) {
                const { error: patientError } = await supabase
                    .from("patients")
                    .update({
                        pt_phone: formData.pt_phone, 
                    })
                    .eq("id", formData.patient_id);
        
                if (patientError) {
                    console.error("Error updating patient phone:", patientError);
                } else {
                    console.log("Teléfono del paciente actualizado correctamente");
                }
            }
        } else {
            console.log("No hay cambios para guardar");
        }
    };

    return (
        <SimpleGrid columns={[1, 4]} spacing={4}>
            <FormControl>
                <FormLabel>Nombre del Paciente</FormLabel>
                <Input value={formData.patient_name || "No disponible"} isReadOnly />
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Sucursal</FormLabel>
                <Select name="branchs_id" value={formData.branchs_id || ""} onChange={handleChange}>
                    <option value="">Seleccione una sucursal</option>
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name || branch.id}
                        </option>
                    ))}
                </Select>
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Fecha</FormLabel>
                <Input type="date" name="date" value={formData.date || ""} onChange={handleChange} />
            </FormControl>

            <FormControl>
                <FormLabel>Teléfono</FormLabel>
                <Input
                    type="text"
                    name="pt_phone"
                    value={formData.pt_phone || ""}
                    onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ""))}
                    onChange={handleChange}
                />
            </FormControl>
        </SimpleGrid>
    );
};

export default SearchHistory;
