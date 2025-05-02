import { Route, Routes } from "react-router-dom";
import SignUpForm from "../components/autorizacion/SignUpForm";
import Welcome from "../components/Welcome";
import LoginForm from "../components/autorizacion/LoginForm";
import AdminDashBoard from "../components/optionsauth/OptionsAdmin";
import ListUsers from "../components/Admin/ListUsers";
import RegisterPatientForm from "../components/Optometra/RegisterPatient";
import OptometraDashBoard from "../components/optionsauth/OptionsOptometra";
import VendedorDashBoard from "../components/optionsauth/OptionsVendedor.jsx";
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
import MeasuresFinal from "../components/Admin/MeasuresFinal.jsx"
import PatientRecords from "../components/Admin/PatientRecords.jsx"
import Egresos from "../components/Admin/Egresos.jsx"
import PatientHistory from "../components/Admin/PatientHistory.jsx"
import LaboratoryOrder from "../components/Admin/LaboratoryOrder.jsx"
import OrderLaboratoryList from "../components/Admin/OrderLaboratoryList.jsx"
import BalancesPatient from "../components/Admin/BalancesPatient.jsx"
import RetreatsPatients from "../components/Admin/RetreatsPatients.jsx"
import Retreats from "../components/Admin/Retreats.jsx"
import Balance from "../components/Admin/Balance.jsx"
import HistoryMeasureList from "../components/Admin/HistoryMeasureList.jsx";
import HistoryMeasures from "../components/Admin/HistoryMeasures.jsx";
import ListLens from "../components/Admin/ListLens.jsx";
import ListBalance from "../components/Admin/ListBalance.jsx";
import ListSales from "../components/Admin/ListSales.jsx";
import Sales from "../components/Admin/Sales/Sales.jsx";
import Register from "../components/Admin/Register.jsx";
import HistoryClinic from "../components/Admin/HistoryClinic.jsx";
import SalesHistory from "../components/Admin/Sales/history/SalesHistory.jsx";

const AppRouter = () => {
    return(
        <Routes>
            <Route path="/" element={<Welcome />} /> {/*Cada route sera una ruta de acceso a la pagina */}
            <Route path="Register" element={<Register/>} />{/*Ruta para registrar usuarios (solo admin accede)*/}
            <Route path="Inventory" element={<Inventario/>}></Route>
            <Route path="login" element={<LoginForm/>} />
            <Route path="Admin" element={<AdminDashBoard/>} />{/*Ruta de las opciones de rol admin*/}
            <Route path="ListUsers" element={<ListUsers />} />{/*Ruta para listar usuarios (empleados) (solo admin puede)*/}
            <Route path="RegisterPatient" element={<RegisterPatientForm />} />
            <Route path="Vendedor" element={<VendedorDashBoard />} />
            <Route path="Optometra" element={<OptometraDashBoard />} />
            <Route path="ListPatients" element={<ListPatients />} />
            <Route path={"ListInventory"} element={<InventarioList/>}></Route>
            <Route path={"Branch"} element={<Branch/>}></Route>
            <Route path={"ListBranch"} element={<ListBranch/>}></Route>
            <Route path={"Labs"} element={<Lab/>}></Route>
            <Route path={"ListLabs"} element={<ListLab/>}></Route>
            <Route path="CashClousure" element={<CashClousure />} ></Route>
            <Route path="Sales" element= {<Sales/>}></Route>
            <Route path="RegisterLens" element={<RegisterLens/>}></Route>
            <Route path="PatientRecords" element={<PatientRecords />}> </Route>
            <Route path="MeasuresFinal" element={<MeasuresFinal />}></Route>
            <Route path="/OrderLaboratoryList" element={<OrderLaboratoryList/>}> </Route>
            <Route path="/OrderLaboratoryList/LaboratoryOrder/:patientId" element={<LaboratoryOrder />}></Route>
            <Route path="/HistoryMeasureList" element={<HistoryMeasureList/>}> </Route>
            <Route path="/HistoryMeasureList/HistoryMeasures/:patientId" element={<HistoryMeasures/>}></Route>
            <Route path="Egresos" element={<Egresos />}> </Route>
            <Route path="BalancesPatient" element={<BalancesPatient/>}></Route>
            <Route path="/RetreatsPatients" element={<RetreatsPatients/>}></Route>
            <Route path="/RetreatsPatients/Retreats/:saleId" element={<Retreats/>}></Route>
            <Route path="/Balance" element={<Balance/>}></Route>
            <Route path="/ListLens" element={<ListLens/>}></Route>
            <Route path="/ListBalance" element={<ListBalance/>}></Route>
            <Route path="/ListSales" element={<ListSales/>}></Route>
            <Route path="/HistoryClinic" element={<HistoryClinic />} />
            <Route path="/HistoryClinic/PatientHistory/:patientId" element={<PatientHistory />} />
            <Route path="/HistoryClinic/PatientHistory/:patientId/SalesHistory/:saleId" element={<SalesHistory />} />
        </Routes>
    )
}

export default AppRouter;