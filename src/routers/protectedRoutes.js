import AdminDashBoard from '../Admin/AdminDashBoard';
import SalesHistory from '../Admin/SalesHistory';
import Register from '../Admin/Register';
import Inventario from '../Admin/Inventario';
import RegisterPatientForm from '../Admin/RegisterPatientForm';
import VendedorDashBoard from '../Admin/VendedorDashBoard';
import OptometraDashBoard from '../Admin/OptometraDashBoard';
import ListPatients from '../pages/ListPatients';
import InventarioList from '../pages/InventarioList';
import Branch from '../pages/Branch';
import ListBranch from '../pages/ListBranch';
import Lab from '../pages/Lab';
import ListLab from '../pages/ListLab';
import CashClousure from '../pages/CashClousure';
import Sales from '../pages/Sales';
import RegisterLens from '../pages/RegisterLens';
import PatientRecords from '../pages/PatientRecords';
import MeasuresFinal from '../pages/MeasuresFinal';
import OrderLaboratoryList from '../pages/OrderLaboratoryList';
import LaboratoryOrder from '../pages/LaboratoryOrder';
import HistoryMeasureList from '../pages/HistoryMeasureList';
import HistoryMeasures from '../pages/HistoryMeasures';
import Egresos from '../pages/Egresos';
import BalancesPatient from '../pages/BalancesPatient';
import RetreatsPatients from '../pages/RetreatsPatients';
import Retreats from '../pages/Retreats';
import Balance from '../pages/Balance';
import ListLens from '../pages/ListLens';
import ListBalance from '../pages/ListBalance';
import ListSales from '../pages/ListSales';
import HistoryClinic from '../pages/HistoryClinic';
import PatientHistory from '../pages/PatientHistory';

const protectedRoutes = [
  { path: '/Admin', element: <AdminDashBoard /> },
  { path: '/SalesHistory', element: <SalesHistory /> },
  { path: '/Register', element: <Register /> },
  { path: '/Inventory', element: <Inventario /> },
  { path: '/RegisterPatient', element: <RegisterPatientForm /> },
  { path: '/Vendedor', element: <VendedorDashBoard /> },
  { path: '/Optometra', element: <OptometraDashBoard /> },
  { path: '/ListPatients', element: <ListPatients /> },
  { path: '/ListInventory', element: <InventarioList /> },
  { path: '/Branch', element: <Branch /> },
  { path: '/ListBranch', element: <ListBranch /> },
  { path: '/Labs', element: <Lab /> },
  { path: '/ListLabs', element: <ListLab /> },
  { path: '/CashClousure', element: <CashClousure /> },
  { path: '/Sales', element: <Sales /> },
  { path: '/RegisterLens', element: <RegisterLens /> },
  { path: '/PatientRecords', element: <PatientRecords /> },
  { path: '/MeasuresFinal', element: <MeasuresFinal /> },
  { path: '/OrderLaboratoryList', element: <OrderLaboratoryList /> },
  { path: '/OrderLaboratoryList/LaboratoryOrder/:patientId', element: <LaboratoryOrder /> },
  { path: '/HistoryMeasureList', element: <HistoryMeasureList /> },
  { path: '/HistoryMeasureList/HistoryMeasures/:patientId', element: <HistoryMeasures /> },
  { path: '/Egresos', element: <Egresos /> },
  { path: '/BalancesPatient', element: <BalancesPatient /> },
  { path: '/RetreatsPatients', element: <RetreatsPatients /> },
  { path: '/RetreatsPatients/Retreats/:saleId', element: <Retreats /> },
  { path: '/Balance', element: <Balance /> },
  { path: '/ListLens', element: <ListLens /> },
  { path: '/ListBalance', element: <ListBalance /> },
  { path: '/ListSales', element: <ListSales /> },
  { path: '/HistoryClinic', element: <HistoryClinic /> },
  { path: '/HistoryClinic/PatientHistory/:patientId', element: <PatientHistory /> },
  { path: '/HistoryClinic/PatientHistory/:patientId/SalesHistory/:saleId', element: <SalesHistory /> },
];

export default protectedRoutes;
