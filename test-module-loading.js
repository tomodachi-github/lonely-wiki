#!/usr/bin/env node
/**
 * Module Loading Test
 *
 * ビルド前に、すべてのモジュールが正しく読み込める（import できる）か確認します。
 * 構文エラーや依存性の問題を事前に検出します。
 *
 * 使用: node test-module-loading.js
 */

import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// モジュールの読み込みをテスト
const testModules = [
  './src/main.js',
  './src/ipc-handlers.js',
  './src/auto-updater.js',
  './src/preload.js',
  './src/db/database.js',
  './src/db/init.js',
  './src/db/verify.js'
]

console.log('🧪 モジュール読み込みテストを開始します...\n')

let testsPassed = 0
let testsFailed = 0
const errors = []

for (const modulePath of testModules) {
  const absolutePath = path.join(__dirname, modulePath)
  const fileUrl = `file://${absolutePath}`

  try {
    console.log(`📦 ${modulePath}...`)
    await import(fileUrl)
    console.log(`✅ 読み込み成功\n`)
    testsPassed++
  } catch (err) {
    console.log(`❌ 読み込み失敗\n`)
    console.log(`   エラー: ${err.message}\n`)
    testsFailed++
    errors.push({
      module: modulePath,
      error: err.message,
      stack: err.stack
    })
  }
}

console.log(`\n📊 テスト結果: ${testsPassed} 成功, ${testsFailed} 失敗`)

if (testsFailed > 0) {
  console.error('\n❌ モジュール読み込みテストに失敗しました:')
  errors.forEach(({ module, error, stack }) => {
    console.error(`\n${module}:`)
    console.error(`  ${error}`)
    if (process.env.DEBUG) {
      console.error(`  スタック: ${stack}`)
    }
  })
  process.exit(1)
} else {
  console.log('\n✅ すべてのモジュールが正常に読み込めます！')
  process.exit(0)
}
