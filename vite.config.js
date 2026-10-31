import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base: set to '/<repo-name>/' for GitHub Pages project sites (override with VITE_BASE)
export default defineConfig({ plugins: [react()], base: process.env.VITE_BASE || './' })
