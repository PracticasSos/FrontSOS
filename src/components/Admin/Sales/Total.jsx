import { Box, FormControl, FormLabel, Input, SimpleGrid, Select } from "@chakra-ui/react";
import { useEffect } from "react";

const Total = ({ formData, setFormData }) => {
    useEffect(() => {
        setFormData(prevFormData => {
            const total = (
                (prevFormData.total_p_frame || prevFormData.p_frame || 0) + 
                (prevFormData.total_p_lens || prevFormData.p_lens || 0)
            );

            return {
                ...prevFormData,
                total: total
            };
        });
    }, [
        formData.p_frame, 
        formData.p_lens, 
        formData.total_p_frame, 
        formData.total_p_lens
    ]);
   
    const handleCreditChange = (e) => {
        const balance = parseFloat(e.target.value) || 0;
        const credit = (balance === 0) ? (formData.total || 0) : (formData.total || 0) - balance;
        setFormData((prevState) => ({
            ...prevState,
            balance,
            credit
        }));
    };

    const total = formData.total || 0;
    const credit = formData.credit || (formData.balance === 0 ? total : (total - (formData.balance || 0)));

    return (
        <SimpleGrid columns={[1]} spacing={4} width="100%" maxWidth="400px" padding={4} mx="auto">
            <Box padding={4} width="full" maxWidth="400px" mx="auto">
                <SimpleGrid columns={1} spacing={4}>
                    <FormControl>
                        <FormLabel>Total</FormLabel>
                        <Input
                            type="number"
                            name="total"
                            placeholder="$150"
                            width="full"
                            maxWidth="70%"
                            value={total.toFixed(2)}
                            isReadOnly
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Abono</FormLabel>
                        <Input
                            type="number"
                            name="balance"
                            width="full"
                            maxWidth="70%"
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
                            width="full"
                            maxWidth="70%"
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
                            width="full"
                            maxWidth="70%"
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