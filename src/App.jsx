import { useEffect, useState } from "react";
import Welcome from "./components/Welcome";
import { Container } from "@chakra-ui/react";
import AppRouter from "./routers";
import { useNavigate } from "react-router-dom";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  const handleWelcomeFinish = () => {
    setShowSplash(false);
    navigate("/LoginForm"); 
  };

  return showSplash ? (
    <Welcome onFinish={handleWelcomeFinish} />
  ) : (
    <Container maxW="100%" padding="0px">
      <AppRouter />
    </Container>
  );
};
export default App;
