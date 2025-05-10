import React, { useState, useEffect } from "react";
import { Box, Button, Input, Select, FormControl, FormLabel, Stack, useToast, Card, CardBody, Heading } from "@chakra-ui/react";
import { supabase } from "../../api/supabase";
import { useNavigate } from "react-router-dom";

const Tenant = () => {
  const [tenantName, setTenantName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchCell, setBranchCell] = useState("");
  const [branchRuc, setBranchRuc] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    username: "",
    age: "",
    role_id: "",
    birthdate: "",
    check_in_date: "",
    phone_number: "",
    ci: "",
  });
  const [tenantId, setTenantId] = useState(null);
  const [branchId, setBranchId] = useState(null);

  const toast = useToast();

  const user = supabase.auth.getUser();
console.log(user); // Asegúrate de que user.data.user existe

  useEffect(() => {
  const fetchRoles = async () => {
    const { data, error } = await supabase.from("role").select("id, role_name");
    if (!error) setRoles(data);
  };

  fetchRoles();
  }, []);


  const handleCreateTenant = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log('Session UID:', session?.user?.id); // 👈 Verifica aquí

    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "No hay sesión activa. Por favor inicia sesión.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { data, error } = await supabase
      .from("tenants")
      .insert([{ name: tenantName }])
      .select();

    if (error) throw error;

    setTenantId(data[0].id);

    toast({
      title: "Óptica Creada",
      description: "El nombre de la óptica se ha creado exitosamente.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (error) {
    console.error("Error al crear tenant:", error);
    toast({
      title: "Error",
      description: "No se pudo crear la óptica.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};



  const handleCreateBranch = async () => {
    if (!tenantId) {
      toast({
        title: "Error",
        description: "Primero debe crear la óptica.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("branchs")
        .insert([
          {
            name: branchName,
            address: branchAddress,
            cell: branchCell,
            ruc: branchRuc,
            email: branchEmail,
            tenant_id: tenantId,
          },
        ]);

      if (error) throw error;

      setBranchId(data[0].id);  // Guardamos el branch ID
      toast({
        title: "Sucursal Creada",
        description: "La sucursal se ha creado exitosamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la sucursal.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateUser = async () => {
    if (!branchId) {
      toast({
        title: "Error",
        description: "Primero debe crear la sucursal.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            email: userData.email,
            password: userData.password,
            firstname: userData.firstname,
            lastname: userData.lastname,
            username: userData.username,
            age: userData.age,
            role_id: userData.role_id,
            birthdate: userData.birthdate,
            check_in_date: userData.check_in_date,
            phone_number: userData.phone_number,
            ci: userData.ci,
            branch_id: branchId,
            tenant_id: tenantId, // Enlazamos al tenant
          },
        ]);

      if (error) throw error;

      toast({
        title: "Usuario Creado",
        description: "El usuario se ha creado exitosamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
    <Box display="flex" flexDirection="column" alignItems="center" minH="100vh" p={6} >
      
      <Heading mb={6} color="teal.700">Registrar Tenant</Heading>
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth="800px" mb={4}>
        <Button onClick={() => handleNavigate('/ListUsers')} colorScheme="teal">Listar Usuarios</Button>
        <Button onClick={() => handleNavigate()} colorScheme="blue">Volver a Opciones</Button>
        <Button onClick={() => handleNavigate('/Login')} colorScheme="red">Cerrar Sesión</Button>
      </Box>
      <Stack w="100%" maxW="900px" p={6} spacing={6}>

        {/* Sección Óptica */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Crear Óptica</Heading>
            <FormControl>
              <FormLabel>Nombre de la Óptica</FormLabel>
              <Input
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Nombre de la óptica"
              />
              <Button onClick={handleCreateTenant} mt={4} colorScheme="blue">
                Crear Óptica
              </Button>
            </FormControl>
          </CardBody>
        </Card>

        {/* Sección Sucursal */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Crear Sucursal</Heading>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Nombre de la Sucursal</FormLabel>
                <Input
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Nombre de la sucursal"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Input
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Dirección de la sucursal"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Celular</FormLabel>
                <Input
                  value={branchCell}
                  onChange={(e) => setBranchCell(e.target.value)}
                  placeholder="Celular de contacto"
                />
              </FormControl>
              <FormControl>
                <FormLabel>RUC</FormLabel>
                <Input
                  value={branchRuc}
                  onChange={(e) => setBranchRuc(e.target.value)}
                  placeholder="RUC de la sucursal"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={branchEmail}
                  onChange={(e) => setBranchEmail(e.target.value)}
                  placeholder="Email de la sucursal"
                />
              </FormControl>
              <Button onClick={handleCreateBranch} mt={2} colorScheme="blue">
                Crear Sucursal
              </Button>
            </Stack>
          </CardBody>
        </Card>

        {/* Sección Usuario */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Crear Usuario</Heading>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="Email del usuario"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  placeholder="Contraseña"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input
                  value={userData.firstname}
                  onChange={(e) => setUserData({ ...userData, firstname: e.target.value })}
                  placeholder="Nombre"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Apellido</FormLabel>
                <Input
                  value={userData.lastname}
                  onChange={(e) => setUserData({ ...userData, lastname: e.target.value })}
                  placeholder="Apellido"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nombre de Usuario</FormLabel>
                <Input
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  placeholder="Nombre de usuario"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Edad</FormLabel>
                <Input
                  value={userData.age}
                  onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                  placeholder="Edad"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <Input
                  type="date"
                  value={userData.birthdate}
                  onChange={(e) => setUserData({ ...userData, birthdate: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Fecha de Registro</FormLabel>
                <Input
                  type="date"
                  value={userData.check_in_date}
                  onChange={(e) => setUserData({ ...userData, check_in_date: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  value={userData.phone_number}
                  onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                  placeholder="Teléfono"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Cédula</FormLabel>
                <Input
                  value={userData.ci}
                  onChange={(e) => setUserData({ ...userData, ci: e.target.value })}
                  placeholder="Cédula"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Rol</FormLabel>
                <Select
                  placeholder="Selecciona un rol"
                  value={userData.role_id}
                  onChange={(e) => setUserData({ ...userData, role_id: e.target.value })}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Button onClick={handleCreateUser} mt={4} colorScheme="blue">
                Crear Usuario
              </Button>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
};

export default Tenant;
