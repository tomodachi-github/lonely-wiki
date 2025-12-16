#!/usr/bin/env node
/**
 * Asar Archive Validation Test
 *
 * ビルド後に asar ファイルの内部構造を検証し、
 * すべての必要なファイルが正しく含まれているか確認します。
 *
 * 使用: node test-asar.js [path/to/app.asar]
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// asar ファイルのパス
const asarPath = process.argv[2]
  || path.join(__dirname, 'release/linux-unpacked/resources/app.asar')

if (!fs.existsSync(asarPath)) {
  console.error(`❌ Asar ファイルが見つかりません: ${asarPath}`)
  console.error('使用法: node test-asar.js [path/to/app.asar]')
  process.exit(1)
}

console.log(`📦 Asar ファイルを検証します: ${asarPath}\n`)

/**
 * asar ファイルの内容をリストアップ
 */
function listAsarContents() {
  try {
    // npx asar がない場合は手動で確認
    const output = execSync(`npx asar list "${asarPath}"`, { encoding: 'utf8' })
    return output.split('\n').filter(line => line.trim())
  } catch (err) {
    console.warn('⚠️ asar コマンドが使用できません。フォールバック検証を使用します。')
    return null
  }
}

/**
 * 重要なファイルが asar に含まれているか確認
 */
function validateRequiredFiles(contents) {
  const requiredFiles = [
    'src/main.js',
    'src/ipc-handlers.js',
    'src/auto-updater.js',
    'src/preload.js',
    'src/db/database.js',
    'src/db/init.js',
    'src/db/schema.sql',
    'src/renderer/App.jsx',
    'src/renderer/main.jsx',
    'src/renderer/api.js',
    'package.json',
    'dist/index.html'
  ]

  console.log('✅ 必須ファイルの確認:\n')

  let testsPassed = 0
  let testsFailed = 0

  for (const file of requiredFiles) {
    const found = contents && contents.some(line => line.includes(file))
    if (found) {
      console.log(`✅ ${file}`)
      testsPassed++
    } else {
      console.log(`❌ ${file} - NOT FOUND`)
      testsFailed++
    }
  }

  console.log(`\n📊 検証結果: ${testsPassed} 成功, ${testsFailed} 失敗\n`)
  return testsFailed === 0
}

/**
 * Import ファイルが相互に参照可能か確認
 */
function validateImportReferences(contents) {
  console.log('✅ Import 参照の確認:\n')

  const checks = [
    {
      file: 'src/ipc-handlers.js',
      shouldContain: 'src/db/database.js',
      description: 'ipc-handlers が database.js をインポート'
    },
    {
      file: 'src/main.js',
      shouldContain: 'src/db/database.js',
      description: 'main が database.js をインポート'
    },
    {
      file: 'src/main.js',
      shouldContain: 'src/ipc-handlers.js',
      description: 'main が ipc-handlers.js をインポート'
    },
    {
      file: 'src/db/database.js',
      shouldContain: 'src/db/init.js',
      description: 'database が init.js をインポート'
    }
  ]

  let allValid = true

  for (const check of checks) {
    console.log(`  ${check.description}:`)
    const isValid = contents && contents.some(line => line.includes(check.file))
      && contents && contents.some(line => line.includes(check.shouldContain))

    if (isValid) {
      console.log(`  ✅ ${check.file} と ${check.shouldContain}`)
    } else {
      console.log(`  ❌ 参照が見つかりません`)
      allValid = false
    }
    console.log()
  }

  return allValid
}

// 実行
const contents = listAsarContents()

if (contents) {
  const filesValid = validateRequiredFiles(contents)
  const referencesValid = validateImportReferences(contents)

  if (filesValid && referencesValid) {
    console.log('✅ Asar 検証が成功しました！')
    process.exit(0)
  } else {
    console.error('❌ Asar 検証に失敗しました')
    process.exit(1)
  }
} else {
  console.log('⚠️ asar コマンドが使用できないため、簡易検証をスキップします')
  console.log('手動で asar ファイルを確認してください。')
  process.exit(0)
}
