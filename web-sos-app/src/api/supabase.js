import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con tu URL de Supabase y tu clave anónima
const supabaseUrl = 'https://wqnijqzncsbuhwvvdwfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbmlqcXpuY3NidWh3dnZkd2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxNjkyNjIsImV4cCI6MjAzNDc0NTI2Mn0.f31oD7pF3wrfCwGC4_VzcTvwFYtX0efCjHTjALSLMeA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para registrar un usuario
export const registerUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData]);

  if (error) throw error;
  return data;
};

// Función para loguear un usuario
export const loginUser = async (email, password) => {
  const { user, session, error } = await supabase.auth.signIn({
    email,
    password,
  });

  if (error) throw error;
  return { user, session };
};
