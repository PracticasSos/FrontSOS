import React, { useEffect, useState } from 'react';
import { Button, Box, SimpleGrid, Text, Image, Spinner, Center } from '@chakra-ui/react';
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
  { label: "ORDEN DE LABORATORIO", icon: laboratorioOrdenIcon, route: "/OrderLaboratoryList" },
  { label: "VENTA/ CONTRATO DE SERVICIO", icon: ventaIcon, route: "/Sales" },
  { label: "RETIROS", icon: entregasIcon, route: "/RetreatsPatients" },
  { label: "CIERRE", icon: cierredeCajaIcon, route: "/PatientRecords" },
  { label: "SALDOS", icon: saldosIcon, route: "/BalancesPatient" },
  { label: "EGRESOS", icon: egresosIcon, route: "/Egresos" },
  { label: "REGISTRAR MEDIDAS", icon: medidasIcon, route: "/MeasuresFinal" },
  { label: "CREDITOS", icon: creditIcon, route: "/Balance" },
  { label: "INVENTARIO", icon: inventarioIcon, route: "/Inventory" },
  { label: "HISTORIAL DE MEDIDAS", icon: medidasHistorialIcon, route: "/HistoryMeasureList" },
  { label: "REGISTRAR LUNAS", icon: registarlunasIcon, route: "/RegisterLens" },
];

const extraRouters = [
  { label: "USUARIOS", icon: usuariosIcon, route: "/Register" },
  { label: "LABORATORIOS", icon: laboratoriosIcon, route: "/Labs" },
  { label: "SUCURSAL", icon: sucursalesIcon, route: "/Branch" },
  { label: "CONSULTAR CIERRE", icon: consultarCierredeCajaIcon, route: "/CashClousure" },
  { label: "IMPRIMIR CERTIFICADO", icon: certificadoVisualIcon, route: "/VisualCertificate" },
];

const VendedorDashBoard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const navigate = useNavigate();

  const getRoutesByPermissions = (permittedRoutes) => {
    const defaultFiltered = defaultOptions.filter(option => option.route && permittedRoutes.includes(option.route));
    const extraFiltered = extraRouters.filter(option => option.route && permittedRoutes.includes(option.route));
    return [...defaultFiltered, ...extraFiltered];
  };

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) console.error("Error al obtener la sesión:", sessionError);

      const currentUser = session?.user || JSON.parse(localStorage.getItem('user'));

      if (!currentUser) {
        navigate('/Login');
        return;
      }

      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));

      const { data: permissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('route')
        .eq('auth_id', currentUser.id);


      if (permissionsError) {
        console.error("Error al obtener permisos:", permissionsError);
        setAllowedRoutes([]);
      } else if (!permissions || permissions.length === 0) {
        console.warn("El usuario no tiene permisos asignados.");
        setAllowedRoutes([]);
      } else {
        const permittedRoutes = permissions.map(p => p.route);
        setAllowedRoutes(getRoutesByPermissions(permittedRoutes));
      }

      setLoading(false);
    };

    loadUser();
  }, [navigate]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!user) {
    return <Text>No se encontró el usuario</Text>;
  }

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
            onClick={() => option.route && navigate(option.route)}
          >
            <Image src={option.icon} alt={option.label} boxSize="40px" mb={3} mx="auto" />
            <Text>{option.label}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </>
  );
};

export default VendedorDashBoard;
