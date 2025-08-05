import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../api/supabase';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FiSettings } from 'react-icons/fi'; 
import './FormInitial.css';

export default function FormInitial() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // ✅ Limpiar progreso del cuestionario al montar
  useEffect(() => {
    localStorage.removeItem('questionnaire_step');
    localStorage.removeItem('questionnaire_answers');
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = value => {
    setForm(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: supaErr } = await supabase
      .from('contacts')
      .insert([
        {
          name: form.name.trim(),
          phone: form.phone.replace(/\s+/g, ''),
        },
      ]);

    if (supaErr) {
      console.error('Supabase insert error:', supaErr);
      setError('No pudimos guardar tus datos. Intenta de nuevo más tarde.');
      setLoading(false);
      return;
    }

    // ✅ Guardar datos del usuario
    localStorage.setItem('userInfo', JSON.stringify(form));

    // ✅ Limpiar progreso antes de continuar (por si acaso)
    localStorage.removeItem('questionnaire_step');
    localStorage.removeItem('questionnaire_answers');

    setLoading(false);
    navigate('/cuestionario');
  };

  const handleAlreadyRegistered = () => {
    // ✅ Limpiar también si ya estaba registrado
    localStorage.removeItem('questionnaire_step');
    localStorage.removeItem('questionnaire_answers');

    navigate('/cuestionario');
  };

  const toggleSettingsMenu = () => {
    setShowSettingsMenu(prev => !prev);
  };

  const goToRoute = route => {
    setShowSettingsMenu(false);
    navigate(route);
  };

  return (
    <div className="form-container">
      <div className="settings-icon-wrapper">
        <div className="settings-icon" onClick={toggleSettingsMenu}>
          <FiSettings size={32} />
        </div>
        {showSettingsMenu && (
          <div className="settings-dropdown">
            <button onClick={() => goToRoute('/admin/modelos')}>Modelos 3D</button>
            <button onClick={() => goToRoute('/mensajeria')}>Mensajería</button>
          </div>
        )}
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <h2 className="form-title">Tus datos</h2>

        {error && <p className="form-error">{error}</p>}

        <label className="form-label" htmlFor="name">Nombre completo</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="Ej. Ana Pérez"
        />

        <label className="form-label" htmlFor="phone">Teléfono</label>
        <PhoneInput
          country={'ec'}
          value={form.phone}
          onChange={handlePhoneChange}
          inputProps={{
            required: true,
            name: 'phone',
            id: 'phone',
          }}
          inputStyle={{
            width: '100%',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            paddingLeft: '48px',
          }}
          containerStyle={{ width: '100%' }}
          dropdownStyle={{ zIndex: 9999 }}
        />

        <button
          type="submit"
          className="btn-primary-next"
          disabled={loading}
        >
          {loading ? 'Guardando…' : 'Siguiente'}
        </button>

        <button
          type="button"
          className="btn-secondary-initial"
          onClick={handleAlreadyRegistered}
        >
          Ya me he registrado antes
        </button>
      </form>
    </div>
  );
}
