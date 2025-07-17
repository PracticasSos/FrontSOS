import React, { useState } from 'react';
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
  Stack,
  Collapse,
  Portal,} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useUserPermissions } from './UserPermissions';
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import ColorModeToggle from '../../Toggle';

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
import usuariofemenino from "../../assets/usuariofemenino.png";
import usuariomasculino from "../../assets/usuariomasculino.png";
import avataralgora from "../../assets/avataralgora.jpg";

const defaultOptions = [
  { label: "Registrar Paciente", icon: iconoregistrar, route: "/RegisterPatient" },
  { label: "Venta/ Contrato de Servicio", icon: iconoventa, route: "/Sales" },
  { label: "Orden de Laboratorio", icon: iconoordenlaboratorio, route: "/OrderLaboratoryList" },
  { label: "Retiros", icon: iconoretiros, route: "/RetreatsPatients" },
  { label: "Experiencia", icon: iconoexperienciausuario, route: "/RegisterExperience" },
  { label: "Historial de Ventas", icon: iconohistorialventa, route: "/HistoryClinic" },
  { label: "Cierre", icon: iconocierrediario, route: "/PatientRecords" },
  { label: "Saldos", icon: iconossaldos, route: "/BalancesPatient" },
  { label: "Egresos", icon: iconoegresos, route: "/Egresos" },
  { label: "Registrar Medidas", icon: iconomedidas, route: "/MeasuresFinal" },
  { label: "Créditos", icon: iconocreditos, route: "/Balance" },
  { label: "Inventario", icon: iconoinventario, route: "/Inventory" },
  { label: "Historial de Medidas", icon: iconohistorialmedidas, route: "/HistoryMeasureList" },
  { label: "Registrar Lunas", icon: iconolunas, route: "/RegisterLens" },
];

const extraRouters = [
  { label: "Usuarios", icon: iconousuarios, route: "/Register" },
  { label: "Laboratorios", icon: iconolaboratorios, route: "/Labs" },
  { label: "Sucursal", icon: iconosucursal, route: "/Branch" },
  { label: "Consultar Cierre", icon: iconoconsultarcierre, route: "/CashClousure" },
  { label: "Imprimir Certificado", icon: iconocertificadovisual, route: "/PrintCertificate" },
];

const VendedorDashBoard = () => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const { isOpen, onToggle } = useDisclosure();

  const { user, loading: authLoading, logout } = useAuth();
  const { allowedRoutes, loading: permissionsLoading } = useUserPermissions(user);

  if (authLoading || permissionsLoading) return null;
  if (!user) return null;

  // ✅ Todas las opciones disponibles
  const allOptions = [...defaultOptions, ...extraRouters];

  // ✅ Filtrar opciones basado en permisos
  const filteredOptions = allOptions.filter(option => 
    allowedRoutes.includes(option.route)
  );

  // ✅ Si no hay opciones filtradas, mostrar todas (fallback)
  const availableOptions = filteredOptions.length > 0 ? filteredOptions : allOptions;

  const carouselItems = availableOptions.slice(0, 5);
  
  const handleOptionClick = (label) => {
    // Buscar la opción por label y navegar a su ruta
    const option = allOptions.find(opt => opt.label === label);
    if (option && option.route) {
      navigate(option.route);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Colores adaptativos - mantener tu estética oscura para dark mode
  const mainBg = useColorModeValue(
    'linear(to-b, #f7fafc, #edf2f7)', // Light: gradiente gris claro
    '#000000' // Dark: tu negro actual
  );

  const navBg = useColorModeValue(
    'rgba(255, 255, 255, 0.9)', // Light: fondo blanco semi-transparente
    'rgba(46, 46, 46, 0.5)' // Dark: tu fondo actual
  );

  const navBorder = useColorModeValue(
    '1px solid rgba(0,0,0,0.1)', // Light: borde negro sutil
    '1px solid rgba(255,255,255,0.1)' // Dark: tu borde actual
  );

  const textColor = useColorModeValue(
    'gray.800', // Light: texto oscuro
    'white' // Dark: texto blanco
  );

  const textHoverColor = useColorModeValue(
    '#2196f3', // Light: azul
    '#00E599' // Dark: tu verde actual
  );

  const cardBg = useColorModeValue(
    'rgba(207, 202, 202, 0.5)', // Light: tarjetas blancas
    'rgba(46, 46, 46, 0.5)' // Dark: tu fondo actual
  );

  const cardBorder = useColorModeValue(
    '2px solid #219BAA', // Light: tu borde actual
    '2px solid #219BAA' // Dark: tu borde actual
  );

  const collapseBg = useColorModeValue(
    'white', // Light: fondo blanco
    'black' // Dark: tu negro actual
  );

  const borderTopColor = useColorModeValue(
    'rgba(0,0,0,0.1)', // Light: borde negro sutil
    'rgba(255,255,255,0.1)' // Dark: tu borde actual
  );

  // Agregar estilos adaptativos para el botón
  const buttonBg = useColorModeValue(
    'gray.300', // Light: fondo gris claro
    'whiteAlpha.200' // Dark: fondo transparente blanco
  );

  const buttonBorderColor = useColorModeValue(
    'gray.600', // Light: borde gris
    'whiteAlpha.300' // Dark: borde transparente blanco
  );

  const buttonTextColor = useColorModeValue(
    'gray.800', // Light: texto oscuro
    'white' // Dark: texto blanco
  );

  const buttonHoverBg = useColorModeValue(
    'gray.200', // Light: hover gris más oscuro
    'whiteAlpha.300' // Dark: hover transparente
  );

  const moreItems = [
      { label: "Créditos", icon: iconocreditos },
      { label: "Saldos", icon: iconossaldos },
      { label: "Envios", icon: iconoenvios },
      { label: "Mensajes", icon: iconomensajes }
    ];

return (
    <Box
      bg={mainBg}
      minH="100vh"
    >
      <Box
        as="nav"
        width="100%"
        zIndex="9999"
        pt="1rem"
        pb="1rem"
        display="flex"
        justifyContent="center"
      >
        <Box
          width="80%"
          bg={navBg}
          backdropFilter="blur(10px)"
          border={navBorder}
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
              fontFamily="Satoshi, sans-serif"
              fontWeight="bold"
              color={textColor}
            >
              ALGORA
            </Text>

            <Flex gap={24} align="center" display={{ base: "none", md: "flex" }}>
              <Text
                color={textColor}
                cursor="pointer"
                onClick={() => navigate("/")}
                _hover={{ color: textHoverColor }}
                fontWeight="medium"
              >
                Inicio
              </Text>
              <Text
                color={textColor}
                cursor="pointer"
                onClick={() => navigate("/PrintCertificate")}
                _hover={{ color: textHoverColor }}
                fontWeight="medium"
              >
                Certificado
              </Text>
              <Text
                color={textColor}
                cursor="pointer"
                onClick={() => navigate("/egresos")}
                _hover={{ color: textHoverColor }}
                fontWeight="medium"
              >
                Egresos
              </Text>
            </Flex>

            {/* Desktop: íconos a la derecha */}
            <Flex display={{ base: "none", md: "flex" }} gap={8} align="center" justify="center" mt={4}>
              {/* Toggle de modo oscuro */}
              <ColorModeToggle />
              
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
                    src={avataralgora}
                    w="45px"
                    h="45px"
                    borderRadius="full"
                    cursor="pointer"
                    border="2px solid #50bcd8"
                    _hover={{ opacity: 0.8 }}
                  />
                </MenuButton>
                <Portal>
                <MenuList zIndex="99999">
                  <MenuItem onClick={() => navigate("/MeasuresFinal")}>
                    Registrar Medidas
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/HistoryMeasureList")}>
                    Historial de Medidas
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Cerrar Sesión
                  </MenuItem>
                </MenuList>
                </Portal>
              </Menu>
            </Flex>

            {/* Móvil: botón hamburguesa y toggle */}
            <Flex display={{ base: "flex", md: "none" }} align="center" gap={2}>
              <ColorModeToggle />
              <IconButton
                aria-label="Abrir menú"
                icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                onClick={onToggle}
                variant="ghost"
                color={textColor}
              />
            </Flex>
          </Flex>

          <Collapse in={isOpen} animateOpacity>
            <Flex
              direction="column"
              align="center"
              bg={collapseBg}
              px={4}
              py={4}
              borderBottomRadius="12px"
              borderTop={`1px solid ${borderTopColor}`}
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
                        src={avataralgora}
                        w="40px"
                        h="40px"
                        borderRadius="full"
                        cursor="pointer"
                        border="2px solid #50bcd8"
                        _hover={{ opacity: 0.8 }}
                      />
                    </MenuButton>
                    <Portal>
                    <MenuList zIndex="99999">
                      <MenuItem
                        onClick={() => {
                          onToggle();
                          navigate("/MeasuresFinal");
                        }}
                      >
                        Registrar Medidas
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          onToggle();
                          navigate("/HistoryClinic");
                        }}
                      >
                        Historial de Venta
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          onToggle();
                          navigate("HistoryMeasureList");
                        }}
                      >
                        Historial de Medidas
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                    Cerrar Sesión
                  </MenuItem>
                    </MenuList>
                    </Portal>
                  </Menu>
                </Flex>
                
                <Text
                  color={textColor}
                  cursor="pointer"
                  onClick={() => {
                    onToggle();
                    navigate("/");
                  }}
                  _hover={{ color: textHoverColor }}
                >
                  Inicio
                </Text>
                <Text
                  color={textColor}
                  cursor="pointer"
                  onClick={() => {
                    onToggle();
                    navigate("/PrintCertificate");
                  }}
                  _hover={{ color: textHoverColor }}
                >
                  Certificado
                </Text>
                <Text
                  color={textColor}
                  cursor="pointer"
                  onClick={() => {
                    onToggle();
                    navigate("/egresos");
                  }}
                  _hover={{ color: textHoverColor }}
                >
                  Egresos
                </Text>
              </Stack>
            </Flex>
          </Collapse>
        </Box>
      </Box>

      {/* ZONA CENTRAL */}
      <Flex
        direction="column"
        align="center"
        py={[8, 10]}
        px={[4, 6, 8]}
        mt={8}
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
              borderRadius="xl"
              boxShadow="lg"
              bg={cardBg}
              border={cardBorder}
              overflow="hidden"
              w={["140px", "160px", "180px"]}
              h={["220px", "240px", "260px"]}
              display="flex"
              alignItems="center"
              justifyContent="center"
              transition="0.3s"
              _hover={{ transform: 'scale(1.15)', cursor: 'pointer' }}
              onClick={() => handleOptionClick(option.label)}
              position="relative" // ← Para posicionamiento
              flexDirection="column" // ← Cambiar a columna
            >
              <Image
                src={option.icon}
                alt={option.label}
                w="60%"
                h="60%"
                objectFit="contain"
              />
              <Text
                fontSize={["xs", "sm", "md"]} // ← Responsivo
                fontWeight="bold"
                textAlign="center"
                
                color={useColorModeValue(
                  '#2D3748', // Light: gris oscuro
                  '#E2E8F0'  // Dark: gris claro
                )}
                px={2} // ← Padding horizontal
                lineHeight="tight" // ← Espaciado de línea ajustado
                noOfLines={2} // ← Máximo 2 líneas
                sx={{
                  // Estilo personalizado para texto responsivo
                  fontSize: {
                    base: '10px',
                    sm: '11px',
                    md: '12px'
                  }
                }}
              >{option.label}</Text>
            </Box>
          ))}
        </Flex>

        {/* Botón Ver más */}
        <Button
          bg={buttonBg}
          border={`2px solid ${buttonBorderColor}`}
          color={buttonTextColor}
          variant="outline"
          size="lg"
          borderRadius="full"
          onClick={() => setShowAll(!showAll)}
          _hover={{ 
            bg: buttonHoverBg,
            transform: 'scale(1.05)'
          }}
          fontWeight="medium"
        >
         {showAll ? "Ver menos" : "Ver más"}
        </Button>
      </Flex>
    </Box>
  );
};

export default VendedorDashBoard;
