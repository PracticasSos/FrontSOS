import { useState, useEffect } from 'react'
// src/pages/QuestionnairePage.jsx
import '../Questionnaire/questionsStyles.css'
import ProgressFlow from '../ExperienceUI/ProgressFlow'

export default function Question3({ step, total, onAnswer, answer, onPrev }) {
  const [value, setValue] = useState(answer || '')

  useEffect(() => {
    if (answer !== undefined) setValue(answer)
  }, [answer])

  const handleChange = (e) => {
    const input = e.target.value
    const numericValue = input === '' ? '' : Number(input)
    if (numericValue === '' || (numericValue >= 1 && numericValue <= 100)) {
      setValue(numericValue)
    }
  }

  return (
    <div className="question-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">¿Cuántos años tienes?</h2>
      <label className="question-subtitle" htmlFor="age-input">
        Mi edad es
      </label>
      <input
        id="age-input"
        type="number"
        min="1"
        max="100"
        value={value}
        onChange={handleChange}
        placeholder="Ej: 30"
        className="age-input"
        style={{
          width: '200px',
          height: '50px',
          fontSize: '18px',
          padding: '12px',
          border: '2px solid #e1e5e9',
          borderRadius: '8px',
          textAlign: 'center',
          outline: 'none',
          transition: 'border-color 0.3s ease',
        }}
        onFocus={(e) => e.target.style.borderColor = '#3dadc4ff'}
        onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
      />
      <div className="actions">
        {step > 0 && (
  <button className="btn-secondary" onClick={onPrev}>
    Anterior
  </button>
)}

        <button
          className="btn-primary"
          onClick={() => onAnswer(value)}
          disabled={value === '' || value < 1 || value > 100}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
