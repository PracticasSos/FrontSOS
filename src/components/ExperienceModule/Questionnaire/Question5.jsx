import { useState, useEffect } from 'react'
// src/pages/QuestionnairePage.jsx
import '../Questionnaire/questionsStyles.css'
import ProgressFlow from '../ExperienceUI/ProgressFlow'


export default function Question5({ step, total, onAnswer, answer, onPrev }) {
  const [value, setValue] = useState(answer || 5)

  useEffect(() => {
    if (answer) setValue(answer)
  }, [answer])

  return (
    <div className="question-card">
           <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">¿Con qué frecuencia se rayan o rompen tus lentes?</h2>
      <p className="question-subtitle">De 1 (muy bajo) a 10 (muy alto)</p>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="range-slider"
      />
      <div className="range-value">{value}</div>
      <div className="actions">
        {step > 0 && (
  <button className="btn-secondary" onClick={onPrev}>
    Anterior
  </button>
)}

        <button
          className="btn-primary"
          onClick={() => onAnswer(value)}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}