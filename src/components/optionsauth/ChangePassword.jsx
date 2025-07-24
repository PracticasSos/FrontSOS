// ChangePassword.jsx
import { useState } from 'react';
import { supabase } from '../../api/supabase';

export default function ChangePassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage('❌ Error: ' + error.message);
    } else {
      setMessage('✅ Contraseña actualizada correctamente.');
    }
  };

  return (
    <div>
      <h2>Cambiar Contraseña</h2>
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleChangePassword}>Cambiar</button>
      <p>{message}</p>
    </div>
  );
};
export { ChangePassword };
