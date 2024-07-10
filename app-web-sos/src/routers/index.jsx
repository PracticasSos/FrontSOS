import { Route, Routes } from "react-router-dom"
import SignUpForm from "../components/autorizacion/SignUpForm"
import Welcome from "../components/Welcome"
import LoginForm from "../components/autorizacion/LoginForm"
import AdminDashboard from "../components/optionsauth/OptionsAdmin"

const AppRouter = () => {
    return(
        <Routes>
            <Route path="/" element={<Welcome />} /> {/*Cada route sera una ruta de acceso a la pagina */}
            <Route path="Register" element={<SignUpForm/>} />
            <Route path="Login" element={<LoginForm/>} />
            <Route path="Admin" element={<AdminDashboard/>} />
        </Routes>
    )
}

export default AppRouter;