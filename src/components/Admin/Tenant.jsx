import { useState } from 'react';
import { supabase } from '../../api/supabase';

export default function CreateUser() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    username: '',
    age: '',
    birthdate: '',
    phone_number: '',
    ci: '',
    role: '',
  });
  const [message, setMessage] = useState('');
  const [tenantName, setTenantName] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    setMessage('Error obteniendo sesión del usuario.');
    return;
  }

  // Obtener el usuario actual desde la sesión
  const user = session.user;

  // 2. Consultar el rol en la tabla users
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role_id")
    .eq("auth_id", user.id)
    .single();

  if (userError || !userData) {
    setMessage('No tienes permisos.');
    return;
  }
    // Obtener el usuario actual para asignar tenant_id si no es super-admin

    
    const { role, tenant_id } = user.user_metadata;
    
    // Si es super-admin, no asignamos tenant_id (crea nuevos tenants)
    const newUserMetadata = {
      role: formData.role,
      tenant_id: role !== 'super-admin' ? tenant_id : null,
    };
    
    // 1. Crear usuario en Auth (usando signUp en lugar de admin.createUser)
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: newUserMetadata,
      }
    });
    
    if (signupError) {
      setMessage(`Error creando usuario: ${signupError.message}`);
      return;
    }
    
    if (!authData || !authData.user) {
      setMessage('Error al crear el usuario en Auth.');
      return;
    }

    // Ejemplo de inserción de un nuevo tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ name: tenantName }])
      .select();

    if (tenantError) {
      setMessage(`Error creando tenant: ${tenantError.message}`);
      return;
    }

// ...
      // Usar el id del nuevo tenant para el usuario
      const newTenantId = tenantData[0].id;

      // 2. Insertar en tabla 'users' con role_id como entero
      let roleId = 1; // Por defecto es 1 (admin)

      // 3. Insertar en tabla 'users'
      const { error: insertError } = await supabase.from('users').insert([
        {
          auth_id: authData.user.id,
          firstname: formData.firstname,
          lastname: formData.lastname,
          username: formData.username,
          age: parseInt(formData.age) || null,
          birthdate: formData.birthdate || null,
          phone_number: formData.phone_number,
          ci: formData.ci,
          role_id: roleId,
          tenant_id: newTenantId, // <--- Usa el id recién creado
        },
      ]);
    
    if (insertError) {
      setMessage(`Error insertando en tabla users: ${insertError.message}`);
      return;
    }
    
    setMessage('✅ Usuario creado exitosamente');
    setFormData({
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      username: '',
      age: '',
      birthdate: '',
      phone_number: '',
      ci: '',
      role: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Crear Usuario</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          name="email" 
          type="email"
          placeholder="Email" 
          className="p-2 border rounded"
          onChange={handleChange} 
          value={formData.email} 
          required
        />
        
        <input 
          name="password" 
          type="password" 
          placeholder="Contraseña" 
          className="p-2 border rounded"
          onChange={handleChange} 
          value={formData.password} 
          required
        />
        
        <input 
          name="firstname" 
          placeholder="Nombre" 
          className="p-2 border rounded"
          onChange={handleChange} 
          value={formData.firstname} 
          required
        />
        
        <input 
          name="lastname" 
          placeholder="Apellido" 
          className="p-2 border rounded"
          onChange={handleChange} 
          value={formData.lastname} 
          required
        />
        
        <input 
          name="username" 
          placeholder="Usuario" 
          className="p-2 border rounded"
          onChange={handleChange} 
          value={formData.username} 
          required
        />
        
        <input 
          name="age" 
          type="number"
          placeholder="Edad" 
          className="p-2 border rounded"
          onChange={handleChange} 
          value={formData.age} 
        />
        
        <input 
          name="birthdate" 
          type="date" 
          placeholder="Fecha Nacimiento" 
          className="p-2 border rounded"
          onChange={handleChange} 
          value={formData.birthdate} 
        />
        
        <input 
          name="phone_number" 
          placeholder="Teléfono" 
          className="p-2 border rounded"
          onChange={handleChange} 
          value={formData.phone_number} 
        />
        
        <input 
          name="ci" 
          placeholder="Cédula" 
          className="p-2 border rounded"
          onChange={handleChange} 
          value={formData.ci} 
        />
        
        
        <input
          name="tenantName"
          placeholder="Nombre del Tenant"
          className="p-2 border rounded"
          onChange={e => setTenantName(e.target.value)}
          value={tenantName}
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Crear Usuario
      </button>
      
      {message && (
        <p className={`mt-4 p-2 rounded ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </p>
      )}
    </form>
  );
}