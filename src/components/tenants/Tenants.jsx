import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tenants')
      .select('*');
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } else {
      setTenants(data);
    }
  }

  async function handleCreateTenant() {
    setCreating(true);
    // 1) create tenant record
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ name: newTenantName }])
      .select()
      .single();
    if (tenantError) {
      setCreating(false);
      toast({ title: 'Error', description: tenantError.message, status: 'error' });
      return;
    }
    // 2) sign up tenant_admin
    const randomPassword = Math.random().toString(36).slice(-8);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail.trim(),
      password: randomPassword,
      options: { data: { tenant_id: tenant.id, role: 'Tenant-Admin' } }
    });
    if (signUpError) {
      // optionally rollback tenant creation
      setCreating(false);
      toast({ title: 'Error', description: signUpError.message, status: 'error' });
      return;
    }
    setCreating(false);
    setIsOpen(false);
    setNewTenantName('');
    setAdminEmail('');
    toast({ title: 'Inquilino creado', description: `Contraseña inicial: ${randomPassword}`, status: 'success' });
    fetchTenants();
  }

  return (
    <Box p={6}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="lg">Gestión de Tenants</Heading>
        <Button colorScheme="teal" onClick={() => setIsOpen(true)}>Nuevo Tenant</Button>
      </Box>

      {loading ? <Spinner /> : (
        <Table>
          <Thead>
            <Tr><Th>ID</Th><Th>Nombre</Th><Th>Creado</Th></Tr>
          </Thead>
          <Tbody>
            {tenants.map(t => (
              <Tr key={t.id}>
                <Td>{t.id}</Td>
                <Td>{t.name}</Td>
                <Td>{new Date(t.created_at).toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Tenant</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Nombre del Tenant</FormLabel>
              <Input value={newTenantName} onChange={e => setNewTenantName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Email Tenant Admin</FormLabel>
              <Input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} type="email" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button colorScheme="teal" isLoading={creating} onClick={handleCreateTenant}>Crear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
