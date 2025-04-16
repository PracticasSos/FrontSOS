import { Box, FormControl, FormLabel, Input, SimpleGrid, useToast} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "../../../../api/supabase";

const SelectHistory = ({ saleId, onFormDataChange, initialFormData = {} }) => {
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
    p_lens: 0,
  });

  const [originalInventoryId, setOriginalInventoryId] = useState(null); 

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
          inventario ( brand ),
          lens ( lens_type )
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
    const newFormData = { ...formData, ...updatedData };
    if (
      updatedData.inventario_id &&
      updatedData.inventario_id !== formData.inventario_id
    ) {
      await updateInventoryStock(updatedData.inventario_id, formData.inventario_id);
    }
    setFormData(newFormData);
    onFormDataChange && onFormDataChange(newFormData);
    await updateSaleData(updatedData);
  };
  

  const updateSaleData = async (updatedData) => {
    const idToUse = saleId || initialFormData.sale_id;
    const { error } = await supabase
      .from("sales")
      .update(updatedData)
      .eq("id", idToUse);

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

  return (
    <SimpleGrid columns={1} spacing={4}>
      <FormControl>
        <FormLabel>Armazón</FormLabel>
        <Input
          type="text"
          placeholder="Buscar armazón..."
          value={searchFrame || ""}
          onChange={handleSearchFrame}
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
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                onClick={() => handleSuggestionClick(item, "frame")}
              >
                {item.brand} - ${item.price}
              </Box>
            ))}
          </Box>
        )}
      </FormControl>

      <FormControl>
        <FormLabel>Lunas</FormLabel>
        <Input
          type="text"
          placeholder="Buscar lunas..."
          value={searchLens || ""}
          onChange={handleSearchLens}
        />
        {lensSuggestions.length > 0 && (
          <Box
            border="1px solid #ccc"
            borderRadius="md"
            mt={2}
            maxHeight="150px"
            overflowY="auto"
          >
            {lensSuggestions.map((item) => (
              <Box
                key={item.id}
                p={2}
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                onClick={() => handleSuggestionClick(item, "lens")}
              >
                {item.lens_type} - ${item.lens_price}
              </Box>
            ))}
          </Box>
        )}
      </FormControl>
    </SimpleGrid>
  );
};

export default SelectHistory;
