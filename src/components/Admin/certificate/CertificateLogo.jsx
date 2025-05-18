import React, { useEffect, useState } from 'react';
import { Center, Spinner, Image, Box, Text } from '@chakra-ui/react';
import { supabase } from '../../../api/supabase';

const CertificateLogo = ({ tenantId }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('logos')
        .select('logo_url')
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        console.error('Error loading logo for certificate:', error);
      } else {
        setLogoUrl(data.logo_url);
      }
      setLoading(false);
    })();
  }, [tenantId]);

  if (loading) {
    return (
      <Center my={6}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!logoUrl) {
    return (
      <Box textAlign="center" my={6}>
        <Text color="gray.500">Sin logo configurado</Text>
      </Box>
    );
  }

  return (
    <Center my={6}>
      <Image src={logoUrl} alt="Logo de la óptica" maxW="200px" />
    </Center>
  );
};

export default CertificateLogo;
