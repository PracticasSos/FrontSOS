import { Route, Routes } from "react-router-dom"
import SignUpForm from "../components/autorizacion/SignUpForm"
import Welcome from "../components/Welcome"
import LoginForm from "../components/autorizacion/LoginForm"
import AdminDashBoard from "../components/optionsauth/OptionsAdmin"
import ListUsers from "../components/Admin/ListUsers"

const AppRouter = () => {
    return(
        <Routes>
            <Route path="/" element={<Welcome />} /> {/*Cada route sera una ruta de acceso a la pagina */}
            <Route path="Register" element={<SignUpForm/>} />
            <Route path="Login" element={<LoginForm/>} />
            <Route path="Admin" element={<AdminDashBoard/>} />
            <Route path="ListUsers" element={<ListUsers />} />
        </Routes>
    )
}

export default AppRouter;