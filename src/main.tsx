// POC: Minimal entry point to test auth module
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('🚀 AdTopia v2 - Starting app...')

const rootElement = document.getElementById('app-root')

if (!rootElement) {
  throw new Error('Failed to find the root element with id "app-root"')
}

console.log('✅ Root element found:', rootElement)

try {
  const root = ReactDOM.createRoot(rootElement)
  console.log('✅ React root created')
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  
  console.log('✅ React app rendered')
} catch (error) {
  console.error('❌ Error rendering app:', error)
  throw error
}
