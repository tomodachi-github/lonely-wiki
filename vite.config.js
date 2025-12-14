import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Icon generation plugin
const iconPlugin = {
  name: 'icon-generator',
  apply: 'build',
  writeBundle() {
    const assetsDir = 'assets'
    const distDir = 'dist'
    
    // Ensure assets directory exists in dist
    if (!fs.existsSync(path.join(distDir, 'assets'))) {
      fs.mkdirSync(path.join(distDir, 'assets'), { recursive: true })
    }
    
    // Copy icon.svg to dist/assets
    const svgSource = path.join(assetsDir, 'icon.svg')
    const svgDest = path.join(distDir, 'assets', 'icon.svg')
    if (fs.existsSync(svgSource)) {
      fs.copyFileSync(svgSource, svgDest)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), iconPlugin],
  server: {
    port: 5173
  }
})
