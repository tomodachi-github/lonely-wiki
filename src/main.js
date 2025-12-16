import { app, BrowserWindow, ipcMain, crashReporter } from 'electron'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import { initializeDatabase } from './db/database.js'
import { setupIPCHandlers } from './ipc-handlers.js'
import { setupAutoUpdate } from './auto-updater.js'

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

// ========== 初期化 ==========
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
  writeLog(`📄 ローディング URL: ${url}`)

  // ビルド版でも DevTools を一時的に開く（デバッグ用）
  if (isDev || process.env.OPEN_DEVTOOLS === 'true') {
    mainWindow.webContents.openDevTools()
  }

  // コンソールメッセージをログに記録
  mainWindow.webContents.on('console-message', (level, message, line, sourceId) => {
    const levelName = ['LOG', 'WARNING', 'ERROR', 'DEBUG'][level] || 'UNKNOWN'
    writeLog(`[Renderer ${levelName}] ${message}`)
  })

  // 未処理の例外をキャッチ
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Handle keyboard shortcuts if needed
  })

  // レンダラープロセスの予期しないエラーをキャッチ
  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    writeLog(`❌ Preload エラー (${preloadPath}): ${error.message}`)
    writeLog(`スタック: ${error.stack}`)
  })

  // ウィンドウオープン時の初期化完了をログ
  mainWindow.once('ready-to-show', () => {
    writeLog('✅ ウィンドウがレンダリング準備完了')
    mainWindow.show()
  })

  // レンダラープロセスのエラーをキャッチ
  mainWindow.webContents.on('crashed', () => {
    writeLog('❌ レンダープロセスがクラッシュしました')
  })

  mainWindow.webContents.on('unresponsive', () => {
    writeLog('⚠️ レンダープロセスが応答していません')
  })

  // DOM がロードされたらメッセージを送信
  mainWindow.webContents.on('dom-ready', () => {
    writeLog('✅ DOM がロード完了')
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
})

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
