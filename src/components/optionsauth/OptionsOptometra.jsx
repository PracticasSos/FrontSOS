import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Text, Image, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';

import iconocertificadovisual from "../../assets/iconocertificadovisual.png";
import iconocierrediario from "../../assets/iconocierrediario.png";
import iconoconsultarcierre from "../../assets/iconoconsultarcierre.png";
import iconocreditos from "../../assets/iconocreditos.png";
import iconoegresos from "../../assets/iconoegresos.png";
import iconoenvios from "../../assets/iconoenvios.png";
import iconoexperienciausuario from "../../assets/iconoexperienciausuario.png";
import iconohistorialmedidas from "../../assets/iconohistorialmedidas.png";
import iconohistorialventa from "../../assets/iconohistorialventa.png";
import iconoinventario from "../../assets/iconoinventario.png";
import iconolaboratorios from "../../assets/iconolaboratorios.png";
import iconolunas from "../../assets/iconolunas.png";
import iconomedidas from "../../assets/iconomedidas.png";
import iconomensajes from "../../assets/iconomensajes.png";
import iconoordenlaboratorio from "../../assets/iconoordenlaboratorio.png";
import iconoregistrar from "../../assets/iconoregistrar.png";
import iconoretiros from "../../assets/iconoretiros.png";
import iconossaldos from "../../assets/iconossaldos.png";
import iconosucursal from "../../assets/iconosucursal.png";
import iconousuarios from "../../assets/iconousuarios.png";
import iconoventa from "../../assets/iconoventa.png";

const defaultOptions = [
  { label: "REGISTRAR PACIENTE", icon: iconoregistrar, route: "/RegisterPatient" },
  { label: "HISTORIAL DE VENTAS", icon: iconohistorialventa, route: "/HistoryClinic" },
  { label: "REGISTRAR MEDIDAS", icon: iconomedidas, route: "/MeasuresFinal" },
  { label: "HISTORIAL DE MEDIDAS", icon: iconohistorialmedidas, route: "/HistoryMeasureList" }
];

const extraRouters = [
    { label: "ORDEN DE LABORATORIO", icon: iconoordenlaboratorio, route: "/OrderLaboratoryList" },
    { label: "VENTA/ CONTRATO DE SERVICIO", icon: iconoventa, route: "/Sales" },
    { label: "RETIROS", icon: iconoretiros, route: "/RetreatsPatients" },
    { label: "CIERRE", icon: iconocierrediario, route: "/PatientRecords" },
    { label: "SALDOS", icon: iconossaldos, route: "/BalancesPatient" },
    { label: "EGRESOS", icon: iconoegresos, route: "/Egresos" },
    { label: "CREDITOS", icon: iconocreditos, route: "/Balance" },
    { label: "INVENTARIO", icon: iconoinventario, route: "/Inventory" },
    { label: "REGISTRAR LUNAS", icon: iconolunas, route: "/RegisterLens" },
    { label: "USUARIOS", icon: iconousuarios, route: "/Register" },
    { label: "LABORATORIOS", icon: iconolaboratorios, route: "/Labs" },
    { label: "SUCURSAL", icon: iconosucursal, route: "/Branch" },
    { label: "CONSULTAR CIERRE", icon: iconoconsultarcierre, route: "/CashClousure" },
    { label: "IMPRIMIR CERTIFICADO", icon: iconocertificadovisual, route: "/VisualCertificate" },
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
