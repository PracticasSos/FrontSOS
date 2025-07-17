import { useState, useEffect } from 'react';
import  { supabase } from '../../api/supabase';

// Mover la función isRouteAllowed fuera del hook para poder exportarla
export const isRouteAllowed = (currentPath, allowedRoutes) => {
  if (!allowedRoutes || !Array.isArray(allowedRoutes)) {
    return false;
  }
  
  // Verificación exacta
  if (allowedRoutes.includes(currentPath)) {
    return true;
  }

  // Verificación para rutas con parámetros
  for (const route of allowedRoutes) {
    // Casos específicos para rutas dinámicas
    if (route === '/RetreatsPatients/Retreats' && currentPath.startsWith('/RetreatsPatients/Retreats/')) {
      return true;
    }
    
    // Verificación general
    if (currentPath.startsWith(route + '/')) {
      return true;
    }
  }

  return false;
};

export const useUserPermissions = (userData) => {
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDefaultRoutesForRole = (roleId) => {
    switch (roleId) {
      case 1: 
        return [
          '/admin', '/RegisterPatient', '/MeasuresFinal', '/Sales', 
          '/RetreatsPatients', '/RegisterExperience', '/Register', 
          '/Inventory', '/Branch', '/Labs', '/CashClousure', 
          '/RegisterLens', '/PatientRecords', '/Egresos', 
          '/OrderLaboratoryList', '/BalancesPatient', '/Balance', 
          '/HistoryMeasureList', '/PrintCertificate', '/HistoryClinic', 
          '/MessageManager', '/ListBalance', '/ListSales',
          '/ListPatients', '/ListUsers', '/ListLens', '/ListInventory',
          '/ListBranch', '/ListLab','/cuestionario','/lens','/material',
          '/admin/modelos','/resultados','/RegisterExperience','/mensajeria',
          '/RetreatsPatients/Retreats', '/Retreats', '/HistoryClinic/PatientHistory',  'PatientHistory',
        ];
      case 2: 
        return ['/optometra', '/RegisterPatient', '/RetreatsPatients', '/RegisterExperience', '/RegisterPatient', '/Sales', 
          '/OrderLaboratoryList', '/RetreatsPatients', '/RegisterExperience',
          '/HistoryClinic', '/PatientRecords', '/BalancesPatient', '/Egresos', 
          '/MeasuresFinal', '/Balance', '/Inventory','/certificado', '/cuestionario',
          '/lens','/material',
          '/admin/modelos','/resultados',];
      case 3: 
        return [
          '/vendedor', '/RegisterPatient', '/Sales', 
          '/OrderLaboratoryList', '/RetreatsPatients', '/RegisterExperience',
          '/HistoryClinic', '/PatientRecords', '/BalancesPatient', '/Egresos', 
          '/MeasuresFinal', '/Balance', '/Inventory', 
          '/HistoryMeasureList', '/RegisterLens','/cuestionario','/lens','/material',
          '/admin/modelos','/resultados', '/RetreatsPatients/Retreats',
        ];
      case 4: 
        return [
          '/SuperAdmin', '/admin', '/optometra', '/vendedor', 
          '/usuarios', '/inventario', '/venta', '/orden-laboratorio', 
          '/registrar-paciente', '/retiros', '/saldos', '/mensajes', 
          '/cierre', '/Egresos', '/certificado', '/historial-paciente', 
          '/medidas', '/envios', '/historial-medidas', '/laboratorios', 
          '/sucursal', '/consultar-cierre', '/lunas', '/creditos','/cuestionario',
          '/lens','/material',
          '/admin/modelos','/resultados','/RegisterExperience',
        ];
      default: 
        return ['/LoginForm'];
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!userData?.auth_id) {
        setLoading(false);
        return;
      }

      try {
        const { data: permissions, error } = await supabase
          .from('user_permissions')
          .select('route')
          .eq('auth_id', userData.auth_id);

        let validRoutes = [];

        if (!error && permissions && permissions.length > 0) {
          // Si tiene permisos específicos, usar esos
          validRoutes = permissions.map(p => p.route);
        } else {
          // Si no tiene permisos específicos, usar rutas por defecto del rol
          validRoutes = getDefaultRoutesForRole(userData.role_id);
        }

        // Agregar dashboard principal del rol
        const dashboardRoutes = {
          1: '/admin',
          2: '/optometra',
          3: '/vendedor',
          4: '/SuperAdmin'
        };

        const dashboardRoute = dashboardRoutes[userData.role_id];
        if (dashboardRoute && !validRoutes.includes(dashboardRoute)) {
          validRoutes.push(dashboardRoute);
        }

        setAllowedRoutes(validRoutes);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setAllowedRoutes(getDefaultRoutesForRole(userData.role_id));
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userData]);

  return { allowedRoutes, loading };
};

export default useUserPermissions;