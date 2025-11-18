// AdTopia v2 Entry Point
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from './router'
import './index.css'

console.log('🚀 AdTopia v2 - Starting app...')

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find the root element with id "root"')
}

console.log('✅ Root element found:', rootElement)

try {
  const root = ReactDOM.createRoot(rootElement)
  console.log('✅ React root created')
  
  root.render(
    <React.StrictMode>
      <Router />
    </React.StrictMode>
  )
  
  console.log('✅ React app rendered with Router')
} catch (error) {
  console.error('❌ Error rendering app:', error)
  throw error
}
