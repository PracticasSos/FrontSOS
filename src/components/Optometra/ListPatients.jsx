import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { 
  Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, useToast, Flex, IconButton, Select
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const ListPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [branches, setBranchs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    fetchBranchs();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) {
      toast({ title: 'Error', description: 'Error al obtener los pacientes', status: 'error' });
    } else {
      setPatients(data);
    }
  };

  const fetchBranchs = async () => {
    const { data, error } = await supabase.from('branchs').select('id, name');
    if (error) {
      toast({ title: 'Error', description: 'Error al obtener las sucursales', status: 'error' });
    } else {
      setBranchs(data);
    }
  };

  const handleEdit = (id, patient) => {
    setEditingId(id);
    setEditableData(patient);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    const { error } = await supabase.from('patients').update(editableData).match({ id });
    if (!error) {
      toast({ title: 'Éxito', description: 'Paciente actualizado correctamente.', status: 'success' });
      setEditingId(null);
      fetchPatients();
    } else {
      toast({ title: 'Error', description: 'No se pudo actualizar el paciente.', status: 'error' });
    }
  };

  const openConfirm = (id) => {
    setSelectedId(id);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    handleDelete(selectedId);
  };

  const handleCancel = () => setIsOpen(false);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('patients').delete().match({ id });
    if (!error) {
      toast({ title: 'Éxito', description: 'Paciente eliminado correctamente.', status: 'success' });
      fetchPatients();
    } else {
      toast({ title: 'Error', description: 'No se pudo eliminar el paciente.', status: 'error' });
    }
  };

  const sortedPatients = [...patients].sort((a, b) => {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return new Date(b.date) - new Date(a.date);
  });

  const filteredPatients = sortedPatients.filter((patient) =>
  [patient.pt_firstname, patient.pt_lastname, patient.pt_phone].some((field) =>
    field?.toLowerCase().includes(search.toLowerCase())
  )
  );


  const handleNavigate = (route = null) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (route) {
      navigate(route);
      return;
    }
    if (!user || !user.role_id) {
      navigate('/LoginForm');
      return;
    }
    switch (user.role_id) {
      case 1:
        navigate('/Admin');
        break;
      case 2:
        navigate('/Optometra');
        break;
      case 3:
        navigate('/Vendedor');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Box p={5}>
      <Heading mb={4} textAlign="center">Lista de Pacientes</Heading>

      <Flex mb={4} gap={3} justify="center">
        <Button colorScheme="blue" onClick={() => handleNavigate('/RegisterPatient')}>Registrar Paciente</Button>
        <Button bgColor="#00A8C8" color="white" onClick={() => handleNavigate()}>Volver a Opciones</Button>
      </Flex>

      <Input
        placeholder="Buscar paciente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={4}
        w="50%"
        mx="auto"
        display="block"
      />

      <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
        <Table variant="striped" colorScheme="teal">
          <Thead bgColor="#00A8C8">
            <Tr>
              {[
                'Fecha', 'Nombre', 'Apellido', 'Ocupación', 'Dirección', 'Teléfono',
                'Edad', 'C.L.', 'Ciudad', 'Correo', 'Razón de Consulta',
                'Recomendaciones', 'Sucursal', 'Acciones'
              ].map((header) => (
                <Th key={header} fontWeight="bold" color="white" textAlign="center">{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {filteredPatients.map((patient) => (
              <Tr key={patient.id}>
                {[
                  'date','pt_firstname', 'pt_lastname', 'pt_occupation', 'pt_address', 'pt_phone',
                  'pt_age', 'pt_ci', 'pt_city', 'pt_email', 'pt_consultation_reason',
                  'pt_recommendations'
                ].map((field) => (
                  <Td key={field} textAlign="center">
                    {editingId === patient.id ? (
                      <Input name={field} value={editableData[field] || ''} onChange={handleChange} />
                    ) : (
                      patient[field] || 'N/A'
                    )}
                  </Td>
                ))}
                <Td key="branch_id" textAlign="center">
                  {editingId === patient.id ? (
                    <Select
                      name="branch_id"
                      value={editableData.branch_id || ""}
                      onChange={handleChange}
                    >
                      <option value="">Seleccione una sucursal</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    branches.find((branch) => branch.id === patient.branch_id)?.name || 'N/A'
                  )}
                </Td>
                <Td textAlign="center">
                  {editingId === patient.id ? (
                    <>
                      <IconButton icon={<BiCheck />} colorScheme="green" onClick={() => handleSave(patient.id)} mr={2} />
                      <IconButton icon={<BiX />} colorScheme="gray" onClick={() => setEditingId(null)} />
                    </>
                  ) : (
                    <>
                      <IconButton icon={<BiEdit />} colorScheme="yellow" onClick={() => handleEdit(patient.id, patient)} mr={2} />
                      <IconButton icon={<BiTrash />} colorScheme="red" onClick={() => openConfirm(patient.id)} />
                    </>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="¿Eliminar paciente?"
        body="¿Está seguro de que desea eliminar este paciente?"
      />
    </Box>
  );
};

export default ListPatients;
