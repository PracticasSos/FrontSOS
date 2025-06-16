import { useState, useEffect } from 'react'
// src/pages/QuestionnairePage.jsx
import '../Questionnaire/questionsStyles.css'
import ProgressFlow from '../ExperienceUI/ProgressFlow'


export default function Question2({ step, total, onAnswer, answer }) {
  const options = [
    'Oficina / Trabajo de escritorio',
    'Actividades deportivas o al aire libre',
    'Conducción',
    'Uso mixto'
  ]
  const [selected, setSelected] = useState(answer || '')

  useEffect(() => {
    setSelected(answer || '')
  }, [answer])

  return (
    <div className="question-card">
           <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">¿Cuál es tu actividad principal al usar lentes?</h2>
      <ul className="options-list">
        {options.map((opt, i) => (
          <li key={i} className={selected === opt ? 'selected' : ''}>
            <button
              type="button"
              onClick={() => setSelected(opt)}
              className="option-btn"
            >
              <span className="radio">{selected === opt ? '●' : '○'}</span>
              <span className="option-text">{opt}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="actions">
        <button
          className="btn-primary"
          onClick={() => onAnswer(selected)}
          disabled={!selected}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
