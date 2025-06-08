import { Box, FormControl, FormLabel, Input, SimpleGrid, Select, Img, Grid, GridItem, Flex } from "@chakra-ui/react";
import { useEffect } from "react";

const Total = ({ formData, setFormData }) => {
    useEffect(() => {
  setFormData(prevFormData => {
    const totalFrame = prevFormData.total_p_frame > 0
      ? prevFormData.total_p_frame
      : prevFormData.p_frame || 0;

    const totalLens = prevFormData.total_p_lens > 0
      ? prevFormData.total_p_lens
      : prevFormData.p_lens || 0;

    const total = Number(totalFrame) + Number(totalLens);

    // Si balance es vacío, usa 0
    const balance = prevFormData.balance === '' ? 0 : parseFloat(prevFormData.balance);
    const credit = isNaN(balance) ? total : total - balance;

    return {
      ...prevFormData,
      total,
      credit,
    };
  });
}, [
  formData.p_frame,
  formData.p_lens,
  formData.total_p_frame,
  formData.total_p_lens,
]);

const handleCreditChange = (e) => {
  const value = e.target.value;
  if (value === '' || /^\d*\.?\d*$/.test(value)) {
    setFormData({
      balance: value,
      credit: (formData.total || 0) - (parseFloat(value) || 0),
    });
  }
};



    return (
  <Box
    w="100vw"
    display="flex"
    justifyContent="center"
    alignItems="center"
  >
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
          <Img
            src="/assets/efectivo.jpg"
            alt="Efectivo"
            boxSize={["140px", "180px", "200px", "250px"]}
            objectFit="cover"
            mx="auto"
            borderRadius="md"
          />
          <Img
            src="/assets/transferencia.jpg"
            alt="Transferencia"
            boxSize={["140px", "180px", "200px", "250px"]}
            objectFit="cover"
            mx="auto"
            borderRadius="md"
          />
          <Img
            src="/assets/datafast.jpg"
            alt="Datafast"
            boxSize={["140px", "180px", "200px", "250px"]}
            objectFit="cover"
            mx="auto"
            borderRadius="md"
          />
        </SimpleGrid>

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

            <FormControl isRequired isInvalid={!formData.payment_in}>
              <FormLabel>Pago en</FormLabel>
              <Select
                name="payment_in"
                borderRadius="full"
                height="45px"
                bg="white"
                value={formData.payment_in || ''}
                onChange={(e) =>
                  setFormData({
                    payment_in: e.target.value,
                  })
                }
                placeholder="Selecciona pago en"
              >
                <option value="efectivo">Efectivo</option>
                <option value="datafast">Datafast</option>
                <option value="transferencia">Transferencia</option>
              </Select>
              {!formData.payment_in && (
                <Box color="red.500" fontSize="sm" mt={1}>
                  Este campo es obligatorio.
                </Box>
              )}
            </FormControl>
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  </Box>
);
};

export default Total;
