#!/usr/bin/env node
/**
 * Import Path Validation Test
 *
 * このスクリプトは、すべての JavaScript ファイルの import パスが
 * 実際に存在するかを検証します。
 *
 * 使用: node test-imports.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const srcDir = path.join(__dirname, 'src')
let testsPassed = 0
let testsFailed = 0
const errors = []

/**
 * ファイルから import ステートメントを抽出
 */
function extractImports(content) {
  const importRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g
  const imports = []
  let match
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1])
  }
  return imports
}

/**
 * すべての JavaScript ファイルを再帰的に取得
 */
function getAllJSFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...getAllJSFiles(fullPath))
    } else if (item.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * import パスが相対パスかどうかを判定
 */
function isRelativePath(importPath) {
  return importPath.startsWith('./')
    || importPath.startsWith('../')
    || importPath.startsWith('.')
}

/**
 * 相対 import パスを解決して存在確認
 */
function validateImportPath(importPath, fromFile) {
  if (!isRelativePath(importPath)) {
    // node_modules からの import は skip
    return { valid: true, reason: 'external module' }
  }

  const dirname = path.dirname(fromFile)
  let resolvedPath = path.resolve(dirname, importPath)

  // .js 拡張子を試す
  if (!fs.existsSync(resolvedPath)) {
    if (fs.existsSync(resolvedPath + '.js')) {
      resolvedPath = resolvedPath + '.js'
    } else if (
      fs.existsSync(path.join(resolvedPath, 'index.js'))
    ) {
      resolvedPath = path.join(resolvedPath, 'index.js')
    } else {
      return {
        valid: false,
        reason: `file not found: ${importPath}`,
        resolved: resolvedPath
      }
    }
  }

  return { valid: true, resolved: resolvedPath }
}

/**
 * すべてのファイルを検証
 */
console.log('🔍 Import パス検証を開始します...\n')

const jsFiles = getAllJSFiles(srcDir)

for (const file of jsFiles) {
  const relativePath = path.relative(__dirname, file)
  const content = fs.readFileSync(file, 'utf8')
  const imports = extractImports(content)

  for (const importPath of imports) {
    const result = validateImportPath(importPath, file)

    if (result.valid) {
      testsPassed++
      console.log(`✅ ${relativePath}`)
      console.log(`   → ${importPath}`)
    } else {
      testsFailed++
      const error = `❌ ${relativePath}
   → ${importPath}
   ${result.reason}
   解決先: ${result.resolved}`
      console.log(error)
      errors.push(error)
    }
  }
}

console.log(`\n📊 テスト結果: ${testsPassed} 成功, ${testsFailed} 失敗`)

if (testsFailed > 0) {
  console.error('\n❌ Import パス検証に失敗しました:')
  errors.forEach(err => console.error(err))
  process.exit(1)
} else {
  console.log('\n✅ すべての import パスが有効です！')
  process.exit(0)
}
