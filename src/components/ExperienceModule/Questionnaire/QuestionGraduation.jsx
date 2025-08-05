// src/components/Questionnaire/QuestionGraduation.jsx
import React, { useState, useEffect } from 'react';
import '../Questionnaire/questionsStyles.css';
import ProgressFlow from '../ExperienceUI/ProgressFlow';
import { AnimatePresence, motion } from 'framer-motion';

export default function QuestionGraduation({ step, total, onAnswer, answer, onPrev }) {
  const [knows, setKnows] = useState(answer?.knows || '');
  const [sphLeft, setSphLeft] = useState(answer?.sphLeft || '');
  const [sphRight, setSphRight] = useState(answer?.sphRight || '');

  useEffect(() => {
    if (answer) {
      setKnows(answer.knows || '');
      setSphLeft(answer.sphLeft || '');
      setSphRight(answer.sphRight || '');
    }
  }, [answer]);

  const handleSubmit = () => {
    onAnswer({ knows, sphLeft: sphLeft.trim(), sphRight: sphRight.trim() });
  };

  return (
    <div className="question-card">
      <ProgressFlow currentStep={step} total={total} />
      <h2 className="question-title">¿Conoces tu graduación actual de lentes?</h2>
      <ul className="options-list">
        {[
          { key: 'yes', label: 'Sí, ingreso valores' },
          { key: 'no',  label: 'No' },
        ].map(opt => (
          <li key={opt.key} className={knows === opt.key ? 'selected' : ''}>
            <button
              type="button"
              className="option-btn"
              onClick={() => setKnows(opt.key)}
            >
              <span className="radio">
                {knows === opt.key ? '●' : '○'}
              </span>
              <span className="option-text">{opt.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {knows === 'yes' && (
          <motion.div
            className="graduation-inputs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="input-group">
              <label>
                <span className="option-text">Ojo izquierdo (esférico):</span>
                <input
                  type="text"
                  placeholder="e.g. -1.25"
                  value={sphLeft}
                  onChange={e => setSphLeft(e.target.value)}
                />
              </label>
            </div>
            <div className="input-group">
              <label>
                <span className="option-text">Ojo derecho (esférico):</span>
                <input
                  type="text"
                  placeholder="e.g. -1.00"
                  value={sphRight}
                  onChange={e => setSphRight(e.target.value)}
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="actions">
        {step > 0 && (
  <button className="btn-secondary" onClick={onPrev}>
    Anterior
  </button>
)}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={
            !knows ||
            (knows === 'yes' && (!sphLeft.trim() || !sphRight.trim()))
          }
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
