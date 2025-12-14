#!/bin/bash

# フェーズ 9: ビルド設定検証スクリプト

echo "🏗️  ビルド設定検証"
echo "=================================================="
echo ""

# 1. package.json の build セクションを確認
echo "1️⃣  package.json build セクション検証"
if grep -q "\"appId\"" package.json && grep -q "\"productName\"" package.json; then
  echo "   ✅ appId と productName が定義されている"
else
  echo "   ❌ appId または productName が不足"
fi

if grep -q "\"win\"" package.json && grep -q "\"mac\"" package.json && grep -q "\"linux\"" package.json; then
  echo "   ✅ Windows, macOS, Linux 設定が定義されている"
else
  echo "   ❌ プラットフォーム設定が不足"
fi

if grep -q "\"nsis\"" package.json; then
  echo "   ✅ NSIS インストーラー設定が定義されている"
else
  echo "   ❌ NSIS インストーラー設定が不足"
fi

if grep -q "\"dmg\"" package.json; then
  echo "   ✅ DMG パッケージ設定が定義されている"
else
  echo "   ❌ DMG パッケージ設定が不足"
fi

echo ""

# 2. ビルドスクリプトの確認
echo "2️⃣  ビルドスクリプト定義確認"
SCRIPTS=$(grep -o '"[^"]*": "npm run' package.json | grep -c "build")
if [ "$SCRIPTS" -gt 0 ]; then
  echo "   ✅ 複数のビルドスクリプトが定義されている"
  grep '"build' package.json | head -5 | sed 's/^/      /'
else
  echo "   ❌ ビルドスクリプトが不足"
fi

echo ""

# 3. アセットディレクトリの確認
echo "3️⃣  アセットディレクトリ確認"
if [ -d "assets" ]; then
  echo "   ✅ assets ディレクトリが存在"
  echo "   📁 ファイル一覧:"
  ls -1 assets | sed 's/^/      - /'
else
  echo "   ❌ assets ディレクトリが不足"
fi

echo ""

# 4. auto-updater.js の確認
echo "4️⃣  自動更新機能ファイル確認"
if [ -f "src/auto-updater.js" ]; then
  echo "   ✅ src/auto-updater.js が存在"
  if grep -q "setupAutoUpdate" src/auto-updater.js; then
    echo "   ✅ setupAutoUpdate 関数が定義されている"
  fi
else
  echo "   ❌ src/auto-updater.js が不足"
fi

echo ""

# 5. main.js の更新確認
echo "5️⃣  メインプロセスの更新確認"
if grep -q "setupAutoUpdate" src/main.js; then
  echo "   ✅ setupAutoUpdate が main.js に統合されている"
else
  echo "   ❌ setupAutoUpdate が main.js に統合されていない"
fi

echo ""

# 6. electron-builder のインストール確認
echo "6️⃣  electron-builder インストール確認"
if grep -q "electron-builder" node_modules/.bin/electron-builder 2>/dev/null || [ -f "node_modules/electron-builder/package.json" ]; then
  echo "   ✅ electron-builder がインストールされている"
else
  echo "   ⚠️  electron-builder の確認が必要"
fi

echo ""

# 7. ビルド設定シンタックス確認
echo "7️⃣  JSON シンタックス検証"
if node -e "require('./package.json')" 2>/dev/null; then
  echo "   ✅ package.json は有効な JSON"
else
  echo "   ❌ package.json に構文エラーがある"
fi

echo ""

echo "🎯 ビルド設定検証完了"
echo "=================================================="
echo ""
echo "📚 使用可能なビルドコマンド:"
echo "  npm run build:win      - Windows (NSIS + Portable EXE) をビルド"
echo "  npm run build:mac      - macOS (DMG) をビルド"
echo "  npm run build:linux    - Linux (AppImage + deb) をビルド"
echo "  npm run build:all      - すべてのプラットフォーム用をビルド"
echo ""
echo "ℹ️  注意事項:"
echo "  - 本番ビルドには npm run build:all を実行"
echo "  - リリース出力は release/ ディレクトリに生成される"
echo "  - ファイル署名/公証は手動で設定が必要な場合がある"
echo ""
