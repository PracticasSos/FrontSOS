// src/pages/FormInitial.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../api/supabase'           // ajusta la ruta si tu supabase.js está en otro directorio
import './FormInitial.css'

export default function FormInitial() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Inserción en Supabase
    const { error: supaErr } = await supabase
      .from('contacts')
      .insert([
        {
          name: form.name.trim(),
          phone: form.phone.replace(/\s+/g, ''),
        },
      ])

    if (supaErr) {
      console.error('Supabase insert error:', supaErr)
      setError('No pudimos guardar tus datos. Intenta de nuevo más tarde.')
      setLoading(false)
      return
    }

    // Guardar en localStorage para usar en el cuestionario
    localStorage.setItem('userInfo', JSON.stringify(form))

    setLoading(false)
    navigate('/cuestionario')
  }

  return (
    <div className="form-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2 className="form-title">Tus datos</h2>

        {error && <p className="form-error">{error}</p>}

        <label className="form-label" htmlFor="name">
          Nombre completo
        </label>
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

        <label className="form-label" htmlFor="phone">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="Ej. 0987123456"
          pattern="[0-9]{9,15}"
          title="Ingresa solo dígitos, entre 9 y 15 caracteres"
        />

        <button
          type="submit"
          className="btn-primary-next"
          disabled={loading}
        >
          {loading ? 'Guardando…' : 'Siguiente'}
        </button>
      </form>
    </div>
  )
}
