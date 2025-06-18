import { Box, FormControl, FormLabel, Input, SimpleGrid, Select, useToast, Img, Text } from "@chakra-ui/react";
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

    const isSelected = (method) => formData.payment_in === method;

    return (
    <Box w="100vw" display="flex" justifyContent="center" alignItems="center">
      <Box
        w="100%"
        maxW="1000px"
        px={[2, 4, 6]}
        transform={{
          base: "scale(0.8)",
          sm: "scale(0.9)",
          md: "scale(0.95)",
          lg: "scale(1)",
        }}
        transformOrigin="top center"
      >
        <Box display="flex" flexDirection="column" alignItems="center" p={4}>
          <SimpleGrid columns={[3, 3]} spacing={4} mb={6}>
            {[
              { src: "/assets/efectivo.jpg",  value: "efectivo" },
              { src: "/assets/transferencia.jpg", value: "transferencia" },
              { src: "/assets/datafast.jpg", value: "datafast" },
            ].map(({ src, alt, value }) => (
              <Box
                key={value}
                border={isSelected(value) ? "4px solid #3182CE" : "2px solid transparent"}
                borderRadius="md"
                overflow="hidden"
                cursor="pointer"
                onClick={() => handleImageSelect(value)}
                transition="all 0.2s"
              >
                <Img
                  src={src}
                  alt={alt}
                  boxSize={["140px", "180px", "200px", "250px"]}
                  objectFit="cover"
                  mx="auto"
                />
                <Text textAlign="center" mt={1} fontWeight="semibold">
                  {alt}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          {!formData.payment_in && (
            <Box color="red.500" fontSize="sm" mb={4}>
              Debes seleccionar un método de pago.
            </Box>
          )}

          <Box w="100%" maxW="250px" mx="auto">
            <SimpleGrid columns={1} spacing={4}>
              <FormControl>
                <FormLabel>Total</FormLabel>
                <Input
                  type="number"
                  name="total"
                  placeholder="$150"
                  height="45px"
                  borderRadius="full"
                  value={Number(formData.total || 0).toFixed(2)}
                  isReadOnly
                  bg="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Abono</FormLabel>
                <Input
                  type="number"
                  bg="white"
                  name="balance"
                  height="45px"
                  borderRadius="full"
                  value={formData.balance === 0 || formData.balance === '0' ? '' : formData.balance ?? ''}
                  onChange={handleCreditChange}
                  placeholder="Abono"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Saldo</FormLabel>
                <Input
                  type="number"
                  name="credit"
                  bg="white"
                  placeholder="$20"
                  borderRadius="full"
                  height="45px"
                  value={(formData.credit ?? 0).toFixed(2)}
                  isReadOnly
                />
              </FormControl>
            </SimpleGrid>
          </Box>
        </Box>
      </Box>
    </Box>
    );
};

export default TotalHistory;
