import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  useToast,
  Checkbox,
  Card,
  CardHeader,
  CardBody,
  Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [selectRoutes, setSelectRoutes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    username: '',
    age: '',
    role_id: '',
    birthdate: '',
    check_in_date: '',
    phone_number: '',
    ci: '',
    branch_id: ''
  });

  const toast = useToast();
  const navigate = useNavigate();

  const availableRoutes = [
    { path: "/Register", label: "Registrar Usuarios" },
    { path: "/Inventory", label: "Inventario" },
    { path: "/RegisterPatient", label: "Registrar Paciente" },
    { path: "/Branch", label: "Registrar Sucursal" },
    { path: "/Labs", label: "Registrar Laboratorio" },
    { path: "/CashClousure", label: "Cierre de Caja" },
    { path: "/Sales", label: "Registrar Venta" },
    { path: "/RegisterLens", label: "Registrar Lunas" },
    { path: "/PatientRecords", label: "Historial del Paciente" },
    { path: "/MeasuresFinal", label: "Medidas Finales" },
    { path: "/OrderLaboratoryList", label: "Órdenes a Laboratorio" },
    { path: "/HistoryMeasureList", label: "Historial de Medidas" },
    { path: "/Egresos", label: "Egresos" },
    { path: "/BalancesPatient", label: "Saldos del Paciente" },
    { path: "/RetreatsPatients", label: "Abonos del Paciente" },
    { path: "/Balance", label: "Balance General" },
    { path: "/ListLens", label: "Listar Lunas" },
    { path: "/ListBalance", label: "Listar Balances" },
    { path: "/ListSales", label: "Historial de Ventas" },
    { path: "/HistoryClinic", label: "Historial Clínico" },
  ];

  // Load roles and branches
  useEffect(() => {
    supabase.from('role').select('*').then(({ data, error }) => {
      if (!error) setRoles(data);
    });
    supabase.from('branchs').select('*').then(({ data, error }) => {
      if (!error) setBranchs(data);
    });
  }, []);

  // Auto-select routes when role changes
  useEffect(() => {
    if (!formData.role_id) return;
  
    let newRoutes = [];
  
    switch (formData.role_id) {
      case '1': // Admin
        newRoutes = availableRoutes;
        break;

      case '4': // Super Admin
        newRoutes =availableRoutes;
        break;
  
      case '2': // Optometra
        newRoutes = availableRoutes.filter(r =>
          ['/MeasuresFinal', '/HistoryClinic', '/RegisterPatient', '/HistoryMeasureList'].includes(r.path)
        );
        break;
  
      case '3': // Vendedor
        newRoutes = availableRoutes.filter(r =>
          ['/RegisterPatient', '/Sales', '//HistoryClinic', '/Balance', '/MeasuresFinal', '/PatientRecords', '/OrderLaboratoryList', '/HistoryMeasureList', '/BalancesPatient'].includes(r.path)
        );
        break;
  
      default:
        newRoutes = []; // Ningún acceso si el rol no es reconocido
    }
  
    setSelectRoutes(newRoutes.map(r => r.path));
  }, [formData.role_id, availableRoutes]);
  

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleRouteToggle = path => {
    setSelectRoutes(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const renderInputField = (label, name, type) => (
    <FormControl id={name} isRequired>
      <FormLabel>{label}</FormLabel>
      <Input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
      />
    </FormControl>
  );

  const renderSelectField = (label, name, options) => (
    <FormControl id={name} isRequired>
      <FormLabel>{label}</FormLabel>
      <Select name={name} value={formData[name]} onChange={handleChange}>
        <option value="">Seleccione {label.toLowerCase()}</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>
            {o.name || o.role_name}
          </option>
        ))}
      </Select>
    </FormControl>
  );

  const handleCreate = async () => {
    // 1) Create Auth user
    const { data: signup, error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: { tenant_id: (await supabase.auth.getSession()).data.session.user.user_metadata.tenant_id }
      }
    });
    if (signUpError) {
      toast({ title: 'Error Auth', description: signUpError.message, status: 'error' });
      return;
    }
    const authUser = signup.user;
    if (!authUser) {
      toast({ title: 'Error', description: 'No se creó el usuario en Auth.', status: 'error' });
      return;
    }

    // 2) Insert profile into users table
    const profile = {
      auth_id:       authUser.id,
      firstname:     formData.firstname,
      lastname:      formData.lastname,
      username:      formData.username,
      age:           formData.age,
      role_id:       formData.role_id,
      birthdate:     formData.birthdate,
      check_in_date: formData.check_in_date,
      email:         formData.email.trim(),
      phone_number:  formData.phone_number,
      ci:            formData.ci,
      branch_id:     formData.branch_id,
      tenant_id:     signup.user.user_metadata.tenant_id
    };
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .insert([profile])
      .select()
      .single();
    if (profileError) {
      toast({ title: 'Error Perfil', description: profileError.message, status: 'error' });
      return;
    }

    // 3) Insert permissions
    const perms = selectRoutes.map(route => ({
      user_id:   userData.id,
      route,
      tenant_id: profile.tenant_id
    }));
    const { error: permErr } = await supabase
      .from('user_permissions')
      .insert(perms);
    if (permErr) {
      toast({ title: 'Error Permisos', description: permErr.message, status: 'error' });
      return;
    }

    // 4) Success
    toast({ title: 'Usuario creado', description: 'Todo listo.', status: 'success' });
    setFormData({
      email: '', password: '',
      firstname: '', lastname: '', username: '',
      age: '', role_id: '', birthdate: '', check_in_date: '',
      phone_number: '', ci: '', branch_id: ''
    });
    setSelectRoutes([]);
  };

  const handleNavigate = (route = null) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (route) {
      navigate(route);
      return;
    }
    if (!user || !user.role_id) {
      navigate('/Login');
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
    <Box display="flex" flexDirection="column" alignItems="center" minH="100vh" p={6} bg="gray.50">
      <Heading mb={6} color="teal.700">Registrar Usuario</Heading>
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
        <Button onClick={() => handleNavigate('/ListUsers')} colorScheme="teal">Listar Usuarios</Button>
        <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
        <Button onClick={() => handleNavigate('/Login')} colorScheme="red">Cerrar Sesión</Button>
      </Box>
      <Card w="100%" maxW="900px" boxShadow="lg" borderRadius="xl">
        <CardBody as="form" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
          <SimpleGrid columns={[1,2]} spacing={4}>
            {renderInputField('Correo','email','email')}
            {renderInputField('Contraseña','password','password')}
            {renderInputField('Nombre','firstname','text')}
            {renderInputField('Apellido','lastname','text')}
            {renderInputField('Username','username','text')}
            {renderInputField('Edad','age','number')}
            {renderSelectField('Rol','role_id',roles)}
            {renderInputField('Fecha de Nacimiento','birthdate','date')}
            {renderInputField('Fecha de Ingreso','check_in_date','date')}
            {renderInputField('Celular','phone_number','text')}
            {renderInputField('C.I.','ci','text')}
            {renderSelectField('Sucursal','branch_id',branchs)}
          </SimpleGrid>

          <Box display="flex" justifyContent="space-between" mt={8}>
            <Button type="submit" colorScheme="teal">Crear Usuario</Button>
            <Button onClick={() => navigate('/Admin')} colorScheme="gray">Cancelar</Button>
          </Box>
        </CardBody>
      </Card>

      <Card w="100%" maxW="900px" mt={8} boxShadow="lg" borderRadius="xl">
        <CardHeader><Heading size="md">Permisos Adicionales</Heading></CardHeader>
        <Divider />
        <CardBody>
          <SimpleGrid columns={[1,2]} spacing={3}>
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
};

export default Register;