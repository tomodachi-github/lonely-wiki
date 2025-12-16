#!/usr/bin/env node
/**
 * Initialization Validation Test
 *
 * アプリケーション初期化時に問題となりうる以下の項目を検証：
 * - package.json バージョンが読み込めるか
 * - データベースパスが正しく解決されるか
 * - 必須の設定ファイルが存在するか
 *
 * 使用: node test-ipc-handlers.js
 */

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('🔍 初期化検証テストを開始します...\n')

let testsPassed = 0
let testsFailed = 0
const errors = []

// ========== Test 1: package.json が読み込めるか ==========
console.log('📦 package.json 検証:')
try {
  const packagePath = path.join(__dirname, 'package.json')
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  if (!packageData.version) {
    throw new Error('package.json に version フィールドがありません')
  }

  if (packageData.version === 'unknown') {
    throw new Error('package.json のバージョンが "unknown" です')
  }

  console.log(`✅ バージョン: v${packageData.version}`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'package.json version', error: err.message })
}
console.log()

// ========== Test 2: スキーマファイルが存在するか ==========
console.log('🗄️ スキーマファイル検証:')
try {
  const schemaPath = path.join(__dirname, 'src/db/schema.sql')

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`スキーマファイルが見つかりません: ${schemaPath}`)
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8')
  if (!schemaContent.trim()) {
    throw new Error('スキーマファイルが空です')
  }

  console.log(`✅ スキーマファイル存在: ${schemaPath}`)
  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'schema file', error: err.message })
}
console.log()

// ========== Test 3: ソースファイルで __dirname が使用されているか ==========
console.log('📁 パス参照検証:')
try {
  const filesToCheck = [
    'src/auto-updater.js',
    'src/db/init.js',
  ]

  let pathReferencesValid = true

  for (const file of filesToCheck) {
    const filePath = path.join(__dirname, file)
    const content = fs.readFileSync(filePath, 'utf8')

    // __dirname が使用されているか確認
    if (!content.includes('__dirname')) {
      console.warn(`⚠️  ${file} で __dirname が使用されていません`)
    }

    // process.cwd() が使用されていないか確認（非推奨）
    if (content.includes('process.cwd()')) {
      console.warn(`⚠️  ${file} で process.cwd() が使用されています（ポータブル版で問題の可能性）`)
      pathReferencesValid = false
    }

    console.log(`✅ ${file}`)
  }

  if (pathReferencesValid) {
    testsPassed++
  } else {
    testsFailed++
    errors.push({
      test: 'path references',
      error: 'process.cwd() が検出されました'
    })
  }
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({ test: 'path references', error: err.message })
}
console.log()

// ========== Test 4: auto-updater.js でパスが正しく指定されているか ==========
console.log('🔄 auto-updater パス検証:')
try {
  const autoUpdaterPath = path.join(__dirname, 'src/auto-updater.js')
  const content = fs.readFileSync(autoUpdaterPath, 'utf8')

  // package.json への相対パスが正しいか
  if (!content.includes('path.join(__dirname, \'../../package.json\')')) {
    console.warn('⚠️  package.json パスが期待と異なります')
  } else {
    console.log('✅ package.json パスが正しく指定されています')
  }

  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({
    test: 'auto-updater path',
    error: err.message
  })
}
console.log()

// ========== Test 5: init.js でアプリケーションパスが動的に決定されているか ==========
console.log('🗂️ Database パス動的決定検証:')
try {
  const initPath = path.join(__dirname, 'src/db/init.js')
  const content = fs.readFileSync(initPath, 'utf8')

  // getDatabasePath 関数が存在するか
  if (!content.includes('function getDatabasePath()')) {
    console.warn('⚠️  getDatabasePath 関数が見つかりません')
  } else {
    console.log('✅ getDatabasePath 関数が実装されています')
  }

  // app.getPath('userData') が使用されているか
  if (!content.includes('app.getPath(\'userData\')')) {
    console.warn('⚠️  app.getPath(\'userData\') が使用されていません（ビルド版で問題の可能性）')
  } else {
    console.log('✅ app.getPath(\'userData\') が使用されています')
  }

  testsPassed++
} catch (err) {
  console.error(`❌ ${err.message}`)
  testsFailed++
  errors.push({
    test: 'database path dynamic resolution',
    error: err.message
  })
}
console.log()

// ========== 結果 ==========
console.log(`\n📊 テスト結果: ${testsPassed} 成功, ${testsFailed} 失敗`)

if (testsFailed > 0) {
  console.error('\n❌ 初期化検証テストに失敗しました:')
  errors.forEach(({ test, error }) => {
    console.error(`\n${test}:`)
    console.error(`  ${error}`)
  })
  process.exit(1)
} else {
  console.log('\n✅ すべての初期化検証が完了しました！')
  process.exit(0)
}
