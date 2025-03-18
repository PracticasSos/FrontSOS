import { Box, FormControl, FormLabel, Input, SimpleGrid, Select } from "@chakra-ui/react";
import { useEffect } from "react";

const Total = ({ formData, setFormData }) => {

    useEffect(() => {
        setFormData(prevFormData => {
            const newTotal = prevFormData.total || (
                prevFormData.p_frame + prevFormData.p_lens - prevFormData.discount_frame - prevFormData.discount_lens
            );
            return {
                ...prevFormData,
                total: newTotal
            };
        });
    }, [formData.p_frame, formData.p_lens, formData.discount_frame, formData.discount_lens]);
    
    
    const handleCreditChange = (e) => {
        const balance = parseFloat(e.target.value) || 0;
        const credit = (formData.total || 0) - balance; 

        setFormData((prevState) => ({
            ...prevState,
            balance,
            credit 
        }));
    };

    const total = formData.total || 0;
    const credit = formData.credit || (total - (formData.balance || 0)); 

    return (
        <SimpleGrid columns={[1]} spacing={4} width="100%" maxWidth="400px" padding={4}>
    <Box padding={4} maxWidth="400px" margin="0 auto" ml={170}>
        <SimpleGrid columns={1} spacing={4}>
            <FormControl>
                <FormLabel>Total</FormLabel>
                <Input
                    type="number"
                    name="total"
                    placeholder="$150"
                    width="auto"
                    maxWidth="200px"
                    value={total.toFixed(2)}
                    isReadOnly
                />
            </FormControl>
            <FormControl>
                <FormLabel>Abono</FormLabel>
                <Input
                    type="number"
                    name="balance"
                    width="auto"
                    maxWidth="200px"
                    value={formData.balance || ''} 
                    onChange={handleCreditChange}
                />
            </FormControl>
            <FormControl>
                <FormLabel>Saldo</FormLabel>
                <Input
                    type="number"
                    name="credit"
                    placeholder="$20"
                    width="auto"
                    maxWidth="200px"
                    value={credit.toFixed(2)} 
                    isReadOnly
                />
            </FormControl>
            <FormControl>
                <FormLabel>Pago en</FormLabel>
                <Select
                    name="payment_in"
                    value={formData.payment_in || ''}
                    onChange={(e) => setFormData(prevState => ({ ...prevState, payment_in: e.target.value }))}
                    placeholder="Selecciona pago en"
                    width="auto"
                    maxWidth="200px"
                >
                    <option value="efectivo">Efectivo</option>
                    <option value="datafast">Datafast</option>
                    <option value="transferencia">Transferencia</option>
                </Select>
            </FormControl>
        </SimpleGrid>
    </Box>
</SimpleGrid>

    );
};

export default Total;
