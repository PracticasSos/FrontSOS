// import Auth from "./components/Auth"  // Componente renderizado de auth
//import { Container } from "@chakra-ui/react" // Contenedor para poner el componente de auth
//import AppRouter from "./routers"

import { Container } from "@chakra-ui/react"
import Auth from "./components/autorizacion/Auth"

function App() {

  return (
    <>
    <Container border={"1px solid red"} padding={"10px"} maxW='100%'>
      <Auth/>
    </Container>
    </>
  )
}

export default App
