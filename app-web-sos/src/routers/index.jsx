import { Route, Routes } from "react-router-dom"
import SignUpForm from "../components/autorizacion/SignUpForm"
import Welcome from "../components/Welcome"
import LoginForm from "../components/autorizacion/LoginForm"
import AdminDashBoard from "../components/optionsauth/OptionsAdmin"
import ListUsers from "../components/Admin/ListUsers"
import RegisterPatientForm from "../components/Optometra/RegisterPatient"
import OptometraDashBoard from "../components/optionsauth/OptionsOptometra"
import ListPatients from "../components/Optometra/ListPatients"

const AppRouter = () => {
    return(
        <Routes>
            <Route path="/" element={<Welcome />} /> {/*Cada route sera una ruta de acceso a la pagina */}
            <Route path="Register" element={<SignUpForm/>} />
            <Route path="Login" element={<LoginForm/>} />
            <Route path="Admin" element={<AdminDashBoard/>} />{/*Ruta de las opciones de admin*/}
            <Route path="ListUsers" element={<ListUsers />} />{/*Ruta para listar usuarios (empleados)*/}
            <Route path="RegisterPatient" element={<RegisterPatientForm />} />{/*Ruta para registrar pacientes*/}
            <Route path="Optometra" element={<OptometraDashBoard />} />{/*Ruta de las opciones del optometra*/}
            <Route path="ListPatients" element={<ListPatients />} />{/*Ruta para listar pacientes registrados*/}
        </Routes>
    )
}

export default AppRouter;