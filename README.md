# 聖經閱讀 App (Bible App)

一個用 React Native + Expo 構建的聖經閱讀 Android 應用，支持中文和合本。

## 功能

- 📖 閱讀聖經經文（支持調整字體大小）
- 🔖 書籤功能（長按經文加入書籤）
- 🔍 經文關鍵字搜尋
- 📌 閱讀進度自動保存
- 📱 底部導航：首頁、聖經、書籤、搜尋
- 🌓 支持淺色/深色模式

## 目前收錄經文

示範數據（可擴充）：
- 創世記 第1章
- 馬太福音 第1章、第5章
- 約翰福音 第3章
- 詩篇 第23篇
- 箴言 第3章

## 開始使用

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npx expo start

# 在 Android 上運行
npx expo start --android
```

## 擴充經文

編輯 `data/bibleText.ts`，依照現有格式加入更多書卷和章節。

## 技術棧

- Expo SDK 52
- Expo Router v4（文件式路由）
- React Native 0.76
- AsyncStorage（本地儲存）
- TypeScript
