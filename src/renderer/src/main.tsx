import './assets/style.css'

import './lib/console-message'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

window.rubberDuck.path = await window.api.getConfig("path")

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
