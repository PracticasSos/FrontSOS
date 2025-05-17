import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Text, Image, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';

import registrarPacienteIcon from "../../assets/registrarPaciente.svg";
import consultarCierredeCajaIcon from "../../assets/consultarCierredeCaja.svg";
import cierredeCajaIcon from "../../assets/cierredeCaja.svg";
import laboratorioOrdenIcon from "../../assets/laboratorioOrden.svg";
import enviosIcon from "../../assets/envios.svg";
import ventaIcon from "../../assets/venta.svg";
import entregasIcon from "../../assets/entregas.svg";
import saldosIcon from "../../assets/saldos.svg";
import egresosIcon from "../../assets/egresos.svg";
import historiaClinicaIcon from "../../assets/historiaClinica.svg";
import inventarioIcon from "../../assets/inventario.svg";
import usuariosIcon from "../../assets/usuarios.svg";
import laboratoriosIcon from "../../assets/laboratorios.svg";
import sucursalesIcon from "../../assets/sucursales.svg";
import certificadoVisualIcon from "../../assets/certificadoVisual.svg";
import medidasIcon from "../../assets/medidas.svg";
import creditIcon from "../../assets/credit.svg";
import registarlunasIcon from "../../assets/registrarlunas.svg";
import medidasHistorialIcon from "../../assets/medidasHistorial.svg";

const defaultOptions = [
  { label: "REGISTRAR PACIENTE", icon: registrarPacienteIcon, route: "/RegisterPatient" },
  { label: "HISTORIAL DE VENTAS", icon: historiaClinicaIcon, route: "/HistoryClinic" },
  { label: "REGISTRAR MEDIDAS", icon: medidasIcon, route: "/MeasuresFinal" },
  { label: "HISTORIAL DE MEDIDAS", icon: medidasHistorialIcon, route: "/HistoryMeasureList" }
];

const extraRouters = [
  { label: "ORDEN DE LABORATORIO", icon: laboratorioOrdenIcon, route: "/OrderLaboratoryList" },
  { label: "ENVIOS", icon: enviosIcon },
  { label: "VENTA/ CONTRATO DE SERVICIO", icon: ventaIcon, route: "/Sales" },
  { label: "RETIROS", icon: entregasIcon, route: "/RetreatsPatients" },
  { label: "CIERRE", icon: cierredeCajaIcon, route: "/PatientRecords" },
  { label: "SALDOS", icon: saldosIcon, route: "/BalancesPatient" },
  { label: "EGRESOS", icon: egresosIcon, route: "/Egresos" },
  { label: "INVENTARIO", icon: inventarioIcon, route: "/Inventory" },
  { label: "USUARIOS", icon: usuariosIcon, route: "/Register" },
  { label: "LABORATORIOS", icon: laboratoriosIcon, route: "/Labs" },
  { label: "SUCURSAL", icon: sucursalesIcon, route: "/Branch" },
  { label: "CONSULTAR CIERRE", icon: consultarCierredeCajaIcon, route: "/CashClousure" },
  { label: "IMPRIMIR CERTIFICADO", icon: certificadoVisualIcon },
  { label: "REGISTRAR LUNAS", icon: registarlunasIcon, route: "/RegisterLens" },
  { label: "CREDITOS", icon: creditIcon, route: "/Balance" }
];

const OptometraDashBoard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const navigate = useNavigate();

  const getRoutesByPermissions = (permittedRoutes) => {
    if (!permittedRoutes || permittedRoutes.length === 0) {
      return defaultOptions;
    }
    const defaultFiltered = defaultOptions.filter(option =>
      permittedRoutes.includes(option.route)
    );
    const extraFiltered = extraRouters.filter(option =>
      permittedRoutes.includes(option.route)
    );
    return [...defaultFiltered, ...extraFiltered];
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        navigate('/Login');
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));

      const { data: permissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('route')
        .eq('auth_id', currentUser.id);

      if (permissionsError || !permissions) {
        setAllowedRoutes(defaultOptions);
      } else {
        const permittedRoutes = permissions.map(p => p.route);
        setAllowedRoutes(getRoutesByPermissions(permittedRoutes));
      }

      setLoading(false);
    };

    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    if (userFromStorage) {
      setUser(userFromStorage);
      supabase
        .from('user_permissions')
        .select('route')
        .eq('user_id', userFromStorage.id)
        .then(({ data: permissions, error }) => {
          if (error || !permissions) {
            setAllowedRoutes(defaultOptions);
          } else {
            const permittedRoutes = permissions.map(p => p.route);
            setAllowedRoutes(getRoutesByPermissions(permittedRoutes));
          }
          setLoading(false);
        });
    } else {
      checkSession();
    }
  }, [navigate]);

  if (loading || !user) return null;

  return (
    <>
      <Button onClick={() => {
        supabase.auth.signOut();
        localStorage.removeItem('user');
        navigate('/Login');
      }} mt={4}>
        Cerrar Sesión
      </Button>

      <SimpleGrid columns={[2, null, 4]} spacing={5} mt={4}>
        {allowedRoutes.map((option, index) => (
          <Box
            key={index}
            textAlign="center"
            p={5}
            boxShadow="md"
            borderRadius="md"
            _hover={{ bg: "gray.100", cursor: "pointer" }}
            onClick={() => navigate(option.route)}
          >
            <Image src={option.icon} alt={option.label} boxSize="40px" mb={3} mx="auto" />
            <Text>{option.label}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </>
  );
};

export default OptometraDashBoard;
