import { Route, Routes } from "react-router-dom"
import SignUpForm from "../components/autorizacion/SignUpForm"
import Welcome from "../components/Welcome"
import LoginForm from "../components/autorizacion/LoginForm"
import AdminDashBoard from "../components/optionsauth/OptionsAdmin"
import ListUsers from "../components/Admin/ListUsers"
import RegisterPatientForm from "../components/Optometra/RegisterPatient"
import OptometraDashBoard from "../components/optionsauth/OptionsOptometra"
import ListPatients from "../components/Optometra/ListPatients"
import Inventario from "../components/Admin/Inventario.jsx";
import InventarioList from "../components/Admin/InventarioList.jsx";
import Branch from "../components/Admin/Branch.jsx";
import ListBranch from "../components/Admin/ListBranch.jsx";
import Lab from "../components/Admin/Labs.jsx";
import ListLab from "../components/Admin/ListLab.jsx";
import CashClousure from "../components/Admin/CashClousure.jsx";
import SalesForm from "../components/Admin/SalesForm.jsx";
import RegisterLens from "../components/Admin/RegisterLens.jsx";
import RegisterMeasures from "../components/Admin/RegisterMeasures.jsx"
import MeasuresUse from "../components/Admin/MeasuresUse.jsx"
import MeasuresFinal from "../components/Admin/MeasuresFinal.jsx"
import PatientRecords from "../components/Admin/PatientRecords.jsx"
import Egresos from "../components/Admin/Egresos.jsx"
import PatientHistory from "../components/Admin/PatientHistory.jsx"
import LaboratoryOrder from "../components/Admin/LaboratoryOrder.jsx"
import OrderLaboratoryList from "../components/Admin/OrderLaboratoryList.jsx"


const AppRouter = () => {
    return(
        <Routes>
            <Route path="/" element={<Welcome />} /> {/*Cada route sera una ruta de acceso a la pagina */}
            <Route path="Register" element={<SignUpForm/>} />{/*Ruta para registrar usuarios (solo admin accede)*/}
            <Route path="Inventory" element={<Inventario/>}></Route>
            <Route path="Login" element={<LoginForm/>} />
            <Route path="Admin" element={<AdminDashBoard/>} />{/*Ruta de las opciones de rol admin*/}
            <Route path="ListUsers" element={<ListUsers />} />{/*Ruta para listar usuarios (empleados) (solo admin puede)*/}
            <Route path="RegisterPatient" element={<RegisterPatientForm />} />
            <Route path="Optometra" element={<OptometraDashBoard />} />
            <Route path="ListPatients" element={<ListPatients />} />
            <Route path={"ListInventory"} element={<InventarioList/>}></Route>
            <Route path={"Branch"} element={<Branch/>}></Route>
            <Route path={"ListBranch"} element={<ListBranch/>}></Route>
            <Route path={"Labs"} element={<Lab/>}></Route>
            <Route path={"ListLabs"} element={<ListLab/>}></Route>
            <Route path="CashClousure" element={<CashClousure />} ></Route>
            <Route path="SalesForm" element= {<SalesForm/>}></Route>
            <Route path="RegisterLens" element={<RegisterLens/>}></Route>
            <Route path="PatientRecords" element={<PatientRecords />}> </Route>
            <Route path="PatientHistory" element={<PatientHistory/>}> </Route>
            <Route path="RegisterMeasures" element={<RegisterMeasures />}>
                <Route path="MeasuresUse" element={<MeasuresUse />} />
                <Route path="MeasuresFinal" element={<MeasuresFinal />} />
            </Route>
            <Route path="/OrderLaboratoryList" element={<OrderLaboratoryList/>}> </Route>
            <Route path="/OrderLaboratoryList/LaboratoryOrder/:patientId" element={<LaboratoryOrder />}></Route>
            <Route path="Egresos" element={<Egresos />}> </Route>
        </Routes>
    )
}

export default AppRouter;