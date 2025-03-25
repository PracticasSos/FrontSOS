import { useState, useEffect } from "react";
import { Box, FormControl, FormLabel, Input, SimpleGrid } from "@chakra-ui/react";

const PriceCalculation = ({ formData, setFormData }) => {
    const [calculatedData, setCalculatedData] = useState({
        p_frame: 0,
        p_lens: 0,
        discount_frame: 0,
        discount_lens: 0,
        total_p_frame: 0,  
        total_p_lens: 0,   
        totalP: 0,
        price: 0,
    });

    useEffect(() => {
        setCalculatedData(prevState => ({
            ...prevState,
            p_frame: formData.p_frame || 0,
            p_lens: formData.p_lens || 0,
            total_p_frame: prevState.total_p_frame || formData.total_p_frame || "",
            total_p_lens: prevState.total_p_lens || formData.total_p_lens || "",
        }));
    }, [formData]);

    useEffect(() => {
        const price = (calculatedData.p_frame || 0) + (calculatedData.p_lens || 0);
        setCalculatedData(prevState => ({ ...prevState, price }));
    }, [calculatedData.p_frame, calculatedData.p_lens]);

    const handleDiscountChange = (e) => {
        const { name, value } = e.target;

        if (name === "discount_frame" || name === "discount_lens") {
            const discount = parseFloat(value) || 0;

            if (name === "discount_frame") {
                const total_p_frame = calculatedData.p_frame - (calculatedData.p_frame * discount / 100);
                setCalculatedData(prevState => ({
                    ...prevState,
                    discount_frame: value,
                    total_p_frame,
                }));
            } else if (name === "discount_lens") {
                const total_p_lens = calculatedData.p_lens - (calculatedData.p_lens * discount / 100);
                setCalculatedData(prevState => ({
                    ...prevState,
                    discount_lens: value,
                    total_p_lens,
                }));
            }
        }
    };

    const handleTotalChange = (e) => {
        const { name, value } = e.target;

        if (name === "total_p_frame" || name === "total_p_lens") {
            if (value === "") {
                setCalculatedData(prevState => ({
                    ...prevState,
                    [name]: "",
                    [`discount_${name === 'total_p_frame' ? 'frame' : 'lens'}`]: 0,
                }));
                return;
            }

            const totalValue = parseFloat(value);
            if (!isNaN(totalValue)) {
                if (name === "total_p_frame") {
                    const discount_frame = (calculatedData.p_frame > 0) 
                        ? 100 - ((totalValue / calculatedData.p_frame) * 100) 
                        : 0;
                    setCalculatedData(prevState => ({
                        ...prevState,
                        total_p_frame: totalValue,
                        discount_frame,
                    }));
                } else if (name === "total_p_lens") {
                    const discount_lens = (calculatedData.p_lens > 0) 
                        ? 100 - ((totalValue / calculatedData.p_lens) * 100) 
                        : 0;
                    setCalculatedData(prevState => ({
                        ...prevState,
                        total_p_lens: totalValue,
                        discount_lens,
                    }));
                }
            }
        }
    };

    useEffect(() => {
        const totalP = (calculatedData.total_p_frame || 0) + (calculatedData.total_p_lens || 0);
        setCalculatedData(prevState => ({
            ...prevState,
            totalP,
        }));

        setFormData((prevState) => ({
            ...prevState,
            p_frame: calculatedData.p_frame,
            p_lens: calculatedData.p_lens,
            discount_frame: calculatedData.discount_frame,
            discount_lens: calculatedData.discount_lens,
            total_p_frame: calculatedData.total_p_frame,
            total_p_lens: calculatedData.total_p_lens,
            total: totalP,
            price: calculatedData.price,
        }));
    }, [calculatedData.total_p_frame, calculatedData.total_p_lens, setFormData]);

    return (
  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="full">
    <Box padding={4} width="full">
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        <FormControl>
          <FormLabel>P. Armazón</FormLabel>
          <Input 
            type="number" 
            name="p_frame" 
            width="full" 
            maxWidth={{ base: "100%", md: "150px" }} 
            value={calculatedData.p_frame.toFixed(2)} 
            readOnly 
          />
        </FormControl>
        <FormControl>
          <FormLabel>%Dto</FormLabel>
          <Input 
            type="number" 
            name="discount_frame" 
            value={calculatedData.discount_frame || ""} 
            width="full" 
            maxWidth={{ base: "100%", md: "150px" }} 
            onChange={handleDiscountChange} 
          />
        </FormControl>
        <FormControl>
          <FormLabel>P. Lunas</FormLabel>
          <Input 
            type="number" 
            name="p_lens" 
            width="full" 
            maxWidth={{ base: "100%", md: "150px" }} 
            value={calculatedData.p_lens.toFixed(2)} 
            readOnly 
          />
        </FormControl>
        <FormControl>
          <FormLabel>%Dto</FormLabel>
          <Input 
            type="number" 
            name="discount_lens" 
            value={calculatedData.discount_lens || ""} 
            width="full" 
            maxWidth={{ base: "100%", md: "150px" }} 
            onChange={handleDiscountChange} 
          />
        </FormControl>
        <FormControl>
          <FormLabel>Precio</FormLabel>
          <Input 
            type="number" 
            name="price" 
            width="full" 
            maxWidth={{ base: "100%", md: "150px" }} 
            value={calculatedData.price.toFixed(2)} 
            readOnly 
          />
        </FormControl>
      </SimpleGrid>
    </Box>
    <Box padding={4} width="full">
      <SimpleGrid columns={1} spacing={4}>
        <FormControl>
          <FormLabel>Total P. Armazón</FormLabel>
          <Input 
            type="number" 
            name="total_p_frame" 
            width="full" 
            maxWidth={{ base: "100%", md: "150px" }} 
            value={calculatedData.total_p_frame || ""} 
            onChange={handleTotalChange} 
          />
        </FormControl>
        <FormControl>
          <FormLabel>Total P. Lunas</FormLabel>
          <Input 
            type="number" 
            name="total_p_lens" 
            width="full" 
            maxWidth={{ base: "100%", md: "150px" }} 
            value={calculatedData.total_p_lens || ""} 
            onChange={handleTotalChange} 
          />
        </FormControl>
      </SimpleGrid>
    </Box>
  </SimpleGrid>
);

};

export default PriceCalculation;