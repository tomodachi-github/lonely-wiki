import { app, BrowserWindow, ipcMain, crashReporter } from 'electron'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ========== Electron クラッシュレポート初期化 ==========
try {
  const crashDumpDir = path.join(
    process.env.APPDATA || process.env.HOME,
    'lonely-wiki-crashes'
  )
  
  if (!fs.existsSync(crashDumpDir)) {
    fs.mkdirSync(crashDumpDir, { recursive: true })
  }
  
  crashReporter.start({
    productName: 'Lonely Wiki',
    companyName: 'Lonely Wiki Contributors',
    submitURL: '', // ローカルのみに保存
    uploadToServer: false
  })
  
  // クラッシュダンプディレクトリを設定
  app.setPath('crashDumps', crashDumpDir)
  console.log(`クラッシュレポート保存先: ${crashDumpDir}`)
} catch (err) {
  console.error('クラッシュレポート初期化エラー:', err)
}

// ========== ログ初期化（最優先：すべてのエラーをキャッチ） ==========
let logDir
let logFile

function initializeLogging() {
  logDir = path.join(app.getPath('userData'), 'logs')
  logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`)
  
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  } catch (err) {
    console.error('ログディレクトリ作成失敗:', err)
  }
}

function writeLog(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  console.log(message)
  
  if (logFile) {
    try {
      fs.appendFileSync(logFile, logMessage)
    } catch (err) {
      console.error('ログ書き込み失敗:', err)
    }
  }
}

// モジュール読み込みエラーをキャッチ
process.on('uncaughtException', (error) => {
  const message = `❌ キャッチされないエラー: ${error.message}\nスタックトレース: ${error.stack}`
  console.error(message)
  
  // ログファイルに直接書き込み（writeLog が使えない場合用）
  if (logFile) {
    try {
      const timestamp = new Date().toISOString()
      fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`)
    } catch (e) {
      console.error('エラーログ記録失敗:', e)
    }
  }
})

process.on('unhandledRejection', (reason, promise) => {
  const message = `❌ ハンドルされない Promise Rejection: ${reason}`
  console.error(message)
  writeLog(message)
})

// ========== モジュール読み込み（ログ初期化後） ==========
let initializeDatabase
let setupIPCHandlers
let setupAutoUpdate

try {
  const { initializeDatabase: initDB } = await import('./db/database.js')
  const { setupIPCHandlers: setupIPC } = await import('./ipc-handlers.js')
  const { setupAutoUpdate: setupAU } = await import('./auto-updater.js')
  
  initializeDatabase = initDB
  setupIPCHandlers = setupIPC
  setupAutoUpdate = setupAU
} catch (importErr) {
  console.error('❌ モジュール読み込みエラー:', importErr.message)
  console.error('スタックトレース:', importErr.stack)
  
  // 緊急ログ：ファイルに直接書き込み
  const emergencyLogDir = path.join(process.env.APPDATA || process.env.HOME, 'lonely-wiki-logs')
  try {
    fs.mkdirSync(emergencyLogDir, { recursive: true })
    const emergencyLog = path.join(emergencyLogDir, 'startup-error.log')
    const timestamp = new Date().toISOString()
    fs.appendFileSync(emergencyLog, `[${timestamp}] モジュール読み込みエラー: ${importErr.message}\n${importErr.stack}\n`)
    console.log(`緊急ログを記録しました: ${emergencyLog}`)
  } catch (e) {
    console.error('緊急ログ記録失敗:', e)
  }
  
  process.exit(1)
}

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
  initializeLogging()
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
