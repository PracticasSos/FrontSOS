import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import useQuestionnaire from '../hooks/useQuestionnaire'
import Loader from '../../../components/ExperienceModule/ExperienceUI/Loader.jsx'
import Question1 from '../../../components/ExperienceModule/Questionnaire/Question1.jsx'
import Question2 from '../../../components/ExperienceModule/Questionnaire/Question2.jsx'
import Question3 from '../../../components/ExperienceModule/Questionnaire/Question3.jsx'
import Question4 from '../../../components/ExperienceModule/Questionnaire/Question4.jsx'
import Question5 from '../../../components/ExperienceModule/Questionnaire/Question5.jsx'
import FaceShapeQuestion from '../../../components/ExperienceModule/Questionnaire/FaceShapeQuestion.jsx'
import QuestionGraduation from '../../../components/ExperienceModule/Questionnaire/QuestionGraduation.jsx'
import QuestionScreenHours from '../../../components/ExperienceModule/Questionnaire/QuestionScreenHours.jsx'
import QuestionLightSensitivity from '../../../components/ExperienceModule/Questionnaire/QuestionLightSensitivity.jsx'
import QuestionBudget from '../../../components/ExperienceModule/Questionnaire/QuestionBudget.jsx'
import '../../../components/ExperienceModule/pages/QuestionnairePage.css'

const variants = {
  initial: { rotateY: 90, opacity: 0 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: -90, opacity: 0 }
}

export default function QuestionnairePage() {
  const navigate = useNavigate()
  const [showLoader, setShowLoader] = useState(false)

  // Estado para respuestas globales
  const [answers, setAnswers] = useState([])

  // Define el flujo dinámico en base a answers[0]
  const questionsFlow = useMemo(() => {
    const usesGlasses = answers[0] === 'Sí'
    return [
      Question1, // Siempre
      ...(usesGlasses ? [Question2] : []),
      Question3,
      ...(usesGlasses ? [Question4, Question5] : []),
      FaceShapeQuestion,
      ...(usesGlasses ? [QuestionGraduation] : []),
      QuestionScreenHours,
      QuestionLightSensitivity,
      QuestionBudget
    ]
  }, [answers[0]])

  // Hook personalizado adaptado al flujo actual
  const {
    step,
    total,
    current: CurrentQuestion,
    next,
    prev,
    resetProgress
  } = useQuestionnaire(questionsFlow, answers, setAnswers)

  const handleNext = answer => {
    next(answer)
    if (step + 1 === total) {
      setShowLoader(true)
    }
  }

  const handleLoaderFinish = () => {
    // Completar respuestas faltantes con null para mantener estructura fija
    const completedAnswers = Array(10).fill(null)
    let flowIndex = 0
    const fullQuestionMap = [
      Question1,
      Question2,
      Question3,
      Question4,
      Question5,
      FaceShapeQuestion,
      QuestionGraduation,
      QuestionScreenHours,
      QuestionLightSensitivity,
      QuestionBudget
    ]

    for (let i = 0; i < fullQuestionMap.length; i++) {
      const q = fullQuestionMap[i]
      if (questionsFlow.includes(q)) {
        completedAnswers[i] = answers[flowIndex]
        flowIndex++
      }
    }

    localStorage.setItem('answers', JSON.stringify(completedAnswers))
    resetProgress()
    navigate('/resultados')
  }

  useEffect(() => {
    const handleBeforeUnload = () => {}
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <div className="questionnaire-container">
      {showLoader ? (
        <Loader onFinish={handleLoaderFinish} />
      ) : (
        <main className="question-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="motion-card"
            >
              <CurrentQuestion
                step={step}
                total={total}
                onAnswer={handleNext}
                onPrev={prev}
                answer={answers[step]}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      )}
    </div>
  )
}
