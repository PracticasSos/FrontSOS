import React, { useEffect, useState } from 'react';
import { Box, Select, Input, Button, Image, Text, Stack, FormControl, FormLabel, Heading, useColorModeValue } from '@chakra-ui/react';
import { supabase } from '../../../api/supabase';

const UploadLogo = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // 1) Cargo todos los tenants (ópticas), sin filtrar
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('tenants')                  // Asegúrate de usar la tabla tenants
        .select('id, name')
        .order('name');
      if (error) console.error('Error fetching tenants:', error);
      else setTenants(data);
    })();
  }, []);

  // 2) Cuando selecciono un tenant, cargo su logo si existe
  useEffect(() => {
    if (!selectedTenant) {
      setLogoUrl(null);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('logos')
        .select('logo_url')
        .eq('tenant_id', selectedTenant)
        .single();
      if (!error && data) setLogoUrl(data.logo_url);
      else setLogoUrl(null);
    })();
  }, [selectedTenant]);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setErrorMsg('');
  };

  const handleUpload = async () => {
    if (!selectedTenant) return setErrorMsg('Selecciona una óptica primero');
    if (!file) return setErrorMsg('Selecciona un archivo primero');

    setUploading(true);
    setErrorMsg('');

    const bucket = 'optics-logos';       // Verifica que este bucket exista y sea público
    const path = `${selectedTenant}/${file.name}`;

    // Subo la imagen
    const { error: upErr } = await supabase
      .storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: true });

    if (upErr) {
      setErrorMsg(`Error subiendo archivo: ${upErr.message}`);
      setUploading(false);
      return;
    }

    // Obtengo URL pública
    const { publicURL, error: urlErr } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(path);

    if (urlErr) {
      setErrorMsg(`Error obteniendo URL: ${urlErr.message}`);
      setUploading(false);
      return;
    }

    // Inserto o actualizo en logos
    const { error: dbErr } = await supabase
      .from('logos')
      .upsert(
        { tenant_id: selectedTenant, logo_url: publicURL },
        { onConflict: 'tenant_id' }
      );

    if (dbErr) setErrorMsg(`Error guardando en BD: ${dbErr.message}`);
    else {
      setLogoUrl(publicURL);
      setFile(null);
      setErrorMsg('');
    }

    setUploading(false);
  };

  return (
    <Box bg={bg} p={6} borderWidth="1px" borderColor={borderColor} borderRadius="2xl" shadow="md" maxW="450px" mx="auto">
      <Heading size="md" mb={4} textAlign="center">Gestión de Logos</Heading>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Óptica</FormLabel>
          <Select placeholder="Selecciona una óptica" value={selectedTenant} onChange={e => setSelectedTenant(e.target.value)}>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </FormControl>

        {logoUrl && (
          <Box textAlign="center">
            <Text fontSize="sm" mb={2} color="gray.500">Logo actual:</Text>
            <Image src={logoUrl} alt="Logo actual" maxW="200px" mx="auto" />
          </Box>
        )}

        <FormControl>
          <FormLabel>Subir Logo</FormLabel>
          <Input type="file" accept="image/*" onChange={handleFileChange} />
        </FormControl>

        {errorMsg && <Text color="red.500" fontSize="sm" textAlign="center">{errorMsg}</Text>}

        <Button colorScheme="teal" onClick={handleUpload} isLoading={uploading} borderRadius="2xl">
          Subir / Actualizar Logo
        </Button>
      </Stack>
    </Box>
  );
};

export default UploadLogo;
