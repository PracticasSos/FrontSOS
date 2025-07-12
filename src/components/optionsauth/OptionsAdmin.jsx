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
  useColorModeValue,
  useDisclosure,
  IconButton,
  Link,
  Stack,
  Collapse,
  } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
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
import usuariofemenino from "../../assets/usuariofemenino.png";
import usuariomasculino from "../../assets/usuariomasculino.png";
import { supabase } from '../../api/supabase';
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


const options = [
  { label: "REGISTRAR PACIENTE", icon: iconoregistrar },
  { label: "REGISTRAR MEDIDAS", icon: iconomedidas },
  { label: "VENTA/ CONTRATO DE SERVICIO", icon: iconoventa },
  { label: "RETIROS", icon: iconoretiros },
  { label: "EXPERIENCIA", icon: iconoexperienciausuario },
  { label: "USUARIOS", icon: iconousuarios },
  { label: "SALDOS", icon: iconossaldos },
  { label: "MENSAJES", icon: iconomensajes },
  { label: "CIERRE", icon: iconocierrediario },
  { label: "EGRESOS", icon: iconoegresos },
  { label: "IMPRIMIR CERTIFICADO", icon: iconocertificadovisual },

  { label: "HISTORIAL PACIENTE", icon:  iconohistorialventa }, 
  { label: "ORDEN DE LABORATORIO", icon: iconoordenlaboratorio }, 
  { label: "ENVIOS", icon: iconoenvios }, 
  { label: "HISTORIAL DE MEDIDAS", icon: iconohistorialmedidas },
  { label: "INVENTARIO", icon: iconoinventario },
  { label: "LABORATORIOS", icon: iconolaboratorios },
  { label: "SUCURSAL", icon: iconosucursal },
  { label: "CONSULTAR CIERRE", icon: iconoconsultarcierre },
  { label: "REGISTRAR LUNAS", icon: iconolunas },
  { label: "CREDITOS", icon: iconocreditos }
];

const AdminDashBoard = () => {
  const [showAll, setShowAll] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isOpen, onToggle } = useDisclosure();

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
      case "REGISTRAR PACIENTE":
        navigate('/RegisterPatient');
        break;
      case "REGISTRAR MEDIDAS":
        navigate('/MeasuresFinal');
        break;
      case "VENTA/ CONTRATO DE SERVICIO":
        navigate('/Sales');
        break;
      case "RETIROS":
        navigate('/RetreatsPatients')
        break;
      case "EXPERIENCIA":
        navigate('/RegisterExperience');
        break;
      case "USUARIOS":
        navigate('/Register');
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
      case "REGISTRAR LUNAS":
        navigate('/RegisterLens');
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
      case "MENSAJES":
        navigate('/MessageManager');
      break;
      default:
    }
  };

  const handleNavigate = (route) => {
    navigate(route);
  };


  const carouselItems = options.slice(0, 5);
  const bgCard = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.100');
  const moreItems = [
    { label: "HISTORIAL PACIENTE", icon: iconohistorialventa },
    { label: "ORDEN DE LABORATORIO", icon: iconoordenlaboratorio },
    { label: "ENVIOS", icon: iconoenvios },
    { label: "HISTORIAL DE MEDIDAS", icon: iconohistorialmedidas },
    { label: "INVENTARIO", icon: iconoinventario },
    { label: "LABORATORIOS", icon: iconolaboratorios },
    { label: "SUCURSAL", icon: iconosucursal },
    { label: "CONSULTAR CIERRE", icon: iconoconsultarcierre },
    { label: "REGISTRAR LUNAS", icon: iconolunas },
    { label: "CREDITOS", icon: iconocreditos }
  ];

  return (
    <Box
      bgGradient="linear(to-b, #bde9f0, rgb(56, 145, 170))"
      minH="100vh"
    >
      <Box
      as="nav"
      position="fixed"
      top="1rem"
      left="50%"
      transform="translateX(-50%)"
      width="80%"
      zIndex="9999"
      bg="rgba(13,13,13,0.5)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255,255,255,0.1)"
      borderRadius="20px"
    >
      <Flex
        align="center"
        justify="space-between"
        py={3}
        px={6}
        fontFamily="Satoshi, sans-serif"
        minH="60px"
      >
        {/* Logo ALGORA */}
        <Text
          fontSize="xl"
          fontFamily="Chaney Extended, sans-serif"
          fontWeight="bold"
          color="white"
        >
          ALGORA
        </Text>

        <Flex gap={24} align="center" display={{ base: "none", md: "flex" }}>
          <Text
            color="white"
            cursor="pointer"
            onClick={() => navigate("/")}
            _hover={{ color: "#00E599" }}
            fontWeight="medium"
          >
            Inicio
          </Text>
          <Text
            color="white"
            cursor="pointer"
            onClick={() => navigate("/PrintCertificate")}
            _hover={{ color: "#00E599" }}
            fontWeight="medium"
          >
            Certificado
          </Text>
          <Text
            color="white"
            cursor="pointer"
            onClick={() => navigate("/egresos")}
            _hover={{ color: "#00E599" }}
            fontWeight="medium"
          >
            Egresos
          </Text>
          </Flex>

        {/* Desktop: íconos a la derecha */}
        <Flex display={{ base: "none", md: "flex" }} gap={8} align="center" justify="center" mt={4}>
          <Image
            src={iconocierrediario}
            w="45px"
            h="45px"
            objectFit="cover"
            objectPosition="bottom"
            borderRadius="full"
            cursor="pointer"
            onClick={() => navigate("/PatientRecords")}
            border="2px solid #50bcd8"
          />
          <Menu>
            <MenuButton>
              <Image
                src={usuariomasculino}
                w="45px"
                h="45px"
                borderRadius="full"
                cursor="pointer"
                border="2px solid #50bcd8"
                _hover={{ opacity: 0.8 }}
              />
            </MenuButton>
            <MenuList zIndex="99999">
              <MenuItem onClick={() => navigate("/Register")}>
                Registrar Usuario
              </MenuItem>
              <MenuItem onClick={() => navigate("/BalancesPatient")}>
                Saldos Pendientes
              </MenuItem>
              <MenuItem onClick={() => navigate("/MessageManager")}>
                Mensajes
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        {/* Móvil: botón hamburguesa */}
        <IconButton
          aria-label="Abrir menú"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          display={{ base: "flex", md: "none" }}
          onClick={onToggle}
          variant="ghost"
          color="white"
        />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Flex
          direction="column"
          align="center"
          bg="black"
          px={4}
          py={4}
          borderBottomRadius="12px"
          borderTop="1px solid rgba(255,255,255,0.1)"
          display={{ md: "none" }}
        >
          <Stack spacing={3} align="center" width="100%">
            <Flex gap={4} justify="flex-end" pt={3}>
              <Image
                src={iconocierrediario}
                w="40px"
                h="40px"
                borderRadius="full"
                cursor="pointer"
                onClick={() => {
                  onToggle();
                  navigate("/PatientRecords");
                }}
                border="2px solid #50bcd8"
              />

              <Menu>
                <MenuButton>
                  <Image
                    src={usuariomasculino}
                    w="40px"
                    h="40px"
                    borderRadius="full"
                    cursor="pointer"
                    border="2px solid #50bcd8"
                    _hover={{ opacity: 0.8 }}
                  />
                </MenuButton>
                <MenuList zIndex="99999">
                  <MenuItem
                    onClick={() => {
                      onToggle();
                      navigate("/Register");
                    }}
                  >
                    Registrar Usuario
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      onToggle();
                      navigate("/BalancesPatient");
                    }}
                  >
                    Saldos Pendientes
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      onToggle();
                      navigate("/MessageManager");
                    }}
                  >
                    Mensajes
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
            <Text
              color="white"
              cursor="pointer"
              onClick={() => {
                onToggle();
                navigate("/");
              }}
              _hover={{ color: "#00E599" }}
            >
              Inicio
            </Text>
            <Text
              color="white"
              cursor="pointer"
              onClick={() => {
                onToggle();
                navigate("/PrintCertificate");
              }}
              _hover={{ color: "#00E599" }}
            >
              Certificado
            </Text>
            <Text
              color="white"
              cursor="pointer"
              onClick={() => {
                onToggle();
                navigate("/egresos");
              }}
              _hover={{ color: "#00E599" }}
            >
              Egresos
            </Text>
          </Stack>
        </Flex>
      </Collapse>
    </Box>

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
  );
};

export default AdminDashBoard;