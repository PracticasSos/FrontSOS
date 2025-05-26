import React, { useEffect, useState } from 'react';
import {
  Box,
  Image,
  Text,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { supabase } from '../../../api/supabase';

const SelloSelector = ({ onSelect }) => {
  const [sellos, setSellos] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selloData, setSelloData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para convertir imagen a base64
  const convertImageToBase64 = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // devuelve el base64
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error al convertir la imagen a base64:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchSellos = async () => {
      const { data, error } = await supabase
        .from('sello')
        .select(`
          user_id,
          sello_url,
          users (
            firstname,
            lastname,
            ci
          )
        `)
        .order('user_id', { ascending: true });

      if (error) {
        console.error('Error al obtener sellos:', error.message);
        setLoading(false);
        return;
      }

      setSellos(data);
      setLoading(false);
    };

    fetchSellos();
  }, []);

  const handleSelect = async (userId) => {
    setSelectedUserId(userId);
    const seleccionado = sellos.find((s) => s.user_id === userId);

    if (seleccionado) {
      const base64Image = await convertImageToBase64(seleccionado.sello_url);
      const selloConBase64 = {
        ...seleccionado,
        sello_base64: base64Image,
      };

      setSelloData(selloConBase64);

      if (onSelect) onSelect(base64Image); // también envías el base64 al padre
    } else {
      setSelloData(null);
    }
  };

  const selectedLabel =
    selloData && selloData.users
      ? `${selloData.users.firstname} ${selloData.users.lastname}`
      : 'Seleccione sello';

  if (loading) {
    return <Text>Cargando...</Text>;
  }

  return (
    <Box my={4} maxW="400px" textAlign="left" ml={["5%", "10%", "15%"]}>
      {selloData && selloData.users && selloData.sello_base64 && (
        <>
          <Image
            src={selloData.sello_base64}
            alt={`Sello de ${selloData.users.firstname} ${selloData.users.lastname}`}
            boxSize="300px"
            objectFit="contain"
            mb={-20}
          />
          <Divider mb={1} />
        </>
      )}

      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} w="100%">
          {selectedLabel}
        </MenuButton>
        <MenuList maxH="150px" overflowY="auto">
          {sellos.map((sello) => (
            <MenuItem key={sello.user_id} onClick={() => handleSelect(sello.user_id)}>
              {sello.users
                ? `${sello.users.firstname} ${sello.users.lastname}`
                : 'Sin nombre'}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      {selloData && selloData.users && (
        <Text mt={1} color="gray.600">
          Cédula: {selloData.users.ci}
        </Text>
      )}
    </Box>
  );
};

export default SelloSelector;
