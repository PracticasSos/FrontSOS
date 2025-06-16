// src/components/Questionnaire/QuestionBudget.jsx
import React, { useState, useEffect } from 'react';
import '../Questionnaire/questionsStyles.css';
import ProgressFlow from '../ExperienceUI/ProgressFlow';

export default function QuestionBudget({ step, total, onAnswer, answer }) {
  const options = ['Bajo', 'Medio', 'Alto'];
  const [selected, setSelected] = useState(answer || '');

  useEffect(() => {
    if (answer) setSelected(answer);
  }, [answer]);

  const handleSubmit = () => {
    onAnswer(selected);
  };

  return (
    <div className="question-card">
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">¿Cuál es tu presupuesto aproximado?</h2>
      <p className="question-subtitle">Selecciona un rango de precio</p>
      <ul className="options-list">
        {options.map((opt, i) => (
          <li key={i} className={selected === opt ? 'selected' : ''}>
            <button
              type="button"
              className="option-btn"
              onClick={() => setSelected(opt)}
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
          onClick={handleSubmit}
          disabled={!selected}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}