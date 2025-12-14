import { app, dialog, BrowserWindow } from 'electron'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * 更新チェック機能（基本版）
 * 本番環境では electron-updater の使用を推奨
 */

let updateCheckWindow = null

export async function setupAutoUpdate() {
  try {
    // Package version を取得
    const packagePath = resolve(process.cwd(), 'package.json')
    const packageData = JSON.parse(readFileSync(packagePath, 'utf8'))
    const currentVersion = packageData.version

    console.log(`📦 Lonely Wiki v${currentVersion}`)
    console.log('🔍 更新チェック機能は有効です（手動チェックのみ）')

    // メニューやショートカットからのチェック用関数を返す
    return {
      currentVersion,
      checkForUpdates: () => checkForUpdatesManually(currentVersion),
    }
  } catch (err) {
    console.error('❌ 更新チェック初期化エラー:', err)
    return {
      currentVersion: 'unknown',
      checkForUpdates: () => {
        dialog.showMessageBox({
          type: 'error',
          title: '更新チェック エラー',
          message: '更新チェックに失敗しました',
        })
      },
    }
  }
}

/**
 * 手動で更新をチェック
 */
async function checkForUpdatesManually(currentVersion) {
  try {
    // ここで GitHub API や自社サーバーから最新バージョンを取得
    // 例: https://api.github.com/repos/owner/repo/releases/latest
    
    dialog.showMessageBox({
      type: 'info',
      title: '更新チェック',
      message: `Lonely Wiki ${currentVersion}`,
      detail: '最新バージョンを使用しています。',
      buttons: ['OK'],
    })
  } catch (err) {
    console.error('❌ 更新チェックエラー:', err)
    dialog.showMessageBox({
      type: 'error',
      title: '更新チェック エラー',
      message: '更新チェックに失敗しました',
      detail: err.message,
    })
  }
}

/**
 * 更新利用可能時のダイアログ表示
 */
export function showUpdateDialog(latestVersion, downloadUrl) {
  return dialog.showMessageBox({
    type: 'info',
    title: '更新利用可能',
    message: `Lonely Wiki 更新が利用可能です`,
    detail: `最新バージョン: ${latestVersion}\n\n今すぐダウンロードしますか？`,
    buttons: ['ダウンロード', 'あとで', 'キャンセル'],
    defaultId: 0,
    cancelId: 2,
  })
}
