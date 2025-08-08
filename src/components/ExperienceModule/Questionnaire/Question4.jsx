// src/components/Questionnaire/Question4.jsx
import { useState, useEffect } from 'react'
// src/pages/QuestionnairePage.jsx
import '../Questionnaire/questionsStyles.css'
import ProgressFlow from '../ExperienceUI/ProgressFlow'
import astigmatismoImg from '../../../assets/astigmatismo.png'
import normalImg from '../../../assets/normal.png'

export default function Question4({ step, total, onAnswer, answer, onPrev }) {
  const options = [
    { label: '1', src: astigmatismoImg },
    { label: '2', src: normalImg }
  ]
  const [selected, setSelected] = useState(answer || '')

  useEffect(() => {
    setSelected(answer || '')
  }, [answer])

  return (
    <div className="question-card">
           <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">¿Con qué imagen te identificas?</h2>
      <p className="question-subtitle">Como vez las luces durante la noche "Con Lentes"</p>
      <div className="images-grid">
        {options.map((opt, i) => (
          <div
            key={i}
            className={`image-option ${selected === opt.label ? 'selected' : ''}`}
            onClick={() => setSelected(opt.label)}
          >
            <span className="radio">{selected === opt.label ? '●' : '○'}</span>
            <img
              src={opt.src}
              alt={opt.label}
              className="selectable-img"
            />
            <p className="option-text">{opt.label}</p>
          </div>
        ))}
      </div>
      <div className="actions">
        {step > 0 && (
  <button className="btn-secondary" onClick={onPrev}>
    Anterior
  </button>
)}

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
  