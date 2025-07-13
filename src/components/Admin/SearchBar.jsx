import { Box, Input, Select, FormControl, List, ListItem, useColorModeValue } from "@chakra-ui/react";

const SearchBar = ({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  branches = [],
  selectedBranch,
  onBranchChange,
  showBranchFilter = true,
  suggestions = [], 
  onSuggestionSelect, 
}) => {

    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const selectBg = useColorModeValue('white', 'gray.700');

  return (
    <Box mb={4} position="relative">
      <FormControl mb={4}>
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
        />
      </FormControl>
      {suggestions.length > 0 && (
        <List
          position="absolute"
          border="1px solid #ccc"
          borderRadius="md"
          zIndex="10"
          maxHeight="150px"
          overflowY="auto"
          width="100%"
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
        >
          {suggestions.map((suggestion, index) => (
            <ListItem
              key={index}
              p={2}
              _hover={{ 
                bg: useColorModeValue("gray.100", "gray.600"), 
                cursor: "pointer" 
              }}
              onClick={() => onSuggestionSelect(suggestion)}
            >
              {suggestion}
            </ListItem>
          ))}
        </List>
      )}
      {showBranchFilter && (
        <FormControl>
          <Select
            placeholder="Selecciona una sucursal"
            value={selectedBranch}
            onChange={onBranchChange}
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
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default SearchBar;