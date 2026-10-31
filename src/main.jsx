import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import AuthGate from './Auth.jsx'
import './styles.css'
createRoot(document.getElementById('root')).render(<AuthGate><HashRouter><App /></HashRouter></AuthGate>)
