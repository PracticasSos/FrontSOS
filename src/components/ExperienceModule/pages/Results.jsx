import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TabSelector from '../ExperienceUI/TabSelector'
import LensCustomizer from './LensCustomizer'
import MaterialSelector from './MaterialSelector'
import VirtualTryOn3D from '../TryOn3D/VirtualTryOn3D'
import Recommendations from './Recommendations'

export default function Results() {
  const [selectedTab, setSelectedTab] = useState('recs')
  const navigate = useNavigate()

  const tabs = [
    { value: 'recs', label: 'Recomendaciones' },
    { value: 'lens', label: 'Lente' },
    { value: 'material', label: 'Material' },
    { value: 'tryon', label: 'Probar' },
    { value: 'restart', label: 'Volver al inicio' } // <-- Nuevo tab
  ]

  function handleTabChange(tabValue) {
    if (tabValue === 'restart') {
      localStorage.removeItem('questionnaire_step')
      localStorage.removeItem('questionnaire_answers')
      navigate('/RegisterExperience') // Asegúrate de que esta ruta exista en tu router
    } else {
      setSelectedTab(tabValue)
    }
  }

  return (
    <div
      className="resultstabs-container"
      style={{
        backgroundColor: '#f2f2f2',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        className="results-content-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          width: '100%',
          padding: '2rem'
        }}
      >
        <TabSelector tabs={tabs} activeTab={selectedTab} onChange={handleTabChange} />

        <div style={{ width: '100%' }}>
          {selectedTab === 'recs' && <Recommendations />}
          {selectedTab === 'lens' && <LensCustomizer />}
          {selectedTab === 'material' && <MaterialSelector />}
          {selectedTab === 'tryon' && <VirtualTryOn3D />}
        </div>
      </div>
    </div>
  )
}
