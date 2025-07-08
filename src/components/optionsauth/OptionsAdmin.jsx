import React, { useEffect, useState } from 'react';
import { Button, Box, SimpleGrid, Text, Image, useBreakpointValue, VStack, Heading,
  useColorModeValue} from '@chakra-ui/react';
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

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const options = [
  { label: "REGISTRAR PACIENTE", icon: iconoregistrar },
  { label: "HISTORIAL PACIENTE", icon:  iconohistorialventa }, 
  { label: "ORDEN DE LABORATORIO", icon: iconoordenlaboratorio }, 
  { label: "ENVIOS", icon: iconoenvios }, 
  { label: "VENTA/ CONTRATO DE SERVICIO", icon: iconoventa },
  { label: "RETIROS", icon: iconoretiros },
  { label: "CIERRE", icon: iconocierrediario },
  { label: "SALDOS", icon: iconossaldos },
  { label: "EGRESOS", icon: iconoegresos },
  { label: "HISTORIAL DE MEDIDAS", icon: iconohistorialmedidas },
  { label: "INVENTARIO", icon: iconoinventario },
  { label: "USUARIOS", icon: iconousuarios },
  { label: "LABORATORIOS", icon: iconolaboratorios },
  { label: "SUCURSAL", icon: iconosucursal },
  { label: "CONSULTAR CIERRE", icon: iconoconsultarcierre },
  { label: "IMPRIMIR CERTIFICADO", icon: iconocertificadovisual },
  { label: "REGISTRAR LUNAS", icon: iconolunas },
  { label: "REGISTRAR MEDIDAS", icon: iconomedidas },
  { label: "CREDITOS", icon: iconocreditos },
  { label: "EXPERIENCIA", icon: iconoexperienciausuario },
  { label: "MENSAJES", icon: iconomensajes }
];

const AdminDashBoard = () => {
  const [showAll, setShowAll] = useState(false);
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
      case "MENSAJES":
        navigate('/MessageManager');
      break;
      case "EXPERIENCIA":
      navigate('/RegisterExperience');
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

  return (
    <Box
      bgGradient="linear(to-b, #bde9f0, rgb(56, 145, 170))"
      minH="100vh"
      py={[8, 10]}
      px={[4, 6, 8]}
      textAlign="center"
      color="white"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >

      {!showAll ? (
        <>
          {/* CARRUSEL */}
          <Box maxW="100%" mx="auto">
            <Swiper
              effect="coverflow"
              grabCursor
              centeredSlides
              slidesPerView={3}
              loop={true}
              autoplay={{ delay: 3000 }}
              navigation={true}
              modules={[EffectCoverflow, Autoplay, Navigation]}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 200,
                modifier: 2.5,
                slideShadows: false,
              }}
              loopFillGroupWithBlank={true}
              breakpoints={{
                0: {
                  slidesPerView: 3,
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
              }}
              style={{ paddingBottom: '40px' }}
            >
              {carouselItems.map((option, index) => (
                <SwiperSlide
                  key={index}
                  style={{
                    width: '240px',
                    height: 'auto',
                  }}
                  onClick={() => handleOptionClick(option.label)}
                >
                  <Box
                    bg={bgCard}
                    borderRadius="2xl"
                    overflow="hidden"
                    boxShadow="2xl"
                    transition="0.3s"
                    _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
                    h={['160px', '260px', '360px']}
                  >
                    <Image
                      src={option.icon}
                      alt={option.label}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  </Box>
                  <Text mt={2} fontSize="sm" fontWeight="semibold" color={textColor}>
                    {option.label}
                  </Text>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>

          <Heading mt={6} fontSize={["2xl", "3xl", "4xl"]} fontWeight="bold">
            Opciones Disponibles
          </Heading>

          <Button
            mt={6}
            colorScheme="whiteAlpha"
            variant="outline"
            size="lg"
            borderRadius="full"
            onClick={() => setShowAll(true)}
            _hover={{ bg: "whiteAlpha.300" }}
          >
            Buscar más
          </Button>
        </>
      ) : (
        <>
          {/* TODAS LAS TARJETAS */}
          <Heading mb={6} fontSize={["2xl", "3xl", "4xl"]} fontWeight="bold">
            Todas las Opciones
          </Heading>

          <SimpleGrid columns={[2, 3, 4]} spacing={5}>
            {options.map((option, index) => (
              <Box key={index} textAlign="center">
                <Box
                  onClick={() => handleOptionClick(option.label)}
                  bg={bgCard}
                  borderRadius="2xl"
                  boxShadow="lg"
                  overflow="hidden"
                  transition="0.3s"
                  _hover={{ transform: 'scale(1.05)', cursor: 'pointer', shadow: 'xl' }}
                >
                  <Image
                    src={option.icon}
                    alt={option.label}
                    w="100%"
                    h={["120px", "160px", "200px"]}
                    objectFit="cover"
                  />
                </Box>
                <Text mt={2} fontSize="sm" fontWeight="medium" color={textColor}>
                  {option.label}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          <Button
            mt={10}
            colorScheme="whiteAlpha"
            variant="outline"
            size="lg"
            borderRadius="full"
            onClick={() => setShowAll(false)}
            _hover={{ bg: "whiteAlpha.300" }}
          >
            Volver al carrusel
          </Button>
        </>
      )}
    </Box>
  );
};

export default AdminDashBoard;