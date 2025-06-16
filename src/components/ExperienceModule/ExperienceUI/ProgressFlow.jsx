import './ProgressFlow.css'

/**
 * Muestra círculos numerados con estado completed/current/pending
 */
export default function ProgressFlow({ currentStep, total }) {
  return (
    <div className="progress-flow">
      {[...Array(total)].map((_, i) => (
        <div
          key={i}
          className={`circle ${
            i < currentStep
              ? 'completed'
              : i === currentStep
              ? 'current'
              : 'pending'
          }`}
        >
          {i + 1}
        </div>
      ))}
    </div>
  )
}
