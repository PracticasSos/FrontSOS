import { Route, Routes } from "react-router-dom"
import SignUpForm from "../components/autorizacion/SignUpForm"
import Welcome from "../components/Welcome"

const AppRouter = () => {
    return(
        <Routes>
            <Route path="/" element={<Welcome />} /> {/*Cada route sera una ruta de acceso a la pagina */}
            <Route path="Register" element={<SignUpForm/>} />
        </Routes>
    )
}

export default AppRouter;