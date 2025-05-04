import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

console.log('SUPA URL:', supabaseUrl);
console.log('SUPA KEY:', supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        // Guarda la sesión (tokens) en localStorage para que sobreviva a recargas
        persistSession: true,
        // Refresca automáticamente el token antes de expirar
        autoRefreshToken: true,
        // Gestiona el fragmento de URL cuando Supabase redirige tras OAuth
        detectSessionInUrl: true,
    },
});

// Opcional: escucha cambios de sesión para actualizar tu UI o storage si quisieras
supabase.auth.onAuthStateChange((event, session) => {
    // event puede ser 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', etc.
    // session contiene el access_token con tenant_id, y el refresh_token.
    // Si quisieras, podrías sincronizarlo manualmente con localStorage:
    if (session) {
        localStorage.setItem('supabaseSession', JSON.stringify(session));
    } else {
        localStorage.removeItem('supabaseSession');
    }
});

export { supabase };
