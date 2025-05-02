import { Box, FormControl, FormLabel, Input, SimpleGrid, Select } from "@chakra-ui/react";
import { useEffect } from "react";

const Total = ({ formData, setFormData }) => {
    useEffect(() => {
        setFormData(prevFormData => {
            const total = (
                (prevFormData.total_p_frame || prevFormData.p_frame || 0) + 
                (prevFormData.total_p_lens || prevFormData.p_lens || 0)
            );
            const credit = total - (prevFormData.balance || 0);

            return {
                ...prevFormData,
                total,
                credit 
            };
        });
    }, [
        formData.p_frame, 
        formData.p_lens, 
        formData.total_p_frame, 
        formData.total_p_lens, 
        formData.balance,
    ]);
   
    const handleCreditChange = (e) => {
        const balance = parseFloat(e.target.value) || 0;
        setFormData((prevState) => ({
            ...prevState,
            balance,
            credit: (prevState.total || 0) - balance 
        }));
    };

    return (
        <SimpleGrid columns={[1]} width="100%" maxWidth="400px">
            <Box p={4}  maxWidth="400px" >
                <SimpleGrid columns={1} spacing={4}>
                    <FormControl>
                        <FormLabel>Total</FormLabel>
                        <Input
                            type="number"
                            name="total"
                            placeholder="$150"
                            width="full"
                            maxWidth="70%"
                            value={(formData.total ?? 0).toFixed(2)}
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
                            value={formData.balance === 0 ? '' : formData.balance}
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
                            value={(formData.credit ?? 0).toFixed(2)}
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
