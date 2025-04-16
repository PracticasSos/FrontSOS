import { Box, FormControl, FormLabel, Input, SimpleGrid, Select, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "../../../../api/supabase";

const TotalHistory = ({ saleId, formData, setFormData }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSale = async () => {
            if (!saleId) return;

            const { data, error } = await supabase
                .from("sales")
                .select("total, balance, credit, payment_in")
                .eq("id", saleId)
                .single();

            if (error) {
                console.error("Error al cargar venta:", error.message);
                toast({
                    title: "Error",
                    description: "No se pudo cargar la venta",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
                return;
            }

            setFormData(prev => ({
                ...prev,
                total: data.total || 0,
                balance: data.balance?.toString() ?? "",
                credit: data.credit || 0,
                payment_in: data.payment_in ?? "",
            }));

            setLoading(false);
        };

        fetchSale();
    }, [saleId, setFormData, toast]);

    useEffect(() => {
        const total = (formData.total_p_frame || formData.p_frame || 0) +
                      (formData.total_p_lens || formData.p_lens || 0);

        const credit = total - (parseFloat(formData.balance) || 0);

        setFormData(prevFormData => ({
            ...prevFormData,
            total,
            credit,
        }));
    }, [
        formData.p_frame,
        formData.p_lens,
        formData.total_p_frame,
        formData.total_p_lens,
        formData.balance
    ]);

    const handleCreditChange = (e) => {
        const balance = e.target.value;
        const credit = (formData.total || 0) - (parseFloat(balance) || 0);

        setFormData(prevState => ({
            ...prevState,
            balance,
            credit,
        }));
    };

    const handlePaymentChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            payment_in: e.target.value,
        }));
    };

    return (
        <SimpleGrid columns={[1]} spacing={4} width="100%" maxWidth="400px" padding={4} mx="auto">
            <Box padding={4} width="full" maxWidth="400px" mx="auto">
                <SimpleGrid columns={1} spacing={4}>
                    <FormControl>
                        <FormLabel>Total</FormLabel>
                        <Input
                            type="number"
                            name="total"
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
                            isDisabled={loading}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Saldo</FormLabel>
                        <Input
                            type="number"
                            name="credit"
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
                            onChange={handlePaymentChange}
                            placeholder="Selecciona pago en"
                            width="full"
                            maxWidth="70%"
                            isDisabled={loading}
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

export default TotalHistory;
