import React, { useEffect, useState } from 'react';
import { Button, Box, SimpleGrid, Text, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';


import consultarCierredeCajaIcon from "../../assets/consultarCierredeCaja.svg";
import cierredeCajaIcon from "../../assets/cierredeCaja.svg";
import ordenLaboratorioIcon from "../../assets/ordenLaboratorio.jpg";
import enviosIcon from "../../assets/envios.svg";
import ventaIcon from "../../assets/venta.jpg";
import retirosIcon from "../../assets/retiros.jpg";
import saldosIcon from "../../assets/pediente.jpg";
import egresosIcon from "../../assets/egresos.svg";
import historiaClinicaIcon from "../../assets/historiaClinica.svg";
import inventarioIcon from "../../assets/inventario.svg";
import usuariosIcon from "../../assets/usuarios.svg";
import laboratoriosIcon from "../../assets/laboratorios.svg";
import sucursalesIcon from "../../assets/sucursales.svg";
import certificadoVisualIcon from "../../assets/certificadovisual.jpg";
import medidasIcon from "../../assets/medidas.svg";
import creditIcon from "../../assets/creditos.jpg";
import registarlunasIcon from "../../assets/registrarlunas.svg";
import medidasHistorialIcon from "../../assets/medidasHistorial.svg";
import registrarPacienteIcon from "../../assets/registrarPaciente.jpg";
import { supabase } from '../../api/supabase';


const options = [
  { label: "REGISTRAR PACIENTE", icon: registrarPacienteIcon },
  { label: "HISTORIAL PACIENTE", icon:  historiaClinicaIcon }, 
  { label: "ORDEN DE LABORATORIO", icon: ordenLaboratorioIcon }, 
  { label: "ENVIOS", icon: enviosIcon }, 
  { label: "VENTA/ CONTRATO DE SERVICIO", icon: ventaIcon },
  { label: "RETIROS", icon: retirosIcon },
  { label: "CIERRE", icon: cierredeCajaIcon },
  { label: "SALDOS", icon: saldosIcon },
  { label: "EGRESOS", icon: egresosIcon },
  { label: "HISTORIAL DE MEDIDAS", icon: medidasHistorialIcon },
  { label: "INVENTARIO", icon: inventarioIcon },
  { label: "USUARIOS", icon: usuariosIcon },
  { label: "LABORATORIOS", icon: laboratoriosIcon },
  { label: "SUCURSAL", icon: sucursalesIcon },
  { label: "CONSULTAR CIERRE", icon: consultarCierredeCajaIcon },
  { label: "IMPRIMIR CERTIFICADO", icon: certificadoVisualIcon },
  { label: "REGISTRAR LUNAS", icon: registarlunasIcon },
  { label: "REGISTRAR MEDIDAS", icon: medidasIcon },
  { label: "CREDITOS", icon: creditIcon },
  {label: "LOGOS", icon: creditIcon },
  {label: "TENANT", icon: creditIcon }

];

const SuperAdminDashBoard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        console.error('Error al obtener la sesión:', error);
        navigate('/Login');
      } else {
        setUser(session.user);
        localStorage.setItem('user', JSON.stringify(session.user));
      }
      setLoading(false);
    };

    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    if (userFromStorage) {
      setUser(userFromStorage);
      setLoading(false);
    } else {
      checkSession();
    }
  }, [navigate]);

  if (loading || !user) {
    return null; 
  }

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
        navigate('/Sales');
        break;
      case "REGISTRAR LUNAS":
        navigate('/RegisterLens');
        break;
      case "REGISTRAR MEDIDAS":
        navigate('/MeasuresFinal');
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
      case "RETIROS":
        navigate('/RetreatsPatients')
        break;
      case "CREDITOS":
        navigate('/Balance')
        break;
      case "HISTORIAL DE MEDIDAS":
        navigate('/HistoryMeasureList')
        break;
      case "IMPRIMIR CERTIFICADO":
        navigate('/PrintCertificate')
      break;
      case "HISTORIAL DE VENTAS":
          navigate('/HistoryClinic')
        break;
      case "LOGOS":
        navigate('/UploadLogo')
        break;
      case "TENANT":
        navigate('/Tenant')
        break;
      default:
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

export default SuperAdminDashBoard;