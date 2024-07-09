import { Route, Routes } from "react-router-dom"
import Auth from "./components/autorizacion/Auth"
import App from "./App"
import SignUpForm from "./components/autorizacion/SignUpForm"

const AppRouter = () => {
    return(
        <Routes>
            <Route path="/"><App /></Route> {/*Cada route sera una ruta de acceso a la pagina */}
            <Route path="Register"><SignUpForm /></Route>
        </Routes>
    )
}

export default AppRouter;