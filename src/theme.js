  // src/theme.js
  import { extendTheme } from '@chakra-ui/react';

  const config = {
    initialColorMode: 'light',
    useSystemColorMode: true,
  };

  const theme = extendTheme({
    config,
    fonts: {
      heading: `'Satoshi', sans-serif`,
      body: `'Satoshi', sans-serif`,
    },
    colors: {
      brand: {
        50: '#e3f2fd',
        100: '#bbdefb',
        200: '#90caf9',
        300: '#64b5f6',
        400: '#42a5f5',
        500: '#2196f3',
        600: '#1e88e5',
        700: '#1976d2',
        800: '#1565c0',
        900: '#0d47a1',
      },
    },
    styles: {
      global: (props) => ({
        body: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
          fontFamily: `'Satoshi', sans-serif`, // Redundante pero garantiza override
        },
      }),
    },
  });

  export default theme;
