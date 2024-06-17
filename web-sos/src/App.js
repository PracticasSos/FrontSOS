// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

const App = () => {
  return (
    <ChakraProvider>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
          </Switch>
        </div>
      </Router>
    </ChakraProvider>
  );
};

export default App;


/*// src/App.js
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

const App = () => {
  return (
    <ChakraProvider>
      <Router>
        <Switch>
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route path="/register">
            <RegisterPage />
          </Route>
          <Route path="/">
            <LoginPage />
          </Route>
        </Switch>
      </Router>
    </ChakraProvider>
  );
};

export default App;*/


/*// src/App.js
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
*/