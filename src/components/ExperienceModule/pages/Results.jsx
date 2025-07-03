import { useState } from 'react'
import TabSelector from '../ExperienceUI/TabSelector'
import LensCustomizer from './LensCustomizer'
import MaterialSelector from './MaterialSelector'
import VirtualTryOn3D from '../TryOn3D/VirtualTryOn3D'
import Recommendations from './Recommendations'

export default function Results() {
  const [selectedTab, setSelectedTab] = useState('recs')

  const tabs = [
    { value: 'recs', label: 'Recomendaciones' },
    { value: 'lens', label: 'Lente' },
    { value: 'material', label: 'Material' },
    { value: 'tryon', label: 'Probar' }
  ]

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
        <TabSelector tabs={tabs} activeTab={selectedTab} onChange={setSelectedTab} />

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
