import { useState, useEffect } from 'react'
import { getRecommendations } from '../utils/recommendationLogic'
import Loader from '../../ExperienceModule/ExperienceUI/Loader'
import './Recommendations.css'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function Recommendations() {
  const [recs, setRecs] = useState(null)
  const [faceShape, setFaceShape] = useState('')
  const [stage, setStage] = useState('loading')
  const [extrasOpen, setExtrasOpen] = useState(false)

  const handleFinish = () => {
    const stored = JSON.parse(localStorage.getItem('answers')) || []
    const detectedShape = stored[5] || ''
    setFaceShape(detectedShape)
    setRecs(getRecommendations(stored))
    setStage('show')
  }

  useEffect(() => {
    if (stage === 'loading') handleFinish()
  }, [])

  if (stage === 'loading') return <Loader onFinish={handleFinish} />

  const main = [
    { key: 'frameByShape', title: 'Montura', value: recs.frameByShape },
    { key: 'frameMaterial', title: 'Material', value: recs.frameMaterial },
    { key: 'transition', title: 'Transition / Polarizado', value: recs.transition }
  ]

  const extras = [
    faceShape && { label: 'Forma de tu rostro', value: faceShape },
    { label: 'Tipo de lente', value: recs.lensType },
    { label: 'Antirreflejante', value: recs.antiReflective },
    recs.astigmatismNote && { label: 'Astigmatismo', value: recs.astigmatismNote }
  ].filter(Boolean)

  return (
    <div className="results-container centered">
      {/* <h2 className="results-title">¡Aquí están tus recomendaciones!</h2> */}

      <div className="cards-stack">
        <AnimatePresence>
          {main.map((card, i) => (
            <motion.div
              key={card.key}
              className="result-card black-card"
              initial={{ y: -200, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                x: i === 0 ? -350 : i === 2 ? 350 : 0
              }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.5 + 0.5, type: 'spring', stiffness: 120 }}
            >
              <div className="card-icon">★</div>
              <h3>{card.title}</h3>
              <p>{card.value}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="extras-toggle" onClick={() => setExtrasOpen(o => !o)}>
        <span>Recomendaciones extras</span>
        <motion.div animate={{ rotate: extrasOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown />
        </motion.div>
      </div>

      <AnimatePresence>
        {extrasOpen && (
          <motion.ul
            className="extras-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {extras.map((e, idx) => (
              <li key={idx} className="extra-item">
                <strong>{e.label}:</strong> {e.value}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
