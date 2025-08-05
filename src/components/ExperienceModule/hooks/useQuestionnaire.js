import { useEffect, useState } from 'react'

/**
 * Hook para manejar el cuestionario.
 * - Guarda el paso actual y respuestas en localStorage.
 * - Restaura el estado si el usuario recarga la página.
 * - Permite avanzar, retroceder y limpiar el progreso.
 */

export default function useQuestionnaire(questions) {
  const total = questions.length

  // Leer desde localStorage (si existe)
  const savedStep = parseInt(localStorage.getItem('questionnaire_step'), 10)
  const savedAnswers = localStorage.getItem('questionnaire_answers')

  const [step, setStep] = useState(!isNaN(savedStep) ? savedStep : 0)
  const [answers, setAnswers] = useState(
    savedAnswers ? JSON.parse(savedAnswers) : {}
  )

  const current = questions[step]

  // Guardar en localStorage cada vez que cambia el step
  useEffect(() => {
    localStorage.setItem('questionnaire_step', step)
  }, [step])

  // Guardar en localStorage cada vez que cambian las respuestas
  useEffect(() => {
    localStorage.setItem('questionnaire_answers', JSON.stringify(answers))
  }, [answers])

  // Avanzar una pregunta y guardar respuesta
  function next(answer) {
    setAnswers(prev => {
      const updated = { ...prev, [step]: answer }
      return updated
    })
    setStep(prev => Math.min(prev + 1, total - 1))
  }

  // Retroceder una pregunta
  function prev() {
    setStep(prev => Math.max(prev - 1, 0))
  }

  // Limpiar progreso (para usar al finalizar el cuestionario o reiniciar)
  function resetProgress() {
    localStorage.removeItem('questionnaire_step')
    localStorage.removeItem('questionnaire_answers')
    setStep(0)
    setAnswers({})
  }

  return { step, total, current, answers, next, prev, resetProgress }
}
