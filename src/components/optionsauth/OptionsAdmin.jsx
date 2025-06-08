import React, { useEffect, useState } from 'react';
import { Button, Box, SimpleGrid, Text, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';


import registrarPacienteIcon from "../../assets/registrarPaciente.jpg";
import consultarCierredeCajaIcon from "../../assets/consultarCierredeCaja.svg";
import cierreCajaIcon from "../../assets/cierreCaja.jpg";
import laboratorioOrdenIcon from "../../assets/ordenLaboratorio.jpg";
import enviosIcon from "../../assets/envios.svg";
import ventaIcon from "../../assets/venta.jpg";
import retirosIcon from "../../assets/retiros.jpg";
import saldosIcon from "../../assets/pediente.jpg";
import egresosIcon from "../../assets/egresos.jpg";
import historiaClinicaIcon from "../../assets/historiaClinica.svg";
import inventarioIcon from "../../assets/inventario.jpg";
import usuariosIcon from "../../assets/usuarios.svg";
import laboratoriosIcon from "../../assets/laboratorios.svg";
import sucursalesIcon from "../../assets/sucursales.svg";
import certificadoVisualIcon from "../../assets/certificadovisual.jpg";
import medidasIcon from "../../assets/medidas.jpg";
import creditIcon from "../../assets/creditos.jpg";
import lunasIcon from "../../assets/lunas.jpg";
import medidasHistorialIcon from "../../assets/medidasHistorial.svg";
import { supabase } from '../../api/supabase';


const options = [
  { label: "REGISTRAR PACIENTE", icon: registrarPacienteIcon },
  { label: "HISTORIAL PACIENTE", icon:  historiaClinicaIcon }, 
  { label: "ORDEN DE LABORATORIO", icon: laboratorioOrdenIcon }, 
  { label: "ENVIOS", icon: enviosIcon }, 
  { label: "VENTA/ CONTRATO DE SERVICIO", icon: ventaIcon },
  { label: "RETIROS", icon: retirosIcon },
  { label: "CIERRE", icon: cierreCajaIcon },
  { label: "SALDOS", icon: saldosIcon },
  { label: "EGRESOS", icon: egresosIcon },
  { label: "HISTORIAL DE MEDIDAS", icon: medidasHistorialIcon },
  { label: "INVENTARIO", icon: inventarioIcon },
  { label: "USUARIOS", icon: usuariosIcon },
  { label: "LABORATORIOS", icon: laboratoriosIcon },
  { label: "SUCURSAL", icon: sucursalesIcon },
  { label: "CONSULTAR CIERRE", icon: consultarCierredeCajaIcon },
  { label: "IMPRIMIR CERTIFICADO", icon: certificadoVisualIcon },
  { label: "REGISTRAR LUNAS", icon: lunasIcon },
  { label: "REGISTRAR MEDIDAS", icon: medidasIcon },
  { label: "CREDITOS", icon: creditIcon }
];

const AdminDashBoard = () => {
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
      case "HISTORIAL PACIENTE":
        navigate('/HistoryClinic')
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
    <Box key={index} textAlign="center">
      <Box
        onClick={() => handleOptionClick(option.label)}
        border="10px solid"
        borderColor="gray.300"
        borderRadius="md"
        overflow="hidden"
        boxShadow="md"
        _hover={{ borderColor: "blue.400", cursor: "pointer" }}
      >
        <Image
          src={option.icon}
          alt={option.label}
          objectFit="cover"
          w="100%"
          h="150px"
        />
      </Box>
      <Text mt={2}>{option.label}</Text>
    </Box>
  ))}
</SimpleGrid>


    </>
  );
};

export default AdminDashBoard;