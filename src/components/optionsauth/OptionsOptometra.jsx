import React, { useEffect, useState } from 'react';
import {Box,
  Flex,
  Text,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,} from '@chakra-ui/react';
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

  const carouselItems = options.slice(0, 5);
  const bgCard = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.100');

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

      <Box
            bgGradient="linear(to-b, #bde9f0, rgb(56, 145, 170))"
            minH="100vh"
          >
            <Flex
              bg="gray.200"
              px={6}
              py={3}
              align="center"
              justify="space-between"
              boxShadow="sm"
            >
              {/* Izquierda: Espaciador invisible */}
              <Box />
      
              {/* Centro: Menú */}
              <Flex gap={20} align="center">
                <Text
                  fontWeight="medium"
                  cursor="pointer"
                  onClick={() => navigate('/')}
                >
                  Inicio
                </Text>
                <Text
                  fontWeight="medium"
                  cursor="pointer"
                  onClick={() => navigate('/PrintCertificate')}
                >
                  Certificado
                </Text>
                <Text
                  fontWeight="medium"
                  cursor="pointer"
                  onClick={() => navigate('/egresos')}
                >
                  Egresos
                </Text>
              </Flex>
      
              {/* Derecha: Iconos */}
              <Flex gap={4} align="center">
                {/* Avatar redondo que navega a perfil */}
                <Image
                  src={iconocierrediario} // o usuariomasculino
                  w="55px"
                  h="55px"
                  borderRadius="full"
                  cursor="pointer"
                  onClick={() => navigate('/PatientRecords')}
                  border="2px solid #50bcd8"
                  objectFit="cover"
                />
      
                {/* Botón tipo menú desplegable */}
                  <Menu>
                  <MenuButton>
                    <Image
                      src={usuariomasculino} 
                      w="55px"
                      h="55px"
                      borderRadius="full"
                      cursor="pointer"
                      border="2px solid #50bcd8"
                      objectFit="cover"
                      _hover={{ opacity: 0.8 }}
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => navigate('/Register')}>
                      Registrar Usuario
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/BalancesPatient')}>
                      Saldos Pendientes
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/MessageManager')}>
                      Mensajes
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </Flex>
      
            {/* ZONA CENTRAL */}
            <Flex
              direction="column"
              align="center"
              py={[8, 10]}
              px={[4, 6, 8]}
              mt={32}
              textAlign="center"
            >
              {/* Tarjetas */}
              <Flex
                justify="center"
                align="center"
                flexWrap="wrap"
                gap={6}
                mb={10}
              >
                {(showAll ? moreItems : carouselItems).map((option, index) => (
                  <Box
                    key={index}
                    bg={bgCard}
                    borderRadius="xl"
                    boxShadow="lg"
                    overflow="hidden"
                    w={["120px", "140px", "160px"]}
                    h={["160px", "180px", "200px"]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    transition="0.3s"
                    _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                    onClick={() => handleOptionClick(option.label)}
                  >
                    <Image
                      src={option.icon}
                      alt={option.label}
                      w="60%"
                      h="60%"
                      objectFit="contain"
                    />
                  </Box>
                ))}
              </Flex>
      
              {/* Botón Ver más */}
              <Button
                colorScheme="whiteAlpha"
                variant="outline"
                size="lg"
                borderRadius="full"
                onClick={() => setShowAll(!showAll)}
                _hover={{ bg: "whiteAlpha.300" }}
              >
               {showAll ? "Ver menos" : "Ver más"}
              </Button>
            </Flex>
          </Box>
    </>
  );
};

export default OptometraDashBoard;
