import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input } from '@chakra-ui/react';

const HistoryClinic = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        const { data, error } = await supabase
            .from('patients')
            .select('id, pt_firstname, pt_lastname, pt_ci');

        if (error) {
            console.error('Error fetching patients:', error);
        } else {
            setPatients(data);
            setFilteredPatients(data);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        setFilteredPatients(patients.filter(patient =>
            `${patient.pt_firstname} ${patient.pt_lastname} ${patient.pt_ci}`
                .toLowerCase()
                .includes(value.toLowerCase())
        ));
    };

    const handlePatientSelect = (patient) => {
        navigate(`/HistoryClinic/PatientHistory/${patient.id}`, { state: { patientData: patient } });
    };

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
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh">
          <Heading mb={4} textAlign="center">Historial de Pacientes</Heading>
    
          <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
            <Button onClick={() => handleNavigate('/RegisterPatient')} colorScheme="teal">Registrar Pacientes</Button>
            <Button onClick={() => handleNavigate()} mr={2} colorScheme="blue">Volver a Opciones</Button>
          </Box>

        <Box as="form" width="100%" maxWidth="850px" padding={6} boxShadow="lg" borderRadius="md" >
          <Input 
            placeholder="Buscar por nombre, apellido o cédula" 
            value={search} 
            onChange={handleSearchChange} 
            mb={4} 
            maxWidth="800px"
          />
          <Box overflowX="auto" width="100%" maxWidth="900px">
              <Table variant="simple" minWidth="800px">
                <Thead>
                  <Tr>
                    <Th>Nombre</Th>
                    <Th>Apellido</Th>
                    <Th>Cédula</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredPatients.map(patient => (
                    <Tr key={patient.id} onClick={() => handlePatientSelect(patient)} style={{ cursor: 'pointer' }}>
                      <Td>{patient.pt_firstname}</Td>
                      <Td>{patient.pt_lastname}</Td>
                      <Td>{patient.pt_ci}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
          </Box>
        </Box>
        </Box>
    );
}

export default HistoryClinic;
