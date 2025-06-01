import { useState, useEffect } from "react";
import { Box, Flex, FormControl, FormLabel, Input, Grid} from "@chakra-ui/react";

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

    const roundUpToNearestTenCents = (num) => Math.ceil(num * 10) / 10;

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

    const [discountInput, setDiscountInput] = useState({
    discount_frame: "",
    discount_lens: "",
    });

    const handleDiscountChange = (e) => {
        const { name, value } = e.target;
        setDiscountInput(prev => ({
          ...prev,
          [name]: value
        }));
        const discount = parseFloat(value);
    if (!isNaN(discount)) {
        if (name === "discount_frame") {
            const total_p_frame = roundUpToNearestTenCents(calculatedData.p_frame - (calculatedData.p_frame * discount / 100));
            setCalculatedData(prevState => ({
                ...prevState,
                discount_frame: discount,
                total_p_frame,
            }));
        } else if (name === "discount_lens") {
            const total_p_lens = roundUpToNearestTenCents(calculatedData.p_lens - (calculatedData.p_lens * discount / 100));
            setCalculatedData(prevState => ({
                ...prevState,
                discount_lens: discount,
                total_p_lens,
            }));
        }
    } else {
        // Si está vacío o no es número, solo actualiza el input
        setCalculatedData(prevState => ({
            ...prevState,
            [name]: "",
            [name === "discount_frame" ? "total_p_frame" : "total_p_lens"]: "",
        }));
    }
  };

      useEffect(() => {
          setDiscountInput({
              discount_frame: calculatedData.discount_frame !== "" && calculatedData.discount_frame !== undefined
                  ? calculatedData.discount_frame.toString()
                  : "",
              discount_lens: calculatedData.discount_lens !== "" && calculatedData.discount_lens !== undefined
                  ? calculatedData.discount_lens.toString()
                  : "",
          });
      }, [calculatedData.discount_frame, calculatedData.discount_lens]);


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
                        total_p_frame: roundUpToNearestTenCents(totalValue),
                        discount_frame: parseFloat(discount_frame.toFixed(2)),
                    }));
                } else if (name === "total_p_lens") {
                    const discount_lens = (calculatedData.p_lens > 0) 
                        ? 100 - ((totalValue / calculatedData.p_lens) * 100)
                        : 0;
                    setCalculatedData(prevState => ({
                        ...prevState,
                        total_p_lens: roundUpToNearestTenCents(totalValue),
                        discount_lens: parseFloat(discount_lens.toFixed(2)),
                    }));
                }
            }
        }
    };

    useEffect(() => {
        const totalP = (calculatedData.total_p_frame || 0) + (calculatedData.total_p_lens || 0);
        setCalculatedData(prevState => ({
            ...prevState,
            totalP: totalP.toFixed(2),
        }));

        setFormData((prevState) => ({
            ...prevState,
            p_frame: calculatedData.p_frame,
            p_lens: calculatedData.p_lens,
            discount_frame: calculatedData.discount_frame,
            discount_lens: calculatedData.discount_lens,
            total_p_frame: calculatedData.total_p_frame,
            total_p_lens: calculatedData.total_p_lens,
            total: parseFloat(totalP),
            price: calculatedData.price.toFixed(2),
        }));
    }, [calculatedData.total_p_frame, calculatedData.total_p_lens, setFormData]);

    return (
        <Flex justify="center" align="center">
          <Box maxWidth="1000px" width="full" p={4}>
            <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={6}>
              <FormControl>
                <FormLabel>P. Armazón</FormLabel>
                <Input
                  type="number"
                  name="p_frame"
                  value={calculatedData.p_frame.toFixed(2)}
                  readOnly
                  minW="100px"
                />
              </FormControl>
              <FormControl>
                <FormLabel>% Dto A.</FormLabel>
                <Input
                  type="number"
                  name="discount_frame"
                  value={discountInput.discount_frame && discountInput.discount_frame !== "0" ? discountInput.discount_frame : ""}
                  onChange={handleDiscountChange}
                  minW="100px"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Total A.</FormLabel>
                <Input
                  type="number"
                  name="total_p_frame"
                  value={calculatedData.total_p_frame || ""}
                  onChange={handleTotalChange}
                  minW="100px"
                />
              </FormControl>
              <FormControl>
                <FormLabel>P. Lunas</FormLabel>
                <Input
                  type="number"
                  name="p_lens"
                  value={calculatedData.p_lens.toFixed(2)}
                  readOnly
                  minW="100px"
                />
              </FormControl>
              <FormControl>
                <FormLabel>% Dto L.</FormLabel>
                <Input
                  type="number"
                  name="discount_lens"
                  value={discountInput.discount_lens && discountInput.discount_lens !== "0" ? discountInput.discount_lens : ""}
                  onChange={handleDiscountChange}
                  minW="100px"
                />
              </FormControl>
                <FormControl>
                    <FormLabel>Total L.</FormLabel>
                    <Input
                    type="number"
                    name="total_p_lens"
                    value={calculatedData.total_p_lens || ""}
                    onChange={handleTotalChange}
                    minW="100px"
                    />
                </FormControl>
              <FormControl>
                <FormLabel>Precio Total</FormLabel>
                <Input
                  type="number"
                  name="price"
                  value={calculatedData.price.toFixed(2)}
                  readOnly
                  minW="100px"
                />
              </FormControl>
            </Grid>
          </Box>
        </Flex>
      );
    };      

export default PriceCalculation;
