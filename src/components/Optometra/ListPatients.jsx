import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { 
  Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, 
  useToast, Flex, IconButton 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BiEdit, BiTrash, BiCheck, BiX } from 'react-icons/bi';

const ListPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editableData, setEditableData] = useState({});
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) {
      toast({ title: 'Error', description: 'Error al obtener los pacientes', status: 'error' });
    } else {
      setPatients(data);
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

  const handleDelete = async (id) => {
    const { error } = await supabase.from('patients').delete().match({ id });
    if (!error) {
      toast({ title: 'Éxito', description: 'Paciente eliminado correctamente.', status: 'success' });
      fetchPatients();
    } else {
      toast({ title: 'Error', description: 'No se pudo eliminar el paciente.', status: 'error' });
    }
  };

  const filteredPatients = patients.filter((patient) =>
    [patient.pt_firstname, patient.pt_lastname, patient.pt_phone].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <Box p={5}>
      <Heading mb={4}>Lista de Pacientes</Heading>
      <Flex mb={4} gap={3}>
        <Button colorScheme="blue" onClick={() => navigate('/RegisterPatient')}>Registrar Paciente</Button>
        <Button onClick={() => navigate('/Admin')}>Volver</Button>
        <Button colorScheme="red" onClick={() => navigate('/Login')}>Cerrar Sesión</Button>
      </Flex>
      <Input placeholder="Buscar paciente" value={search} onChange={(e) => setSearch(e.target.value)} mb={4} />
      <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
        <Table variant="striped" colorScheme="teal">
          <Thead bg="blue.300">
            <Tr>
              {['Nombre', 'Apellido', 'Ocupación', 'Dirección', 'Teléfono', 'Edad', 'C.L.',  'Ciudad', 'Correo', 'Razón de Consulta', 'Recomendaciones', 'Acciones'].map((header) => (
                <Th key={header}>{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {filteredPatients.map((patient) => (
              <Tr key={patient.id}>
                {['pt_firstname', 'pt_lastname', 'pt_occupation', 'pt_address', 'pt_phone', 'pt_age', 'pt_ci', 'pt_city', 'pt_email',  'pt_consultation_reason', 'pt_recommendations'].map((field) => (
                  <Td key={field}>
                    {editingId === patient.id ? (
                      <Input name={field} value={editableData[field] || ''} onChange={handleChange} />
                    ) : (
                      patient[field] || 'N/A'
                    )}
                  </Td>
                ))}
                <Td>
                  {editingId === patient.id ? (
                    <>
                      <IconButton icon={<BiCheck />} colorScheme="green" onClick={() => handleSave(patient.id)} mr={2} />
                      <IconButton icon={<BiX />} colorScheme="gray" onClick={() => setEditingId(null)} />
                    </>
                  ) : (
                    <>
                      <IconButton icon={<BiEdit />} colorScheme="yellow" onClick={() => handleEdit(patient.id, patient)} mr={2} />
                      <IconButton icon={<BiTrash />} colorScheme="red" onClick={() => handleDelete(patient.id)} />
                    </>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ListPatients;
