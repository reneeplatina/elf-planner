import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { migrateLocal } from './storage'
import './styles.css'
migrateLocal().catch(() => {}).finally(() =>
  createRoot(document.getElementById('root')).render(<HashRouter><App /></HashRouter>))
