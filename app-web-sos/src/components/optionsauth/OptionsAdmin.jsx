import React from 'react';
import { Button, Box, SimpleGrid, Text, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';


import registrarPacienteIcon from "../../assets/registrarPacientes.svg";
import consultarCierredeCajaIcon from "../../assets/consultarCierredeCaja.svg"
import cierredeCajaIcon from "../../assets/cierredeCaja.svg"
import laboratorioOrdenIcon from "../../assets/laboratorioOrden.svg"
import enviosIcon from "../../assets/envios.svg"
import ventaIcon from "../../assets/venta.svg"
import entregasIcon from "../../assets/entregas.svg"
import saldosIcon from "../../assets/saldos.svg"
import egresosIcon from "../../assets/egresos.svg"
import historiaClinicaIcon from "../../assets/historiaClinica.svg"
import garantiaIcon from "../../assets/garantia.svg"
import inventarioIcon from "../../assets/inventario.svg"
import usuariosIcon from "../../assets/usuarios.svg"
import laboratoriosIcon from "../../assets/laboratorios.svg"
import sucursalesIcon from "../../assets/sucursales.svg"
import certificadoVisualIcon from "../../assets/certificadoVisual.svg"
import medidasIcon from "../../assets/medidas.svg"




const options = [
  { label: "REGISTRAR PACIENTE", icon: registrarPacienteIcon },
  { label: "HISTORIAL PACIENTE", icon:  historiaClinicaIcon }, 
  { label: "ORDEN DE LABORATORIO", icon: laboratorioOrdenIcon }, 
  { label: "ENVIOS", icon: enviosIcon }, 
  { label: "VENTA/ CONTRATO DE SERVICIO", icon: ventaIcon },
  { label: "RETIROS", icon: entregasIcon },
  { label: "CIERRE", icon: cierredeCajaIcon },
  { label: "SALDOS", icon: saldosIcon },
  { label: "EGRESOS", icon: egresosIcon },
  { label: "GARANTIA", icon: garantiaIcon },
  { label: "CONSUL GARANTIA", icon: registrarPacienteIcon },
  { label: "INVENTARIO", icon: inventarioIcon },
  { label: "USUARIOS", icon: usuariosIcon },
  { label: "LABORATORIOS", icon: laboratoriosIcon },
  { label: "SUCURSAL", icon: sucursalesIcon },
  { label: "CONSULTAR CIERRE", icon: consultarCierredeCajaIcon },
  { label: "IMPRIMIR CERTIFICADO", icon: certificadoVisualIcon },
  { label: "REGISTRAR LUNAS", icon: registrarPacienteIcon },
  { label: "REGISTRAR MEDIDAS", icon: medidasIcon }
];

const AdminDashBoard = () => {
  const navigate = useNavigate();

  const handleOptionClick = (label) => {
    switch (label) {
      case "USUARIOS":
        navigate('/Register');
        break;
      case "REGISTRAR PACIENTE":
        navigate('/RegisterPatient');
        break;
      case "INVENTARIO":
        navigate('/Inventory');
        break;
      case "SUCURSAL":
        navigate('/Branch');
        break;
      case "LABORATORIOS":
        navigate('/Labs');
        break;
      case "CONSULTAR CIERRE":
        navigate('/CashClousure');
        break;
      case "VENTA/ CONTRATO DE SERVICIO":
        navigate('/SalesForm');
        break;
      case "REGISTRAR LUNAS":
        navigate('/RegisterLens');
        break;
      case "REGISTRAR MEDIDAS":
        navigate('/RegisterMeasures');
        break;
      case "CIERRE":
        navigate('/PatientRecords');
        break;
      case "EGRESOS":
        navigate('/Egresos');
        break;
      case "ORDEN DE LABORATORIO":
        navigate('/OrderLaboratoryList');
        break;
      case "SALDOS":
        navigate('/BalancesPatient')
        break;
      case "HISTORIAL PACIENTE":
          navigate('/PatientHistory')
      default:
        break;
    }
  };

  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <>
      <Button onClick={() => handleNavigate('/Login')} mt={4}>
        Cerrar Sesión
      </Button>
      <SimpleGrid columns={[2, null, 4]} spacing={5}>
        {options.map((option, index) => (
          <Box
            key={index}
            textAlign="center"
            p={5}
            boxShadow="md"
            borderRadius="md"
            _hover={{ bg: "gray.100", cursor: "pointer" }}
            onClick={() => handleOptionClick(option.label)}
          >
            <Image
              src={option.icon}
              alt={option.label}
              boxSize="40px"
              mb={3}
              mx="auto"
            />
            <Text>{option.label}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </>
  );
};

export default AdminDashBoard;