import { useState, useEffect } from 'react';
import { getRecommendations } from '../utils/recommendationLogic';
import Loader from '../../ExperienceModule/ExperienceUI/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import frameByShapeImg from '../../../assets/armazonresult.png';
import frameMaterialImg from '../../../assets/materialresult.png';
import transitionImg from '../../../assets/transitionresult.png';
import './Recommendations.css';

export default function Recommendations() {
  const [recs, setRecs] = useState(null);
  const [faceShape, setFaceShape] = useState('');
  const [stage, setStage] = useState('loading');
  const [extrasOpen, setExtrasOpen] = useState(false);

  const handleFinish = () => {
    const stored = JSON.parse(localStorage.getItem('answers')) || [];
    const detectedShape = stored[5] || '';
    setFaceShape(detectedShape);
    setRecs(getRecommendations(stored));
    setStage('show');
  };

  useEffect(() => {
    if (stage === 'loading') handleFinish();
  }, []);

  if (stage === 'loading') return <Loader onFinish={handleFinish} />;

  const main = [
    {
      key: 'frameByShape',
      title: 'Montura',
      value: recs.frameByShape,
      image: frameByShapeImg,
    },
    {
      key: 'frameMaterial',
      title: 'Material',
      value: recs.frameMaterial,
      image: frameMaterialImg,
    },
    {
      key: 'transition',
      title: 'Transition / Polarizado',
      value: recs.transition,
      image: transitionImg,
    },
  ];

  const extras = [
    faceShape && { label: 'Forma de tu rostro', value: faceShape },
    { label: 'Tipo de lente', value: recs.lensType },
    { label: 'Antirreflejante', value: recs.antiReflective },
    recs.astigmatismNote && { label: 'Astigmatismo', value: recs.astigmatismNote }
  ].filter(Boolean);

  return (
    <div className="results-container centered">
      <div className="cards-stack">
        <AnimatePresence>
          {main.map((card, i) => (
            <motion.div
              key={card.key}
              className="result-card styled-card"
              initial={{ y: -200, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                x: i === 0 ? -220 : i === 2 ? 220 : 0
              }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.3 + 0.3, type: 'spring', stiffness: 120 }}
            >
              <div className="card-image-wrapper">
                <img src={card.image} alt={card.title} className="card-image" />
                <div className="card-overlay">
                  <h4>{card.title}</h4>
                </div>
              </div>
              <div className="card-content-dark">
                <p>{card.value}</p>
              </div>
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
  );
}
