import { useState, useEffect } from 'react'
import '../Questionnaire/questionsStyles.css'
import ProgressFlow from '../ExperienceUI/ProgressFlow'

export default function Question1({ step, total, onAnswer, answer, onPrev }) {
  const options = ['Sí', 'No, pero me gustaría empezar a usar', 'He usado pero actualmente no']
  const [selected, setSelected] = useState(answer || '')

  useEffect(() => {
    setSelected(answer || '')
  }, [answer])

  return (
    <div className="question-card">
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">¿Usas actualmente lentes?</h2>

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
        {step > 0 && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onPrev}
          >
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
