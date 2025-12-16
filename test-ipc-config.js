#!/usr/bin/env node
/**
 * IPC Configuration Test
 *
 * メインプロセスのIPCハンドラー設定が正しいか検証
 * - setupIPCHandlers が呼び出されているか
 * - 期待される IPC ハンドルが定義されているか
 * - preload.js で API が公開されているか
 *
 * 使用: node test-ipc-config.js
 */

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('🔍 IPC 設定検証テストを開始します...\n')

let testsPassed = 0
let testsFailed = 0
const errors = []

// ========== Test 1: ipc-handlers.js が存在し、期待される IPC ハンドルが定義されているか ==========
console.log('📡 IPC ハンドラー定義検証:')
try {
  const ipcHandlersPath = path.join(__dirname, 'src/ipc-handlers.js')

  if (!fs.existsSync(ipcHandlersPath)) {
    throw new Error(`ipc-handlers.js が見つかりません: ${ipcHandlersPath}`)
  }

  const content = fs.readFileSync(ipcHandlersPath, 'utf8')

  // 期待される IPC ハンドルが定義されているか
  const expectedHandles = [
    'articles:list',
    'articles:getByUuid',
    'articles:create',
    'articles:update',
    'articles:delete'
  ]

  const missingHandles = []
  for (const handle of expectedHandles) {
    if (!content.includes(`'${handle}'`)) {
      missingHandles.push(handle)
    }
  }

  if (missingHandles.length > 0) {
    throw new Error(`以下の IPC ハンドルが見つかりません: ${missingHandles.join(', ')}`)
  }

  console.log(`✅ ipc-handlers.js 存在確認`)
  console.log(`✅ IPC ハンドル確認: ${expectedHandles.length} 個`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'IPC handlers', error: err.message })
}
console.log()

// ========== Test 2: main.js で setupIPCHandlers が呼び出されているか ==========
console.log('🔗 setupIPCHandlers 呼び出し検証:')
try {
  const mainPath = path.join(__dirname, 'src/main.js')
  const content = fs.readFileSync(mainPath, 'utf8')

  if (!content.includes('setupIPCHandlers()')) {
    throw new Error('main.js で setupIPCHandlers() が呼び出されていません')
  }

  console.log(`✅ setupIPCHandlers 呼び出し確認`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'setupIPCHandlers call', error: err.message })
}
console.log()

// ========== Test 3: preload.js で invoke メソッドが公開されているか ==========
console.log('🔐 preload.js API 公開検証:')
try {
  const preloadPath = path.join(__dirname, 'src/preload.js')
  const content = fs.readFileSync(preloadPath, 'utf8')

  if (!content.includes('invoke')) {
    throw new Error('preload.js で invoke メソッドが公開されていません')
  }

  if (!content.includes('electronAPI')) {
    throw new Error('preload.js で electronAPI が公開されていません')
  }

  console.log(`✅ invoke メソッド公開確認`)
  console.log(`✅ electronAPI 公開確認`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'preload.js API', error: err.message })
}
console.log()

// ========== Test 4: api.js で window.electronAPI が使用されているか ==========
console.log('🔌 API IPC 使用検証:')
try {
  const apiPath = path.join(__dirname, 'src/renderer/api.js')
  const content = fs.readFileSync(apiPath, 'utf8')

  if (!content.includes('window.electronAPI')) {
    throw new Error('api.js で window.electronAPI が使用されていません')
  }

  // ArticleAPI クラスが存在するか
  if (!content.includes('class ArticleAPI')) {
    throw new Error('ArticleAPI クラスが見つかりません')
  }

  // articleAPI がエクスポートされているか
  if (!content.includes('export const articleAPI')) {
    throw new Error('articleAPI がエクスポートされていません')
  }

  console.log(`✅ window.electronAPI 使用確認`)
  console.log(`✅ ArticleAPI クラス確認`)
  console.log(`✅ articleAPI エクスポート確認`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'api.js IPC usage', error: err.message })
}
console.log()

// ========== 結果 ==========
console.log(`\n📊 テスト結果: ${testsPassed} 成功, ${testsFailed} 失敗`)

if (testsFailed > 0) {
  console.error('\n❌ IPC 設定検証テストに失敗しました:')
  errors.forEach(({ test, error }) => {
    console.error(`\n${test}:`)
    console.error(`  ${error}`)
  })
  process.exit(1)
} else {
  console.log('\n✅ すべての IPC 設定検証が完了しました！')
  process.exit(0)
}
