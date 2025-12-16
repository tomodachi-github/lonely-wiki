import sqlite3 from 'sqlite3'
import { readFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * アプリケーションのデータベースパスを決定
 * - ビルド版: userData ディレクトリ（electron app から実行）
 * - 開発環境: プロジェクトルート（init スクリプトから実行）
 */
function getDatabasePath() {
  try {
    // Electron app オブジェクトを取得（try-catch で安全に）
    // ビルド版の場合のみ利用可能
    const electronModule = require('electron')
    if (electronModule.app && electronModule.app.isReady()) {
      const userDataPath = electronModule.app.getPath('userData')
      return path.join(userDataPath, 'app.db')
    }
  } catch (err) {
    // Electron が未初期化、または npm run db:init で実行された場合
  }

  // 開発環境: プロジェクトルート
  return path.join(__dirname, '../../app.db')
}

const SCHEMA_PATH = path.join(__dirname, './schema.sql')

export class Database {
  constructor() {
    this.db = null
    this.dbPath = getDatabasePath()
    this.ensureDataDir()
  }

  ensureDataDir() {
    try {
      const dbDir = path.dirname(this.dbPath)
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true })
      }
    } catch (err) {
      console.error('❌ データベースディレクトリ作成エラー:', err)
    }
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ データベース接続エラー:', err)
          reject(err)
        } else {
          console.log(`✅ データベース接続: ${this.dbPath}`)
          this.createTables()
            .then(() => resolve())
            .catch(reject)
        }
      })
    })
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      try {
        const schema = readFileSync(SCHEMA_PATH, 'utf8')
        this.db.exec(schema, (err) => {
          if (err) {
            console.error('❌ テーブル作成エラー:', err)
            reject(err)
          } else {
            console.log('✅ テーブル作成完了')
            resolve()
          }
        })
      } catch (err) {
        console.error('❌ スキーマファイル読み込みエラー:', err)
        reject(err)
      }
    })
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err)
        else resolve({ id: this.lastID, changes: this.changes })
      })
    })
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows || [])
      })
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err)
          else resolve()
        })
      } else {
        resolve()
      }
    })
  }
}

// 初期化実行
const db = new Database()
db.init()
  .then(() => console.log('✅ データベース初期化完了'))
  .catch(err => console.error('❌ 初期化失敗:', err))
  .finally(() => db.close())
