import { Box, Flex, FormControl, FormLabel, Input, SimpleGrid, useToast, VStack, Img, useColorModeValue} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "../../../../api/supabase";

const DetailsHistory = ({ saleId,  onTotalsChange, onFormDataChange, initialFormData = {} }) => {
  const [searchFrame, setSearchFrame] = useState("");
  const [searchLens, setSearchLens] = useState("");
  const [frameSuggestions, setFrameSuggestions] = useState([]);
  const [lensSuggestions, setLensSuggestions] = useState([]);
  const toast = useToast();

  const [formData, setFormData] = useState({
    inventario_id: null,
    p_frame: 0,
    lens_id: null,
    lens_type_name: "",
    p_lens: 0
  });

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

  

  const [originalInventoryId, setOriginalInventoryId] = useState(null); 

  useEffect(() => {
  if (onTotalsChange) {
    onTotalsChange({
      total_p_frame: calculatedData.total_p_frame,
      total_p_lens: calculatedData.total_p_lens,
    });
  }
}, [calculatedData.total_p_frame, calculatedData.total_p_lens]);

  useEffect(() => {
    const fetchSaleItems = async () => {
      const idToUse = saleId || initialFormData.sale_id;
      if (!idToUse) return;

      const { data, error } = await supabase
        .from("sales")
        .select(`
          inventario_id,
          p_frame,
          lens_id,
          p_lens,
          discount_frame,
          discount_lens,
          total_p_frame,
          total_p_lens,
          inventario ( brand ),
          lens ( lens_type ),
          branchs_id,
          date
        `)
        .eq("id", idToUse)
        .single();
      if (error) {
        console.error("Error al obtener datos de la venta:", error);
        return;
      }

      const loadedData = {
      inventario_id: data.inventario_id ?? null,
      p_frame: data.p_frame ?? 0,
      lens_id: data.lens_id ?? null,
      lens_type_name: data.lens?.lens_type ?? "",
      p_lens: data.p_lens ?? 0,
      discount_frame: data.discount_frame ?? 0,
      discount_lens: data.discount_lens ?? 0,
      total_p_frame: data.total_p_frame ?? 0,
      total_p_lens: data.total_p_lens ?? 0,
      frameName: data.inventario?.brand ?? "",
      lensName: data.lens?.lens_type ?? "",
      branchs_id: data.branchs_id ?? "",
      date: data.date ?? "",
    };

      setFormData(loadedData);
      setOriginalInventoryId(data.inventario_id); 
      setSearchFrame(data.inventario?.brand ?? "");
      setSearchLens(data.lens?.lens_type ?? "");
      onFormDataChange && onFormDataChange(loadedData);
    };

    fetchSaleItems();
  }, [saleId, initialFormData.sale_id]);

  const updateInventoryStock = async (newId, oldId) => {
    try {
      if (newId && newId !== oldId) {
        if (oldId) {
          await supabase.rpc("adjust_inventory", {
            id_param: oldId,
            change_amount: 1,
          });
        }
        await supabase.rpc("adjust_inventory", {
          id_param: newId,
          change_amount: -1,
        });
      }
    } catch (error) {
      console.error("Error al ajustar inventario:", error);
      toast({
        title: "Error de inventario",
        description: "No se pudo actualizar el stock.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateFormData = async (updatedData) => {
  // Combina el estado actual con los cambios
  const newFormData = { ...formData, ...updatedData };

  // Si cambió el armazón, actualiza el stock
  if (
    updatedData.inventario_id &&
    updatedData.inventario_id !== formData.inventario_id
  ) {
    await updateInventoryStock(updatedData.inventario_id, formData.inventario_id);
  }

  // Actualiza el estado local y en el padre
  setFormData(newFormData);
  onFormDataChange && onFormDataChange(newFormData);

  // Limpia campos de solo UI antes de enviar a la base
  const { lens_type_name, frameName, lensName, ...dataToUpdate } = newFormData;
  dataToUpdate.lens_id = Number(dataToUpdate.lens_id) || null;
  dataToUpdate.inventario_id = Number(dataToUpdate.inventario_id) || null;

  // Envía el objeto completo a la base de datos
  const { error } = await supabase
    .from("sales")
    .update(dataToUpdate)
    .eq("id", saleId);

    if (error) {
      console.error("Error al actualizar la venta:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la venta.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Guardado",
        description: "Datos actualizados correctamente.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSearchFrame = async (e) => {
    const value = e.target.value;
    setSearchFrame(value);
    const { data, error } = await supabase
      .from("inventario")
      .select("id, brand, price, quantity")
      .ilike("brand", `%${value}%`)
      .gt("quantity", 0);

    if (!error && data) setFrameSuggestions(data);
  };

  const handleSearchLens = async (e) => {
    const value = e.target.value;
    setSearchLens(value);
    const { data, error } = await supabase
      .from("lens")
      .select("id, lens_type, lens_price")
      .ilike("lens_type", `%${value}%`);

    if (!error && data) setLensSuggestions(data);
  };

  const handleSuggestionClick = async (item, type) => {
    let updatedData = {};
    if (type === "frame") {
      updatedData = {
        inventario_id: item.id,
        frameName: item.brand || "",
        p_frame: item.price ?? 0,
      };
      setSearchFrame(item.brand || "");
      setFrameSuggestions([]);
    } else if (type === "lens") {
      updatedData = {
        lens_id: item.id,
        lens_type_name: item.lens_type || "",
        p_lens: item.lens_price ?? 0,
      };
      setSearchLens(item.lens_type || "");
      setLensSuggestions([]);
    }

    await updateFormData(updatedData);
  };


  useEffect(() => {
    setCalculatedData((prevState) => ({
      ...prevState,
      p_frame: formData.p_frame || 0,
      p_lens: formData.p_lens || 0,
      discount_frame: formData.discount_frame || 0,
      discount_lens: formData.discount_lens || 0,
      total_p_frame: formData.total_p_frame || 0,
      total_p_lens: formData.total_p_lens || 0,
    }));
  }, [formData]);

  useEffect(() => {
    const price = (calculatedData.p_frame || 0) + (calculatedData.p_lens || 0);
    setCalculatedData((prevState) => ({ ...prevState, price }));
  }, [calculatedData.p_frame, calculatedData.p_lens]);

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
  
    if (value === "") {
      setCalculatedData((prevState) => ({
        ...prevState,
        [name]: "",
      }));
      return;
    }
  
    const discount = parseFloat(value) || 0;
  
    if (name === "discount_frame") {
      const total_p_frame = calculatedData.p_frame - (calculatedData.p_frame * discount / 100);
      setCalculatedData((prevState) => ({
        ...prevState,
        discount_frame: discount,
        total_p_frame: parseFloat(total_p_frame.toFixed(2)),
      }));
    } else if (name === "discount_lens") {
      const total_p_lens = calculatedData.p_lens - (calculatedData.p_lens * discount / 100);
      setCalculatedData((prevState) => ({
        ...prevState,
        discount_lens: discount,
        total_p_lens: parseFloat(total_p_lens.toFixed(2)),
      }));
    }
  };
  

  const handleTotalChange = (e) => {
    const { name, value } = e.target;
  
    if (value === "") {
      setCalculatedData((prevState) => ({
        ...prevState,
        [name]: "",
      }));
      return;
    }
  
    const parsed = parseFloat(value);
  
    if (!isNaN(parsed)) {
      if (name === "total_p_frame") {
        const discount_frame = calculatedData.p_frame > 0
          ? 100 - ((parsed / calculatedData.p_frame) * 100)
          : 0;
        setCalculatedData((prevState) => ({
          ...prevState,
          total_p_frame: parsed,
          discount_frame: parseFloat(discount_frame.toFixed(2)),
        }));
      } else if (name === "total_p_lens") {
        const discount_lens = calculatedData.p_lens > 0
          ? 100 - ((parsed / calculatedData.p_lens) * 100)
          : 0;
        setCalculatedData((prevState) => ({
          ...prevState,
          total_p_lens: parsed,
          discount_lens: parseFloat(discount_lens.toFixed(2)),
        }));
      }
    }
  };
  

  useEffect(() => {
    const totalP = (calculatedData.total_p_frame || 0) + (calculatedData.total_p_lens || 0);

    setCalculatedData((prevState) => ({
      ...prevState,
      totalP: totalP.toFixed(2),
    }));

    setFormData((prevState) => ({
      ...prevState,
      discount_frame: calculatedData.discount_frame,
      discount_lens: calculatedData.discount_lens,
      total_p_frame: calculatedData.total_p_frame,
      total_p_lens: calculatedData.total_p_lens,
      total: parseFloat(totalP),
      price: calculatedData.price.toFixed(2),
    }));

    const updateSale = async () => {
      if (!formData.id) return;
      await supabase.from("sales").update({
        discount_frame: calculatedData.discount_frame,
        discount_lens: calculatedData.discount_lens,
        total_p_frame: calculatedData.total_p_frame,
        total_p_lens: calculatedData.total_p_lens,
        total: parseFloat(totalP),
        price: parseFloat(calculatedData.price.toFixed(2)),
      }).eq("id", formData.id);
    };

    const timeout = setTimeout(updateSale, 800);
    return () => clearTimeout(timeout);
  }, [calculatedData.discount_frame, calculatedData.discount_lens, calculatedData.total_p_frame, calculatedData.total_p_lens]);

    // Colores adaptativos
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
        <SimpleGrid templateColumns={["90px 1fr", null, "100px 1fr"]} spacing={6}  p={2} borderRadius="md" w="100%">
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
            <VStack spacing={2} w="100%">
            <FormControl>
            <FormLabel>Armazón</FormLabel>
            <Input
                type="text"
                placeholder="Buscar armazón..."
                value={searchFrame || ""}
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
            <Box
                border="1px solid #ccc"
                borderRadius="md"
                mt={2}
                maxHeight="150px"
                overflowY="auto"
            >
                {frameSuggestions.map((item) => (
                <Box
                    key={item.id}
                    p={2}
                    _hover={{ 
                        bg: useColorModeValue("gray.100", "gray.600"), 
                        cursor: "pointer" 
                      }}
                    onClick={() => handleSuggestionClick(item, "frame")}
                >
                    {item.brand} - ${item.price}
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
                    value={calculatedData.discount_frame  === 0 ? "" : calculatedData.discount_frame ?? ""}
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
                    value={calculatedData.total_p_frame  === 0 ? "" : calculatedData.total_p_frame ?? ""}
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
                value={searchLens || ""}
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
                  {lensSuggestions.map((item) => (
                    <Box
                      key={item.id}
                      p={2}
                      _hover={{ 
                        bg: useColorModeValue("gray.100", "gray.600"), 
                        cursor: "pointer" 
                      }}
                      onClick={() => handleSuggestionClick(item, "lens")}
                    >
                      {item.lens_type} - ${item.lens_price}
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
                value={calculatedData.discount_lens  === 0 ? "" : calculatedData.discount_lens ?? ""}
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
                value={calculatedData.total_p_lens  === 0 ? "" : calculatedData.total_p_lens ?? ""}
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

export default DetailsHistory;
