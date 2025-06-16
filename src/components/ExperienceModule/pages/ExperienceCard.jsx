import React from 'react'
import { FaGem } from 'react-icons/fa'        // puedes elegir otro icono
import { useNavigate } from 'react-router-dom'
import '././ExperienceCard.css' // Asegúrate de que la ruta sea correcta

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-icon">
          <FaGem />
        </div>
        <h2 className="welcome-title">Experiencia</h2>
        <button
          className="welcome-button"
          onClick={() => navigate('/RegisterExperience')}
        >
          Comenzar
        </button>
      </div>
    </div>
  )
}
