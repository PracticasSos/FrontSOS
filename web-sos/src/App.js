// src/App.js
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import LoginPage from './components/LoginPage';

const App = () => {
  return (
    <ChakraProvider>
      <div className="App">
        <LoginPage />
      </div>
    </ChakraProvider>
  );
};

export default App;
