// POC: Minimal entry point to test auth module
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('app-root')

if (!rootElement) {
  throw new Error('Failed to find the root element with id "app-root"')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
