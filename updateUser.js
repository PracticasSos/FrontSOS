// updateUser.js
import { createClient } from '@supabase/supabase-js';

// 1) URL y service_role key
const supabaseUrl = 'https://wqnijqzncsbuhwvvdwfm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbmlqcXpuY3NidWh3dnZkd2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwODgxMCwiZXhwIjoyMDYxNzg0ODEwfQ.FIw3npnsiB8BSEz628hNHjmrPYx3q_XyTn14xD9fGzM'; // reemplaza aquí

// 2) Cliente admin
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function updateUser() {
  const userId   = '650c359e-0ee0-4768-a40d-b81b10898832'; // tu user.id
  const newPass  = 'Teamocaro123';                       // la contraseña deseada
  const tenantId = '7e6dc39a-b37a-426f-9a13-fbe31101d14f';

  // 3) Llamada para actualizar usuario
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPass,
    email_confirm: true,
    user_metadata: { tenant_id: tenantId }
  });

  if (error) {
    console.error('❌ Error actualizando usuario:', error);
    process.exit(1);
  }

  console.log('✅ Usuario actualizado:', data);
  process.exit(0);
}

updateUser();
