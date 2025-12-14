import sqlite3 from 'sqlite3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '../../app.db')
const SCHEMA_PATH = path.join(__dirname, './schema.sql')

export class Database {
  constructor() {
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ データベース接続エラー:', err)
          reject(err)
        } else {
          console.log(`✅ データベース接続: ${DB_PATH}`)
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
