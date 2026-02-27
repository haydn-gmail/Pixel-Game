# 像素風闖關問答遊戲 (Pixel Quiz Game)

這是一個具有 2000 年代街機風格的像素風問答遊戲，使用 **React + Vite** 開發，整合 **NES.css** 視覺風格與 **DiceBear API** 動態頭像，並利用 **Google Apps Script (GAS)** 搭配 **Google Sheets** 作為雲端後端。

---

## 🚀 快速開始

### 1. 前端環境安裝
1. **複製專案**：將專案下載或 `git clone` 到本地。
2. **安裝套件**：
   ```bash
   npm install
   ```
3. **設定環境變數**：
   - 複製 `.env.example` 並更名為 `.env`。
   - 暫時留空 `VITE_GOOGLE_APP_SCRIPT_URL`，待下方 GAS 部署完後填入。

### 2. Google Sheets (資料庫) 設定
1. 建立一個新的 **Google 試算表**。
2. 重新命名第一個工作表為 `題目`，結構如下：
   - `A1`: ID, `B1`: 題目, `C1`: 選項A, `D1`: 選項B, `E1`: 選項C, `F1`: 選項D, `G1`: 正確答案 (填 A, B, C 或 D)
3. 建立第二個工作表為 `回答`，結構如下：
   - `A1`: 時間戳記, `B1`: 玩家ID, `C1`: 得分, `D1`: 是否通過, `E1`: 總題數

### 3. Google Apps Script (後端) 部署
1. 在試算表中點選 **擴充功能** > **Apps Script**。
2. 將本專案根目錄下的 `Code.gs` 內容完整複製貼上到編輯器中。
3. 點選上方磁碟圖示 **儲存**。
4. 點選 **部署** > **新增部署**。
5. 選取類型：**網頁應用程式**。
   - 敘述：`Pixel Game API`
   - 執行身份：`我`
   - 誰可以存取：`所有人`
6. 點選部署，並在彈出的視窗中完成權限核准。
7. **重要：** 複製產出的 **網頁應用程式 URL**，並填入本地 `.env` 的 `VITE_GOOGLE_APP_SCRIPT_URL`。

---

## 🛠️ 自動化部署 (GitHub Pages)

1. 推送程式碼至 GitHub 倉庫。
2. 在倉庫的 `Settings` > `Secrets and variables` > `Actions` 新增以下 Secrets：
   - `VITE_GOOGLE_APP_SCRIPT_URL`: 您部署後的 GAS 網址。
   - `VITE_PASS_THRESHOLD`: 通關門檻 (例如: 3)。
   - `VITE_QUESTION_COUNT`: 遊戲題數 (例如: 5)。
3. GitHub Actions 會自動編譯並部署至 `gh-pages` 分支。

---

## 📝 測試題庫：生成式 AI 基礎知識

請將以下表格內容複製貼上到您的 Google Sheets **「題目」** 工作表中：

| ID | 題目 | 選項A | 選項B | 選項C | 選項D | 正確答案 |
|:---:|:---|:---|:---|:---|:---|:---:|
| 1 |什麼是「LLM」的全稱？ | Large Language Model | Low Level Machine | Long Logic Map | Linear Learning Mode | A |
| 2 | ChatGPT 的開發公司是哪一家？ | Google | Microsoft | OpenAI | Meta | C |
| 3 | 生成式 AI 主要透過什麼技術來「生成」內容？ | 規則引擎 | 深度學習模型 | 隨機產生器 | 人工手寫 | B |
| 4 | 所謂的「Prompt Engineering」是指什麼？ | 硬體維修 | 程式碼優化 | 提示詞工程 | 伺服器架設 | C |
| 5 | AI 出現不實資訊或胡言亂語的現象稱為？ | 幻覺 (Hallucination) | 當機 | 斷線 | 噪音 | A |
| 6 | 下列哪一個模型主要用於「文字生成圖片」？ | BERT | GPT-4 | Midjourney | ResNet | C |
| 7 | 在生成式 AI 中，「微調 (Fine-tuning)」的作用是？ | 重新設計硬體 | 調整模型參數以適應特定任務 | 刪除錯誤資料 | 增加模型寬度 | B |
| 8 | 哪種模型架構是目前生成式 AI 的主流核心？ | Transformer | RNN | CNN | Decision Tree | A |
| 9 | 「多模態 (Multimodal)」AI 是指什麼？ | 只有多種顏色 | 同時處理多種輸入(如文圖音) | 多台電腦運算 | 只能處理英文 | B |
| 10 | 什麼是「增強式檢索生成 (RAG)」？ | 增加運算速度 | 結合外部知識庫的生成技術 | 刪除重複題目 | 加強安全性 | B |

---

## 技術棧 (Tech Stack)
- **Frontend**: React + Vite + TypeScript
- **UI**: NES.css (Retro Styles)
- **Avatar**: DiceBear Pixel Art API
- **Backend**: Google Apps Script
- **Database**: Google Sheets
