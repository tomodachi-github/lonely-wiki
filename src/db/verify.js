import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '../../app.db')

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ DB接続エラー:', err)
    process.exit(1)
  }

  // テーブル一覧を取得
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ クエリエラー:', err)
      db.close()
      process.exit(1)
    }

    console.log('\n📊 データベーススキーマ検証:\n')
    
    tables.forEach(table => {
      db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
        if (err) {
          console.error('❌ エラー:', err)
          return
        }
        
        console.log(`📌 ${table.name}:`)
        columns.forEach(col => {
          console.log(`   ├─ ${col.name} (${col.type})`)
        })
        console.log()
        
        // 全テーブル確認後に終了
        if (table.name === tables[tables.length - 1].name) {
          db.close()
          console.log('✅ スキーマ検証完了')
        }
      })
    })
  })
})
