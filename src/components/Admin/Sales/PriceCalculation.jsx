import { useState, useEffect } from "react";
import { Box, FormControl, FormLabel, Input, Textarea, SimpleGrid } from "@chakra-ui/react";

const PriceCalculation = ({ formData, setFormData }) => {
    const [calculatedData, setCalculatedData] = useState({
        p_frame: 0,
        p_lens: 0,
        discount_frame: 0,
        discount_lens: 0,
        total_p_frame: 0,
        total_p_lens: 0,
        totalP: 0,
        balance: 0,
        credit: 0,
        price: 0,
        message: ""
    });

    useEffect(() => {
        setCalculatedData(prevState => ({
            ...prevState,
            p_frame: formData.p_frame || 0,
            p_lens: formData.p_lens || 0
        }));
    }, [formData]);

    useEffect(() => {
        const price = (calculatedData.p_frame || 0) + (calculatedData.p_lens || 0);
        setCalculatedData(prevState => ({ ...prevState, price }));
    }, [calculatedData.p_frame, calculatedData.p_lens]);

    useEffect(() => {
        const total_p_frame = calculatedData.p_frame - (calculatedData.p_frame * (parseFloat(calculatedData.discount_frame) || 0) / 100);
        const total_p_lens = calculatedData.p_lens - (calculatedData.p_lens * (parseFloat(calculatedData.discount_lens) || 0) / 100);
        const totalP = total_p_frame + total_p_lens;
        setCalculatedData(prevState => ({ ...prevState, total_p_frame, total_p_lens, totalP }));
        setFormData((prevState) => ({
            ...prevState,
            p_frame: calculatedData.p_frame,
            p_lens: calculatedData.p_lens,
            discount_frame: calculatedData.discount_frame,
            discount_lens: calculatedData.discount_lens,
            total_p_frame,
            total_p_lens,
            total: totalP,
            price: calculatedData.price,
        }));
    }, [calculatedData.p_frame, calculatedData.p_lens, calculatedData.discount_frame, calculatedData.discount_lens, setFormData]);

    const handleDiscountChange = (e) => {
        const { name, value } = e.target;
        setCalculatedData(prevState => ({ ...prevState, [name]: value }));
    };

    return (
        <SimpleGrid columns={[1, 2]} spacing={6}>
          <Box padding={4}>
            <SimpleGrid columns={[1, 2]} spacing={4}>
              <FormControl>
                <FormLabel>P. Armazón</FormLabel>
                <Input type="number" name="p_frame" width="auto" maxWidth="100px" value={calculatedData.p_frame.toFixed(2)} readOnly />
              </FormControl>
              <FormControl>
                <FormLabel>%Dto</FormLabel>
                <Input type="number" name="discount_frame" value={calculatedData.discount_frame || ""} width="auto" maxWidth="100px" onChange={handleDiscountChange} />
              </FormControl>
              <FormControl>
                <FormLabel>P. Lunas</FormLabel>
                <Input type="number" name="p_lens" width="auto" maxWidth="100px" value={calculatedData.p_lens.toFixed(2)} readOnly />
              </FormControl>
              <FormControl>
                <FormLabel>%Dto</FormLabel>
                <Input type="number" name="discount_lens" value={calculatedData.discount_lens || ""} width="auto" maxWidth="100px" onChange={handleDiscountChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Precio</FormLabel>
                <Input type="number" name="price" width="auto" maxWidth="100px" value={calculatedData.price.toFixed(2)} readOnly />
              </FormControl>
            </SimpleGrid>
          </Box>
          <Box padding={4}>
            <SimpleGrid columns={1} spacing={4}>
              <FormControl>
                <FormLabel>Total P. Armazón</FormLabel>
                <Input type="number" name="total_p_frame" width="auto" maxWidth="100px" value={calculatedData.total_p_frame.toFixed(2)} readOnly />
              </FormControl>
              <FormControl>
                <FormLabel>Total P. Lunas</FormLabel>
                <Input type="number" name="total_p_lens" width="auto" maxWidth="100px" value={calculatedData.total_p_lens.toFixed(2)} readOnly />
              </FormControl>
            </SimpleGrid>
          </Box>
        </SimpleGrid>
    );
};

export default PriceCalculation;
