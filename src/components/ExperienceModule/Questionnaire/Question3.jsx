import { useState, useEffect } from 'react'
// src/pages/QuestionnairePage.jsx
import '../Questionnaire/questionsStyles.css'
import ProgressFlow from '../ExperienceUI/ProgressFlow'


export default function Question3({ step, total, onAnswer, answer }) {
  const [value, setValue] = useState(answer || 30)

  useEffect(() => {
    if (answer) setValue(answer)
  }, [answer])

  return (
    <div className="question-card">
           <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">¿Cuántos años tienes?</h2>
      <p className="question-subtitle">Mi edad es {value} años</p>
      <input
        type="range"
        min="1"
        max="100"
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="age-slider"
      />
      <div className="actions">
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
