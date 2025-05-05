import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { Box, Button, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, useToast, Checkbox, Card, CardHeader, CardBody, Stack, Divider } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [selectRoutes, setSelectRoutes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    age: '',
    role_id: '',
    birthdate: '',
    check_in_date: '',
    email: '',
    phone_number: '',
    password: '',
    ci: '',
    branch_id: '',
  });
  
   const availableRoutes = [
    { path: "/Register", label: "Registrar Usuarios" },
    { path: "/Inventory", label: "Inventario" },
    { path: "/RegisterPatient", label: "Registrar Paciente" },
    //{ path: "ListPatients", label: "Listar Pacientes" },
    //{ path: "ListInventory", label: "Listar Inventario" },
    { path: "/Branch", label: "Registrar Sucursal" },
    //{ path: "ListBranch", label: "Listar Sucursales" },
    { path: "/Labs", label: "Registrar Laboratorio" },
    //{ path: "ListLabs", label: "Listar Laboratorios" },
    { path: "/CashClousure", label: "Cierre de Caja" },
    { path: "/Sales", label: "Registrar Venta" },
    { path: "/RegisterLens", label: "Registrar Lunas" },
    { path: "/PatientRecords", label: "Historial del Paciente" },
    { path: "/MeasuresFinal", label: "Medidas Finales" },
    { path: "/OrderLaboratoryList", label: "Órdenes a Laboratorio" },
    { path: "/OrderLaboratoryList/LaboratoryOrder/:patientId", label: "Orden de Laboratorio Detallada" },
    { path: "/HistoryMeasureList", label: "Historial de Medidas" },
    { path: "/HistoryMeasureList/HistoryMeasures/:patientId", label: "Medidas por Paciente" },
    { path: "/Egresos", label: "Egresos" },
    { path: "/BalancesPatient", label: "Saldos del Paciente" },
    { path: "/RetreatsPatients", label: "Abonos del Paciente" },
    { path: "/RetreatsPatients/Retreats/:saleId", label: "Detalle de Abonos" },
    { path: "/Balance", label: "Balance General" },
    { path: "/ListLens", label: "Listar Lunas" },
    { path: "/ListBalance", label: "Listar Balances" },
    { path: "/ListSales", label: "Historial de Ventas" },
    { path: "/HistoryClinic", label: "Historial Clínico" },
    { path: "/HistoryClinic/PatientHistory/:patientId", label: "Historia por Paciente" },
    { path: "/HistoryClinic/PatientHistory/:patientId/SalesHistory/:saleId", label: "Detalle de Venta Histórica" },
  ];
  


  useEffect(() => {
    fetchData('role', setRoles);
    fetchData('branchs', setBranchs);
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (formData.role_id) {
        const newRoutes = await getRoutesByRole(formData.role_id);
        setFilteredRoutes(newRoutes);
        setSelectRoutes(newRoutes.map(r => r.path)); 
      }
    };
  
    fetchRoutes();
  }, [formData.role_id]);
  

  const fetchData = async (table, setter) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) console.error(`Error fetching ${table}:`, error);
    else setter(data);
  };

  const handleRouteToggle = (route) => {
    setSelectRoutes((prev) => 
    prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]
    );
  };

  const getRoutesByRole = async (roleId) => {
    switch (roleId) {
      case '1': 
        return availableRoutes;
      case '2': 
        return availableRoutes.filter(({ path }) =>
          [
            "/RegisterPatient",
            "/MeasuresFinal",
            "/HistoryMeasureList",
            "/HistoryClinic",
          ].includes(path)
        );
      case '3': 
        return availableRoutes.filter(({ path }) =>
          [
            "/RegisterPatient",
            "/Sales",
            "/PatientRecords",
            "/MeasuresFinal",
            "/OrderLaboratoryList",
            "/HistoryMeasureList",
            "/Egresos",
            "/BalancesPatient",
            "/RetreatsPatients",
            "/Balance",
            "/HistoryClinic",
          ].includes(path)
        );
      default:
        return [];
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    const { data: userData, error } = await supabase
      .from('users')
      .insert([formData])
      .select()
      .single();
  
    if (error || !userData) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el usuario.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error al crear:', error);
      return;
    }
  
    const permissionsData = selectRoutes.map((route) => ({
      user_id: userData.id,
      route,
    }));
  
    const { error: permissionError } = await supabase
      .from('user_permissions')
      .insert(permissionsData);
  
    if (permissionError) {
      console.error('Error al guardar permisos:', permissionError);
    }
  
    toast({
      title: 'Éxito',
      description: 'Usuario registrado correctamente.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  
    setFormData({
      firstname: '',
      lastname: '',
      username: '',
      age: '',
      role_id: '',
      birthdate: '',
      check_in_date: '',
      email: '',
      phone_number: '',
      password: '',
      ci: '',
      branch_id: '',
    });
    setSelectRoutes([]); 
  };
  const handleReset = () => {
    setFormData(initialState); 
    setSelectRoutes([]); 
  };
  

  const handleNavigate = (route) => navigate(route);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      p={6}
      bg="gray.50"
    >
      <Heading mb={6} color="teal.700">
        Registrar Usuario
      </Heading>

      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        maxWidth="900px"
        mb={6}
        gap={4}
        flexWrap="wrap"
      >
        <Button onClick={() => handleNavigate('/ListUsers')} colorScheme="teal" flex={1}>
          Listar Usuarios
        </Button>
        <Button onClick={() => handleNavigate('/Admin')} colorScheme="blue" flex={1}>
          Volver a Opciones
        </Button>
        <Button onClick={() => handleNavigate('/LoginForm')} colorScheme="red" flex={1}>
          Cerrar Sesión
        </Button>
      </Box>

      <Card width="100%" maxWidth="900px" boxShadow="lg" borderRadius="xl">
        <CardBody>
          <Box
            as="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
          >
            <SimpleGrid columns={[1, 2]} spacing={4}>
              {renderInputField('Nombre', 'firstname', 'text', true)}
              {renderInputField('Apellido', 'lastname', 'text', true)}
              {renderInputField('Username', 'username', 'text', true)}
              {renderInputField('Edad', 'age', 'number', true)}
              {renderSelectField('Rol', 'role_id', roles, true)}
              {renderInputField('Fecha de Nacimiento', 'birthdate', 'date', true)}
              {renderInputField('Fecha de Ingreso', 'check_in_date', 'date', true)}
              {renderInputField('Correo', 'email', 'email', true)}
              {renderInputField('Celular', 'phone_number', 'text', true)}
              {renderInputField('Contraseña', 'password', 'password', true)}
              {renderInputField('C.I.', 'ci', 'text', true)}
              {renderSelectField('Sucursal', 'branch_id', branchs, true)}
            </SimpleGrid>

            <Box display="flex" justifyContent="space-between" mt={8}>
              <Button type="submit" colorScheme="teal" px={8}>
                Crear Nuevo Usuario
              </Button>
              <Button onClick={handleReset} colorScheme="gray" px={8}>
                Limpiar
              </Button>
            </Box>
          </Box>
        </CardBody>
      </Card>

      <Card width="100%" maxWidth="900px" mt={8} boxShadow="lg" borderRadius="xl">
        <CardHeader>
          <Heading size="md" color="gray.700">
            Permisos Adicionales
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
        <FormLabel mb={2} color="gray.600">
            Selecciona las rutas que este usuario podrá acceder:
          </FormLabel>
          <SimpleGrid columns={[1, 2]} spacing={3}>
            {availableRoutes.map(({ path, label }) => (
              <FormControl key={path} display="flex" alignItems="center">
                <Checkbox
                  isChecked={selectRoutes.includes(path)}
                  onChange={() => handleRouteToggle(path)}
                  colorScheme="teal"
                >
                  {label}
                </Checkbox>
              </FormControl>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );

  function renderInputField(label, name, type, isRequired = false) {
    return (
      <FormControl id={name} isRequired={isRequired}>
        <FormLabel>{label}</FormLabel>
        <Input type={type} name={name} value={formData[name]} onChange={handleChange} />
      </FormControl>
    );
  }

  function renderSelectField(label, name, options, isRequired = false) {
    return (
      <FormControl id={name} isRequired={isRequired}>
        <FormLabel>{label}</FormLabel>
        <Select name={name} value={formData[name]} onChange={handleChange}>
          <option value="">Seleccione {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.name || option.role_name}
            </option>
          ))}
        </Select>
      </FormControl>
    );
  }
};

export default Register;

