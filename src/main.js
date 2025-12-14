import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import { initializeDatabase } from './db/database.js'
import { setupIPCHandlers } from './ipc-handlers.js'
import { setupAutoUpdate } from './auto-updater.js'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
}

app.on('ready', async () => {
  console.log('🚀 アプリケーション起動中...')
  try {
    // 自動更新機能の初期化
    const updateInfo = await setupAutoUpdate()
    console.log(`📦 バージョン: v${updateInfo.currentVersion}`)
    
    // データベース初期化
    await initializeDatabase()
    console.log('✅ データベース初期化完了')
    
    // IPC ハンドラー登録
    setupIPCHandlers()
    
    // ウィンドウ作成
    createWindow()
    console.log('✅ ウィンドウ作成完了')
  } catch (err) {
    console.error('❌ 初期化エラー:', err)
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
