import React, { useEffect, useState } from 'react';
import { Box,
  Flex,
  Text,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Center,
  Spinner,
  useColorModeValue,} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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
import usuariomasculino from "../../assets/usuariomasculino.png";

const defaultOptions = [
  { label: "REGISTRAR PACIENTE", icon: iconoregistrar, route: "/RegisterPatient" },
  { label: "HISTORIAL DE VENTAS", icon: iconohistorialventa, route: "/HistoryClinic" },
  { label: "ORDEN DE LABORATORIO", icon: iconoordenlaboratorio, route: "/OrderLaboratoryList" },
  { label: "VENTA/ CONTRATO DE SERVICIO", icon: iconoventa, route: "/Sales" },
  { label: "RETIROS", icon: iconoretiros, route: "/RetreatsPatients" },
  { label: "CIERRE", icon: iconocierrediario, route: "/PatientRecords" },
  { label: "SALDOS", icon: iconossaldos, route: "/BalancesPatient" },
  { label: "EGRESOS", icon: iconoegresos, route: "/Egresos" },
  { label: "REGISTRAR MEDIDAS", icon: iconomedidas, route: "/MeasuresFinal" },
  { label: "CREDITOS", icon: iconocreditos, route: "/Balance" },
  { label: "INVENTARIO", icon: iconoinventario, route: "/Inventory" },
  { label: "HISTORIAL DE MEDIDAS", icon: iconohistorialmedidas, route: "/HistoryMeasureList" },
  { label: "REGISTRAR LUNAS", icon: iconolunas, route: "/RegisterLens" },
];

const extraRouters = [
  { label: "USUARIOS", icon: iconousuarios, route: "/Register" },
  { label: "LABORATORIOS", icon: iconolaboratorios, route: "/Labs" },
  { label: "SUCURSAL", icon: iconosucursal, route: "/Branch" },
  { label: "CONSULTAR CIERRE", icon: iconoconsultarcierre, route: "/CashClousure" },
  { label: "IMPRIMIR CERTIFICADO", icon: iconocertificadovisual, route: "/PrintCertificate" },
];

const VendedorDashBoard = () => {
  const [showAll, setShowAll] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const navigate = useNavigate();

  const getRoutesByPermissions = (permittedRoutes) => {
    const defaultFiltered = defaultOptions.filter(option => option.route && permittedRoutes.includes(option.route));
    const extraFiltered = extraRouters.filter(option => option.route && permittedRoutes.includes(option.route));
    return [...defaultFiltered, ...extraFiltered];
  };

  const handleOptionClick = (label) => {
    const option = allowedRoutes.find(opt => opt.label === label);
    if (option && option.route) {
      navigate(option.route);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          const currentUser = session.user;
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
          localStorage.setItem("session", JSON.stringify(session));

          const { data: permissions, error: permissionsError } = await supabase
            .from("user_permissions")
            .select("route")
            .eq("auth_id", currentUser.id);

          if (permissionsError) {
            console.error("Error al obtener permisos:", permissionsError);
            // TEMPORAL: Mostrar todas las opciones por defecto si hay error
            setAllowedRoutes(defaultOptions);
          } else {
            const permittedRoutes = permissions.map(p => p.route);
            console.log("Permisos obtenidos:", permittedRoutes);
            const filteredRoutes = getRoutesByPermissions(permittedRoutes);
            console.log("Rutas filtradas:", filteredRoutes);
            setAllowedRoutes(filteredRoutes);
          }

          setLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("user");
        localStorage.removeItem("session");
        setUser(null);
        setAllowedRoutes([]);
        navigate("/Login");
      }
    });

    // Verificar sesión existente
    const sessionFromStorage = localStorage.getItem("session");
    const userFromStorage = localStorage.getItem("user");

    if (sessionFromStorage && userFromStorage) {
      const user = JSON.parse(userFromStorage);
      setUser(user);
      
      // TEMPORAL: Cargar permisos para usuario existente
      const loadPermissions = async () => {
        const { data: permissions, error: permissionsError } = await supabase
          .from("user_permissions")
          .select("route")
          .eq("auth_id", user.id);

        if (permissionsError) {
          console.error("Error al obtener permisos:", permissionsError);
          setAllowedRoutes(defaultOptions);
        } else {
          const permittedRoutes = permissions.map(p => p.route);
          const filteredRoutes = getRoutesByPermissions(permittedRoutes);
          setAllowedRoutes(filteredRoutes);
        }
      };

      loadPermissions();
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem("user", JSON.stringify(session.user));
          localStorage.setItem("session", JSON.stringify(session));
        } else {
          navigate("/Login");
        }
        setLoading(false);
      });
    }

    return () => {
      authListener?.subscription.unsubscribe();
    };
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

  const carouselItems = allowedRoutes.slice(0, 5);
  const moreItems = allowedRoutes.slice(5);
  const bgCard = useColorModeValue('white', 'gray.700');

  return (
    <>
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
                    <MenuItem onClick={() => navigate('/RegisterPatient')}>
                      Registrar Paciente
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

export default VendedorDashBoard;
