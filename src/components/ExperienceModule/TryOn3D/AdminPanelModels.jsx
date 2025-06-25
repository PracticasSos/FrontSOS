import { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabase';
import './AdminPanelModels.css';

export default function AdminPanel() {
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('glasses_models')
      .select('*')
      .order('label', { ascending: true });

    if (!error) setModels(data);
    setLoading(false);
  };

  const toggleActive = async (sku, currentStatus) => {
    const { error } = await supabase
      .from('glasses_models')
      .update({ is_active: !currentStatus }) // ✅ usamos el nombre correcto
      .eq('sku', sku);

    if (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al cambiar el estado: ' + error.message);
    } else {
      setModels(prev =>
        prev.map(model =>
          model.sku === sku ? { ...model, is_active: !currentStatus } : model
        )
      );
    }
  };

  const filteredModels = models.filter(m =>
    m.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container">
      <h1 className="admin-title">Gestión de Modelos</h1>
      <input
        className="admin-search"
        type="text"
        placeholder="Buscar modelo por nombre..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="admin-loading">Cargando modelos...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map(model => (
              <tr key={model.sku}>
                <td>{model.label}</td>
                <td>{model.sku}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={model.is_active}
                      onChange={() => toggleActive(model.sku, model.is_active)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
