import { useEffect, useState } from 'react'

/**
 * Hook para manejar el cuestionario.
 * - Administra el paso actual.
 * - Usa respuestas externas (controlado desde el componente padre).
 * - Guarda el paso en localStorage (opcional).
 */

export default function useQuestionnaire(questions, answers, setAnswers) {
  const total = questions.length

  // Leer paso actual desde localStorage (si existe)
  const savedStep = parseInt(localStorage.getItem('questionnaire_step'), 10)
  const [step, setStep] = useState(!isNaN(savedStep) ? savedStep : 0)

  const current = questions[step]

  // Guardar paso actual en localStorage
  useEffect(() => {
    localStorage.setItem('questionnaire_step', step)
  }, [step])

  // Avanzar al siguiente paso y guardar respuesta en el array externo
  function next(answer) {
    setAnswers(prev => {
      const updated = [...prev]
      updated[step] = answer
      return updated
    })
    setStep(prev => Math.min(prev + 1, total - 1))
  }

  // Retroceder una pregunta
  function prev() {
    setStep(prev => Math.max(prev - 1, 0))
  }

  // Limpiar progreso (solo el paso, las respuestas ya se limpian arriba)
  function resetProgress() {
    localStorage.removeItem('questionnaire_step')
    setStep(0)
  }

  return { step, total, current, next, prev, resetProgress }
}
