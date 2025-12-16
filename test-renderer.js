#!/usr/bin/env node
/**
 * Renderer Loading Test
 *
 * ビルド後のレンダラープロセス関連ファイルを検証：
 * - preload.js が正しく配置されているか
 * - HTML ファイルが正しくビルドされているか
 * - JS/CSS アセットが含まれているか
 * - preload スクリプトのパス指定が正しいか
 *
 * 使用: node test-renderer.js
 */

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('🔍 レンダラープロセス検証テストを開始します...\n')

let testsPassed = 0
let testsFailed = 0
const errors = []

// ========== Test 1: preload.js が存在するか ==========
console.log('📜 preload.js 検証:')
try {
  const preloadPath = path.join(__dirname, 'src/preload.js')

  if (!fs.existsSync(preloadPath)) {
    throw new Error(`preload.js が見つかりません: ${preloadPath}`)
  }

  const preloadContent = fs.readFileSync(preloadPath, 'utf8')

  // contextBridge が使用されているか
  if (!preloadContent.includes('contextBridge')) {
    throw new Error('preload.js で contextBridge が使用されていません')
  }

  // electronAPI が公開されているか
  if (!preloadContent.includes('electronAPI')) {
    throw new Error('preload.js で electronAPI が公開されていません')
  }

  console.log(`✅ preload.js 存在確認`)
  console.log(`✅ contextBridge 使用確認`)
  console.log(`✅ electronAPI 公開確認`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'preload.js', error: err.message })
}
console.log()

// ========== Test 2: dist/index.html が存在するか ==========
console.log('📄 dist/index.html 検証:')
try {
  const htmlPath = path.join(__dirname, 'dist/index.html')

  if (!fs.existsSync(htmlPath)) {
    throw new Error(`dist/index.html が見つかりません: ${htmlPath}`)
  }

  const htmlContent = fs.readFileSync(htmlPath, 'utf8')

  // <div id="root"></div> が存在するか
  if (!htmlContent.includes('id="root"')) {
    throw new Error('HTML に id="root" が見つかりません')
  }

  // スクリプトタグが存在するか
  if (!htmlContent.includes('script')) {
    throw new Error('HTML にスクリプトタグが見つかりません')
  }

  console.log(`✅ dist/index.html 存在確認`)
  console.log(`✅ id="root" 要素確認`)
  console.log(`✅ スクリプトタグ確認`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'dist/index.html', error: err.message })
}
console.log()

// ========== Test 3: dist/assets が存在するか ==========
console.log('🎨 dist/assets 検証:')
try {
  const assetsDir = path.join(__dirname, 'dist/assets')

  if (!fs.existsSync(assetsDir)) {
    throw new Error(`dist/assets ディレクトリが見つかりません: ${assetsDir}`)
  }

  const files = fs.readdirSync(assetsDir)

  if (files.length === 0) {
    throw new Error('dist/assets が空です')
  }

  // JS ファイルが存在するか
  const hasJs = files.some(f => f.endsWith('.js'))
  if (!hasJs) {
    throw new Error('dist/assets に .js ファイルが見つかりません')
  }

  // CSS ファイルが存在するか
  const hasCss = files.some(f => f.endsWith('.css'))
  if (!hasCss) {
    throw new Error('dist/assets に .css ファイルが見つかりません')
  }

  console.log(`✅ dist/assets ディレクトリ存在確認`)
  console.log(`✅ JS ファイル確認: ${files.filter(f => f.endsWith('.js')).join(', ')}`)
  console.log(`✅ CSS ファイル確認: ${files.filter(f => f.endsWith('.css')).join(', ')}`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'dist/assets', error: err.message })
}
console.log()

// ========== Test 4: main.js で preload パスが正しく指定されているか ==========
console.log('🔗 preload パス指定検証:')
try {
  const mainPath = path.join(__dirname, 'src/main.js')
  const content = fs.readFileSync(mainPath, 'utf8')

  // preload パスが指定されているか
  if (!content.includes('preload:')) {
    throw new Error('main.js で preload パスが指定されていません')
  }

  // path.join(__dirname, 'preload.js') が使用されているか
  if (!content.includes("path.join(__dirname, 'preload.js')")) {
    throw new Error('main.js で preload パスが不正です（パスは path.join(__dirname, \'preload.js\') であるべき）')
  }

  // contextIsolation: true が設定されているか
  if (!content.includes('contextIsolation: true')) {
    throw new Error('contextIsolation が true に設定されていません')
  }

  console.log(`✅ preload パス指定確認`)
  console.log(`✅ contextIsolation 設定確認`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'preload path specification', error: err.message })
}
console.log()

// ========== Test 5: App.jsx が存在するか ==========
console.log('⚛️ App.jsx 検証:')
try {
  const appPath = path.join(__dirname, 'src/renderer/App.jsx')

  if (!fs.existsSync(appPath)) {
    throw new Error(`App.jsx が見つかりません: ${appPath}`)
  }

  const appContent = fs.readFileSync(appPath, 'utf8')

  // export default が存在するか
  if (!appContent.includes('export default')) {
    throw new Error('App.jsx に export default が見つかりません')
  }

  console.log(`✅ App.jsx 存在確認`)
  console.log(`✅ export default 確認`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'App.jsx', error: err.message })
}
console.log()

// ========== Test 6: API が electronAPI を使用しているか ==========
console.log('🔌 API 検証:')
try {
  const apiPath = path.join(__dirname, 'src/renderer/api.js')

  if (!fs.existsSync(apiPath)) {
    throw new Error(`api.js が見つかりません: ${apiPath}`)
  }

  const apiContent = fs.readFileSync(apiPath, 'utf8')

  // window.electronAPI が使用されているか
  if (!apiContent.includes('window.electronAPI')) {
    throw new Error('api.js で window.electronAPI が使用されていません')
  }

  console.log(`✅ api.js 存在確認`)
  console.log(`✅ window.electronAPI 使用確認`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'api.js', error: err.message })
}
console.log()

// ========== 結果 ==========
console.log(`\n📊 テスト結果: ${testsPassed} 成功, ${testsFailed} 失敗`)

if (testsFailed > 0) {
  console.error('\n❌ レンダラープロセス検証テストに失敗しました:')
  errors.forEach(({ test, error }) => {
    console.error(`\n${test}:`)
    console.error(`  ${error}`)
  })
  process.exit(1)
} else {
  console.log('\n✅ すべてのレンダラープロセス検証が完了しました！')
  process.exit(0)
}
