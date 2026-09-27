# ContextQuiz 免費雲端一鍵部屬指南（無需在本地電腦運行）

本專案為標準靜態網頁架構（Vite + React），專為隨處運行與分享設計，**完全不需要在您的個人電腦上運行伺服器**。以下提供最推薦、最快速的免費部屬方案：

---

## 方案一：部署至 Vercel（最推薦，1 分鐘上線，永久免費）

Vercel 是目前前端最主流的免費託管平台，自帶全球 CDN 加速與 HTTPS：

1. **上傳程式碼到 GitHub**：
   - 到 [GitHub.com](https://github.com) 建立一個新的公開或私人儲存庫（Repository，例如 `context-quiz`）。
   - 在您的 `quiz` 資料夾執行 Git 上傳：
     ```bash
     git init
     git add .
     git commit -m "feat: initial commit"
     git branch -M main
     git remote add origin https://github.com/您的帳號/context-quiz.git
     git push -u origin main
     ```
2. **在 Vercel 匯入專案**：
   - 開啟 [Vercel.com](https://vercel.com) 用 GitHub 帳號登入。
   - 點擊 **"Add New..."** -> **"Project"**，選取剛建立的 `context-quiz`。
   - 框架會自動偵測為 **Vite**，直接點擊 **"Deploy"**！
3. **完成上線**：
   - 數秒內即會生成專屬的公開網址（例如 `https://context-quiz.vercel.app`），手機、平板或傳給朋友都能立刻使用。

---

## 方案二：部署至 Netlify（免命令列，支援滑鼠拖曳上傳）

如果您不想使用 Git 指令，可以直接使用 Netlify 的資料夾拖曳部署功能：

1. 專案已經在本機執行 `npm run build`，資料夾內已產生編譯完成的 `dist/` 資料夾：
   `c:\Users\姚文惠\Desktop\quiz\dist`
2. 前往 [Netlify Drop](https://app.netlify.com/drop)。
3. 將電腦上的 `dist` 資料夾直接用滑鼠拖曳進瀏覽器視窗中。
4. 即可直接獲得公開可用的免費網址！

---

## 方案三：GitHub Pages（完全免費）

1. 將專案推送到 GitHub。
2. 在 `vite.config.ts` 加上 `base: '/context-quiz/'`。
3. 在 GitHub 儲存庫的 **Settings** -> **Pages**，Source 選擇 GitHub Actions 即可自動完成免費發布。
