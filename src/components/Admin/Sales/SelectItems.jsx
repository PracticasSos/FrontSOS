import { Box, FormControl, FormLabel, Input, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabase";

const SelectItems = ({ onFormDataChange, initialFormData = {} }) => {
  const [searchFrame, setSearchFrame] = useState("");
  const [searchLens, setSearchLens] = useState("");
  const [frames, setFrames] = useState([]);
  const [lenses, setLenses] = useState([]);
  const [frameSuggestions, setFrameSuggestions] = useState([]);
  const [lensSuggestions, setLensSuggestions] = useState([]);
  const [formData, setFormData] = useState(initialFormData); 

  useEffect(() => {
    fetchData("lens", setLenses);
    fetchData("inventario", setFrames);
  }, []);

  const fetchData = async (table, setData) => {
    const { data, error } = await supabase
        .from(table)
        .select('*');
    
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
      if (data) {
        setFrameSuggestions(data);
      }
    } catch (err) {
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
      if (data) {
        setLensSuggestions(data);
      }
    } catch (err) {
      setLensSuggestions([]);
    }
  };
  
  const handleSuggestionClick = (item, type) => {
    const updatedFormData = type === "frame"
      ? { brand_id: item.id, brand: item.brand, p_frame: item.price || 0 }
      : { lens_id: item.id, lens_type_name: item.lens_type, p_lens: item.lens_price || 0 }
    if (onFormDataChange) {
      onFormDataChange(updatedFormData);
    }
    if (type === "frame") {
      setSearchFrame(item.brand);
      setFrameSuggestions([]);
    } else if (type === "lens") {
      setSearchLens(item.lens_type);
      setLensSuggestions([]);
    }
  };

  return (
    <SimpleGrid columns={1} p={4}>
      <FormControl>
        <FormLabel>Armazón</FormLabel>
        <Input
          name="frame"
          type="text"
          placeholder="Buscar armazón..."
          value={searchFrame}
          onChange={handleSearchFrame}
        />
        {frameSuggestions.length > 0 && (
          <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
            {frameSuggestions.map((item, index) => (
              <Box
                key={index}
                p={2}
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                onClick={() => handleSuggestionClick(item, "frame")}
              >
                {item.brand}
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
          value={searchLens}
          onChange={handleSearchLens}
        />
        {lensSuggestions.length > 0 && (
          <Box border="1px solid #ccc" borderRadius="md" mt={2} maxHeight="150px" overflowY="auto">
            {lensSuggestions.map((item, index) => (
              <Box
                key={index}
                p={2}
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                onClick={() => handleSuggestionClick(item, "lens")}
              >
                {item.lens_type}
              </Box>
            ))}
          </Box>
        )}
      </FormControl>
    </SimpleGrid>
  );
};

export default SelectItems;
