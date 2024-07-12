// import Auth from "./components/Auth"  // Componente renderizado de auth
//import { Container } from "@chakra-ui/react" // Contenedor para poner el componente de auth
//import AppRouter from "./routers"

import { Container } from "@chakra-ui/react" 
import AppRouter from "../src/routers/index"

function App() {

  return (
    <>
    <h1>Componente App</h1>
    <Container border={"1px solid red"} padding={"10px"} maxW='100%'>
      <AppRouter/>
    </Container>
    </>
  )
}

export default App
