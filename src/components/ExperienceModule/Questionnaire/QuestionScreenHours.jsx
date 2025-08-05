// src/components/Questionnaire/QuestionScreenHours.jsx
import React, { useState, useEffect } from 'react';
import '../Questionnaire/questionsStyles.css';
import ProgressFlow from '../ExperienceUI/ProgressFlow';

export default function QuestionScreenHours({ step, total, onAnswer, answer, onPrev }) {
  const [hours, setHours] = useState(answer || 0);

  useEffect(() => {
    if (answer !== undefined) setHours(answer);
  }, [answer]);

  const handleSubmit = () => {
    onAnswer(hours);
  };

  return (
    <div className="question-card">
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">¿Cuántas horas al día pasas frente a pantallas?</h2>
      <p className="question-subtitle">Horas: {hours}</p>
      <input
        type="range"
        min="0"
        max="16"
        value={hours}
        onChange={e => setHours(Number(e.target.value))}
        className="range-slider"
      />
      <div className="actions">
        {step > 0 && (
  <button className="btn-secondary" onClick={onPrev}>
    Anterior
  </button>
)}

        <button
          className="btn-primary"
          onClick={handleSubmit}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
