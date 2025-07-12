import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import useQuestionnaire from '../hooks/useQuestionnaire'
import Loader from '../../../components/ExperienceModule/Questionnaire/Loader.jsx'
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

  const questions = [
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

  const { step, total, current: CurrentQuestion, next, answers } =
    useQuestionnaire(questions)

  const handleNext = answer => {
    next(answer)
    try {
      const stored = JSON.parse(localStorage.getItem('answers') || '{}')
      stored[step] = answer
      localStorage.setItem('answers', JSON.stringify(stored))
    } catch (err) {
      console.error('Error guardando respuestas en localStorage:', err)
    }

    if (step + 1 === total) {
      setShowLoader(true) // ← Mostramos el loader si es la última
      return
    }
  }

  const handleLoaderFinish = () => {
    navigate('/resultados')
  }

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
                answer={answers[step]}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      )}
    </div>
  )
}
