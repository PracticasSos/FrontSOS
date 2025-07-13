import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabase";
 import { Box, VStack, SimpleGrid, Flex, Img, FormControl, FormLabel, Input, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";

const SalesDetails = ({ formData = {}, setFormData = () => {}, onTotalsChange = () => {} }) => {
  const [searchFrame, setSearchFrame] = useState("");
  const [searchLens, setSearchLens] = useState("");
  const [frames, setFrames] = useState([]);
  const [lenses, setLenses] = useState([]);
  const [frameSuggestions, setFrameSuggestions] = useState([]);
  const [lensSuggestions, setLensSuggestions] = useState([]);


  const [calculatedData, setCalculatedData] = useState({
    p_frame: 0,
    p_lens: 0,
    discount_frame: null,
    discount_lens: null,
    total_p_frame: null,
    total_p_lens: null,
    totalP: 0,
    price: 0,
  });

  const [discountInput, setDiscountInput] = useState({
    discount_frame: "",
    discount_lens: "",
  });

  const roundUpToNearestTenCents = (num) => Math.ceil(num * 10) / 10;


  useEffect(() => {
    fetchData("lens", setLenses);
    fetchData("inventario", setFrames);
  }, []);

  const fetchData = async (table, setData) => {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      console.error(`Error fetching ${table}:`, error);
    } else {
      setData(data);
    }
  };

  const handleSearchFrame = async (e) => {
    const value = e.target.value;
    setSearchFrame(value);
    try {
      const { data, error } = await supabase
        .from("inventario")
        .select("id, brand, price, quantity")
        .ilike("brand", `%${value}%`)
        .gt("quantity", 0);
      if (error) throw error;
      setFrameSuggestions(data || []);
    } catch {
      setFrameSuggestions([]);
    }
  };

  const handleSearchLens = async (e) => {
    const value = e.target.value;
    setSearchLens(value);
    try {
      const { data, error } = await supabase
        .from("lens")
        .select("id, lens_type, lens_price")
        .ilike("lens_type", `%${value}%`);
      if (error) throw error;
      setLensSuggestions(data || []);
    } catch {
      setLensSuggestions([]);
    }
  };

  const handleSuggestionClick = (item, type) => {
  if (type === "frame") {
    setFormData(prev => ({
      ...prev,
      brand_id: item.id,
      brand: item.brand,
      p_frame: item.price || 0,
    }));
    setSearchFrame(item.brand);
    setFrameSuggestions([]);
  } else {
    setFormData(prev => ({
      ...prev,
      lens_id: item.id,
      lens_type_name: item.lens_type,
      p_lens: item.lens_price || 0,
    }));
    setSearchLens(item.lens_type);
    setLensSuggestions([]);
  }
};

  useEffect(() => {
  setCalculatedData((prev) => ({
    ...prev,
    p_frame: formData.p_frame || 0,
    p_lens: formData.p_lens || 0,
    // NO toques total_p_frame ni total_p_lens aquí
  }));
}, [formData]);

  useEffect(() => {
    const price = (calculatedData.p_frame || 0) + (calculatedData.p_lens || 0);
    setCalculatedData((prev) => ({ ...prev, price }));
  }, [calculatedData.p_frame, calculatedData.p_lens]);

  const handleDiscountChange = (e) => {
  const { name, value } = e.target;
  setDiscountInput((prev) => ({ ...prev, [name]: value }));

  const discount = parseFloat(value);
  if (!isNaN(discount) && discount > 0) {
    if (name === "discount_frame") {
      const total_p_frame = roundUpToNearestTenCents(
        calculatedData.p_frame - (calculatedData.p_frame * discount) / 100
      );
      setCalculatedData((prev) => ({
        ...prev,
        discount_frame: discount,
        total_p_frame,
      }));
    } else if (name === "discount_lens") {
      const total_p_lens = roundUpToNearestTenCents(
        calculatedData.p_lens - (calculatedData.p_lens * discount) / 100
      );
      setCalculatedData((prev) => ({
        ...prev,
        discount_lens: discount,
        total_p_lens,
      }));
    }
  } else {
    setCalculatedData((prev) => ({
      ...prev,
      [name]: null,
      [name === "discount_frame" ? "total_p_frame" : "total_p_lens"]: null,
    }));
  }
};

  useEffect(() => {
  setDiscountInput({
    discount_frame:
      calculatedData.discount_frame !== null && calculatedData.discount_frame !== undefined
        ? calculatedData.discount_frame.toString()
        : "",
    discount_lens:
      calculatedData.discount_lens !== null && calculatedData.discount_lens !== undefined
        ? calculatedData.discount_lens.toString()
        : "",
  });
}, [calculatedData.discount_frame, calculatedData.discount_lens]);

  const handleTotalChange = (e) => {
    const { name, value } = e.target;

    if (name === "total_p_frame" || name === "total_p_lens") {
      if (value === "") {
        setCalculatedData((prev) => ({
          ...prev,
          [name]: "",
          [`discount_${name === "total_p_frame" ? "frame" : "lens"}`]: 0,
        }));
        return;
      }

      const totalValue = parseFloat(value);
      if (!isNaN(totalValue)) {
        if (name === "total_p_frame") {
          const discount_frame =
            calculatedData.p_frame > 0
              ? 100 - (totalValue / calculatedData.p_frame) * 100
              : 0;
          setCalculatedData((prev) => ({
            ...prev,
            total_p_frame: roundUpToNearestTenCents(totalValue),
            discount_frame: parseFloat(discount_frame.toFixed(2)),
          }));
        } else {
          const discount_lens =
            calculatedData.p_lens > 0
              ? 100 - (totalValue / calculatedData.p_lens) * 100
              : 0;
          setCalculatedData((prev) => ({
            ...prev,
            total_p_lens: roundUpToNearestTenCents(totalValue),
            discount_lens: parseFloat(discount_lens.toFixed(2)),
          }));
        }
      }
    }
  };

  useEffect(() => {
  const totalFrame = calculatedData.total_p_frame !== null && calculatedData.total_p_frame !== undefined
    ? Number(calculatedData.total_p_frame)
    : Number(calculatedData.p_frame);

  const totalLens = calculatedData.total_p_lens !== null && calculatedData.total_p_lens !== undefined
    ? Number(calculatedData.total_p_lens)
    : Number(calculatedData.p_lens);

  const totalP = totalFrame + totalLens;

  setCalculatedData((prev) => ({
    ...prev,
    totalP: totalP.toFixed(2),
  }));

  setFormData((prev) => ({
  ...prev,
  // Solo actualiza estos campos, deja balance y otros intactos
  p_frame: calculatedData.p_frame,
  p_lens: calculatedData.p_lens,
  discount_frame: calculatedData.discount_frame,
  discount_lens: calculatedData.discount_lens,
  total_p_frame: calculatedData.total_p_frame,
  total_p_lens: calculatedData.total_p_lens,
  total: parseFloat(totalP),
  price: calculatedData.price.toFixed(2),
  // NO pongas balance aquí, ni credit, ni payment_in, etc.
}));
}, [
  calculatedData.total_p_frame,
  calculatedData.total_p_lens,
  calculatedData.p_frame,
  calculatedData.p_lens,
]);

useEffect(() => {
  if (onTotalsChange) {
    onTotalsChange({
      frameName: formData.brand || "",
      lensName: formData.lens_type_name || "",
      total_p_frame:
        calculatedData.discount_frame && calculatedData.discount_frame > 0
          ? calculatedData.total_p_frame
          : calculatedData.p_frame,
      total_p_lens:
        calculatedData.discount_lens && calculatedData.discount_lens > 0
          ? calculatedData.total_p_lens
          : calculatedData.p_lens,
    });
  }
}, [
  calculatedData.total_p_frame,
  calculatedData.total_p_lens,
  calculatedData.p_frame,
  calculatedData.p_lens,
  calculatedData.discount_frame,
  calculatedData.discount_lens,
  formData.brand,
  formData.lens_type_name,
]);

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const selectBg = useColorModeValue('white', 'gray.700');
    
return (
  <Box w="100vw" >
    <Box
    w="100%"
    maxW="900px"
    mx="auto"
    h="100%"
  >
      <VStack spacing={6} w="100%" px={[8, 2]}>
        <SimpleGrid  templateColumns={["90px 1fr", null, "100px 1fr"]} spacing={6}  p={2} borderRadius="md" w="100%">
          {/* Imagen */}
          <Flex justify="center" align="center">
            <Img
              src="/assets/inventario.jpg"
              alt="Armazón"
              objectFit="cover"
              borderRadius="md"
              w={["90px", "100px", "140px"]}
              h={["90px", "100px", "140px"]}
            />
          </Flex>

          {/* Inputs Armazón */}
          <VStack spacing={2} w="100%">
            <FormControl>
              <FormLabel fontSize="sm">Armazón</FormLabel>
              <Input
                name="frame1"
                placeholder="Buscar armazón..."
                value={searchFrame}
                onChange={handleSearchFrame}
                fontSize="sm"
                height="40px"
                borderRadius="full"
                w="100%"
                bg={selectBg}
                borderColor={borderColor}
                color={textColor}
                _hover={{
                borderColor: useColorModeValue('gray.300', 'gray.500')
                }}
                _focus={{
                  borderColor: useColorModeValue('blue.500', 'blue.300'),
                  boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
                }}
              />
              {frameSuggestions.length > 0 && (
                <Box maxH="100px" overflowY="auto" fontSize="sm">
                  {frameSuggestions.map((item, index) => (
                    <Box
                      key={index}
                      p={2}
                      _hover={{ 
                        bg: useColorModeValue("gray.100", "gray.600"), 
                        cursor: "pointer" 
                      }}
                      onClick={() => handleSuggestionClick(item, "frame", 1)}
                    >
                      {item.brand}
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            <SimpleGrid columns={3} spacing={2} w="100%">
              <FormControl>
                <FormLabel fontSize="sm">Valor</FormLabel>
                <Input
                  name="p_frame"
                  type="number"
                  height="40px"
                  borderRadius="full"
                  value={calculatedData.p_frame.toFixed(2)}
                  readOnly
                  fontSize="sm"
                  bg={selectBg}
                  borderColor={borderColor}
                  color={textColor}
                  _hover={{
                  borderColor: useColorModeValue('gray.300', 'gray.500')
                  }}
                  _focus={{
                    borderColor: useColorModeValue('blue.500', 'blue.300'),
                    boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Desc</FormLabel>
                <Input
                  name="discount_frame"
                  type="number"
                  value={discountInput.discount_frame || ""}
                  onChange={handleDiscountChange}
                  fontSize="sm"
                  h="40px"
                  borderRadius="full"
                  bg={selectBg}
                  borderColor={borderColor}
                  color={textColor}
                  _hover={{
                  borderColor: useColorModeValue('gray.300', 'gray.500')
                  }}
                  _focus={{
                    borderColor: useColorModeValue('blue.500', 'blue.300'),
                    boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Total</FormLabel>
                <Input
                  name="total_p_frame"
                  type="number"
                  value={calculatedData.total_p_frame ?? ""}
                  onChange={handleTotalChange}
                  fontSize="sm"
                  h="40px"
                  borderRadius="full"
                  bg={selectBg}
                  borderColor={borderColor}
                  color={textColor}
                  _hover={{
                  borderColor: useColorModeValue('gray.300', 'gray.500')
                  }}
                  _focus={{
                    borderColor: useColorModeValue('blue.500', 'blue.300'),
                    boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
                  }}
                />
              </FormControl>
            </SimpleGrid>
          </VStack>
        </SimpleGrid>

        {/* Lente */}
        <SimpleGrid templateColumns={["90px 1fr", null, "100px 1fr"]} spacing={6}  p={2} borderRadius="md" w="100%">
          <Flex justify="center" align="center">
            <Img
              src="/assets/lunas.jpg"
              alt="Lunas"
              objectFit="cover"
              borderRadius="md"
              w={["90px", "100px", "140px"]}
              h={["90px", "100px", "140px"]}
            />
          </Flex>

          {/* Inputs Lente */}
          <VStack spacing={2} w="100%">
            <FormControl>
              <FormLabel fontSize="sm">Lunas</FormLabel>
              <Input
                name="lens1"
                placeholder="Buscar lente..."
                value={searchLens}
                onChange={handleSearchLens}
                fontSize="sm"
                h="40px"
                borderRadius="full"
                w="100%"
                bg={selectBg}
                borderColor={borderColor}
                color={textColor}
                _hover={{
                borderColor: useColorModeValue('gray.300', 'gray.500')
                }}
                _focus={{
                  borderColor: useColorModeValue('blue.500', 'blue.300'),
                  boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
                }}
              />
              {lensSuggestions.length > 0 && (
                <Box maxH="100px" overflowY="auto" fontSize="sm">
                  {lensSuggestions.map((item, index) => (
                    <Box
                      key={index}
                      p={2}
                       _hover={{ 
                        bg: useColorModeValue("gray.100", "gray.600"), 
                        cursor: "pointer" 
                      }}
                      onClick={() => handleSuggestionClick(item, "lens", 1)}
                    >
                      {item.lens_type}
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            <SimpleGrid columns={3} spacing={2} w="100%">
              <FormControl>
                <FormLabel fontSize="sm">Valor</FormLabel>
                <Input
                  name="p_lens"
                  type="number"
                  value={calculatedData.p_lens.toFixed(2)}
                  readOnly
                  fontSize="sm"
                  h="40px"
                  borderRadius="full"
                  bg={selectBg}
                  borderColor={borderColor}
                  color={textColor}
                  _hover={{
                  borderColor: useColorModeValue('gray.300', 'gray.500')
                  }}
                  _focus={{
                    borderColor: useColorModeValue('blue.500', 'blue.300'),
                    boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Desc</FormLabel>
                <Input
                  name="discount_lens"
                  type="number"
                  value={discountInput.discount_lens || ""}
                  onChange={handleDiscountChange}
                  fontSize="sm"
                  h="40px"
                  borderRadius="full"
                  bg={selectBg}
                borderColor={borderColor}
                color={textColor}
                _hover={{
                borderColor: useColorModeValue('gray.300', 'gray.500')
                }}
                _focus={{
                  borderColor: useColorModeValue('blue.500', 'blue.300'),
                  boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
                }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Total</FormLabel>
                <Input
                  name="total_p_lens"
                  type="number"
                  value={calculatedData.total_p_lens ?? ""}
                  onChange={handleTotalChange}
                  fontSize="sm"
                  h="40px"
                  borderRadius="full"
                  bg={selectBg}
                borderColor={borderColor}
                color={textColor}
                _hover={{
                borderColor: useColorModeValue('gray.300', 'gray.500')
                }}
                _focus={{
                  borderColor: useColorModeValue('blue.500', 'blue.300'),
                  boxShadow: useColorModeValue('0 0 0 1px blue.500', '0 0 0 1px blue.300')
                }}
                />
              </FormControl>
            </SimpleGrid>
          </VStack>
        </SimpleGrid>
      </VStack>
    </Box>
  </Box>
);

};

export default SalesDetails;
