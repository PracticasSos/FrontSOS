import React, { useEffect, useState } from 'react';
import { Button, Box, SimpleGrid, Text, Image, useBreakpointValue, VStack, Heading,
  useColorModeValue} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import experienciaIcon from "../../assets/experiencia.jpg";
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

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

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
  { label: "CREDITOS", icon: creditIcon },
  { label: "EXPERIENCIA", icon: experienciaIcon } 
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
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Box bg="gray.50" minH="100vh" py={8} px={[4, 6, 8]}>
      <Heading size="xl" mb={6} textAlign="center" color="teal.600">
        Panel de Administración
      </Heading>

      <Box maxW="100%" py={6}>
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={true}
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Autoplay, Pagination]}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: true,
          }}
        >
          {carouselItems.map((option, index) => (
            <SwiperSlide
              key={index}
              style={{ width: '240px', height: '350px' }}
              onClick={() => handleOptionClick(option.label)}
            >
              <Box
                bg={bgCard}
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                p={2}
              >
                <Image
                  src={option.icon}
                  alt={option.label}
                  w="100%"
                  h="300px"
                  objectFit="cover"
                  borderRadius="xl"
                />
                <Text mt={2} fontWeight="semibold" fontSize="md" color={textColor}>
                  {option.label}
                </Text>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      <SimpleGrid columns={[2, null, 4]} spacing={5} mt={8}>
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
                h="140px"
                objectFit="cover"
              />
            </Box>
            <Text mt={2} fontSize="sm" fontWeight="medium" color={textColor}>
              {option.label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <VStack mt={10} spacing={4}>
        <Button colorScheme="red" size="lg" onClick={() => handleNavigate('/LoginForm')}>
          Cerrar Sesión
        </Button>
      </VStack>
    </Box>
  );
};

export default AdminDashBoard;