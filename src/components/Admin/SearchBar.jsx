import { Box, Input, Select, FormControl, List, ListItem } from "@chakra-ui/react";

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
          bg="white"
          border="1px solid #ccc"
          borderRadius="md"
          zIndex="10"
          maxHeight="150px"
          overflowY="auto"
          width="100%"
        >
          {suggestions.map((suggestion, index) => (
            <ListItem
              key={index}
              p={2}
              _hover={{ bg: "gray.100", cursor: "pointer" }}
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