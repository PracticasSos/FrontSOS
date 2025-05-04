// migrateUser.js
import { createClient } from '@supabase/supabase-js';

// 1) URL y service_role key (¡nunca expongas esta key en el frontend!)
const supabaseUrl = 'https://wqnijqzncsbuhwvvdwfm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbmlqcXpuY3NidWh3dnZkd2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwODgxMCwiZXhwIjoyMDYxNzg0ODEwfQ.FIw3npnsiB8BSEz628hNHjmrPYx3q_XyTn14xD9fGzM';

// 2) Cliente admin
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function migrate() {
  const email        = 'scaroaldas@gmail.com';
  const password     = 'Teamocaro123';
  const tenant_id    = '7e6dc39a-b37a-426f-9a13-fbe31101d14f';

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { tenant_id }
  });

  if (error) {
    console.error('❌ Error migrando usuario:', error);
    process.exit(1);
  }

  console.log('✅ Usuario migrado:', data);
  process.exit(0);
}

migrate();
