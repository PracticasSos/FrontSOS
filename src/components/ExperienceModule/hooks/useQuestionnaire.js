import { useState } from 'react'

/**
 * Gestiona el estado del cuestionario:
 * - preguntas: array de componentes o datos
 * - step: índice de pregunta actual
 * - respuestas: objeto con respuestas
 */
export default function useQuestionnaire(questions) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const total = questions.length

  const current = questions[step]

  function next(answer) {
    setAnswers(prev => ({ ...prev, [step]: answer }))
    setStep(prev => Math.min(prev + 1, total - 1))
  }

  function prev() {
    setStep(prev => Math.max(prev - 1, 0))
  }

  return { step, total, current, answers, next, prev }
}