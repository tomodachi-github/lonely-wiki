import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import { initializeDatabase } from './db/database.js'
import { setupIPCHandlers } from './ipc-handlers.js'
import { setupAutoUpdate } from './auto-updater.js'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ログファイルパス（ユーザーのアプリデータディレクトリ）
const logDir = path.join(app.getPath('userData'), 'logs')
const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`)

// ログディレクトリを作成
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// ログ関数
function writeLog(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  console.log(message)
  fs.appendFileSync(logFile, logMessage)
}

// グローバルエラーハンドラー
process.on('uncaughtException', (error) => {
  writeLog(`❌ キャッチされないエラー: ${error.message}`)
  writeLog(`スタックトレース: ${error.stack}`)
})

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  const isDev = process.env.NODE_ENV === 'development'
  const url = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`
  
  mainWindow.loadURL(url)

  // 開発環境または環境変数が設定されている場合に DevTools を開く
  if (isDev || process.env.OPEN_DEVTOOLS === 'true') {
    mainWindow.webContents.openDevTools()
  }
  
  // ウェブコンテンツのエラーを記録
  mainWindow.webContents.on('crashed', () => {
    writeLog('❌ レンダープロセスがクラッシュしました')
  })

  mainWindow.webContents.on('unresponsive', () => {
    writeLog('⚠️ レンダープロセスが応答していません')
  })
}

app.on('ready', async () => {
  writeLog('🚀 アプリケーション起動中...')
  try {
    // 自動更新機能の初期化
    const updateInfo = await setupAutoUpdate()
    writeLog(`📦 バージョン: v${updateInfo.currentVersion}`)
    
    // データベース初期化
    await initializeDatabase()
    writeLog('✅ データベース初期化完了')
    
    // IPC ハンドラー登録
    setupIPCHandlers()
    
    // ウィンドウ作成
    createWindow()
    writeLog('✅ ウィンドウ作成完了')
  } catch (err) {
    writeLog(`❌ 初期化エラー: ${err.message}`)
    writeLog(`スタックトレース: ${err.stack}`)
    writeLog(`ログファイル: ${logFile}`)
    app.quit()
  }
}))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
