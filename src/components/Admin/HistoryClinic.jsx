import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../../api/supabase';
import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Select } from '@chakra-ui/react';

const HistoryClinic = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [search, setSearch] = useState('');
    const [branches, setBranches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
      fetchBranches();
    }, []);

    useEffect(() => {
      if (selectedBranch) {
        fetchPatients(selectedBranch);
      }
    }, [selectedBranch]);

    const fetchPatients = async (branchId) => {
      if (!branchId) return;

      const { data, error } = await supabase
        .from('sales')
        .select('branchs_id, patients(id, pt_firstname, pt_lastname, pt_ci, pt_phone), pdf_url, date')
        .eq('branchs_id', branchId)
        .order('date', { ascending: false });
      if (error) {
        console.error('Error fetching patients:', error);
        return;
      }

      // Mapea pacientes y evita duplicados
      const map = new Map();

      for (const sale of data) {
        const patient = sale.patients;
        if (patient && patient.id) {
          const key = `${patient.id}-${sale.branchs_id}`;
          if (!map.has(key)) {
            map.set(key, {
              ...patient,
              branchs_id: sale.branchs_id,
              pdf_url: sale.pdf_url || null,
              date: sale.date,
            });
          }
        }
      }

      const uniquePatients = Array.from(map.values());
      uniquePatients.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPatients(uniquePatients);
      setFilteredPatients(uniquePatients);
    };


    const fetchBranches = async () => {
      const { data, error } = await supabase
          .from('branchs') 
          .select('id, name');
  
      if (error) {
          console.error('Error fetching branches:', error);
      } else {
          setBranches(data);
      }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        setFilteredPatients(
            patients.filter(patient =>
                `${patient.pt_firstname} ${patient.pt_lastname} ${patient.pt_ci}`
                    .toLowerCase()
                    .includes(value.toLowerCase())
            )
        );
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
          case 4:
              navigate('/SuperAdmin');
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
          <Select 
            placeholder="Seleccione una sucursal" 
            value={selectedBranch} 
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </Select>

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
                    <Tr key={`${patient.id}-${patient.branchs_id}`} onClick={() => handlePatientSelect(patient)} style={{ cursor: 'pointer' }}>
                      <Td>{patient.pt_firstname}</Td>
                      <Td>{patient.pt_lastname}</Td>
                      <Td>{patient.pt_ci}</Td>
                      <Td>
                        {patient.pdf_url && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={(e) => {
                              e.stopPropagation();
                              const mensaje = `Hola ${patient.pt_firstname}, aquí está su historial clínico: ${patient.pdf_url}`;
                              const whatsappUrl = `https://wa.me/${patient.pt_phone}?text=${encodeURIComponent(mensaje)}`;
                              window.open(whatsappUrl, "_blank");
                            }}
                          >
                            Enviar PDF
                          </Button>
                        )}
                      </Td>
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
