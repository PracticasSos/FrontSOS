import React from 'react'
import './TabSelector.css'

export default function TabSelector({ tabs, activeTab, onChange }) {
  return (
    <div className="radiotab-inputs">
      {tabs.map((tab) => (
        <label key={tab.value} className="radiotab">
          <input
            type="radio"
            name="tab"
            checked={tab.value === activeTab}
            onChange={() => onChange(tab.value)}
          />
          <span className="name">{tab.label}</span>
        </label>
      ))}
    </div>
  )
}
