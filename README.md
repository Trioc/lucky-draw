# Lucky Draw

一個為心理學課程活動製作的互動式網頁應用。

玩家使用有限的虛擬金幣抽取不同稀有度的物品，並在「保留物品以累積社交分數」與
「出售物品換取金幣繼續抽取」之間做出選擇。

> An interactive web application developed for a classroom activity,
> featuring randomized rewards and resource trade-offs.

## 專案畫面

主畫面
<img width="1000" height="900" alt="圖片" src="https://github.com/user-attachments/assets/faa9e221-4b8f-4853-a811-81d60cfb73f8" />

管理員頁面
<img width="1000" height="600" alt="圖片" src="https://github.com/user-attachments/assets/eb4f531a-6883-48ef-ae91-2a4f8056b861" />


## 專案背景

Lucky Draw 是為心理學課程中的課堂活動所製作的互動式網站。

活動以隨機抽取機制為核心。玩家擁有有限的虛擬金幣，可以抽取不同稀有度與價值的物品；
取得物品後，可以選擇保留並累積社交分數，或將部分物品出售換回金幣，繼續進行後續抽取。

網站主要用來支援課堂活動流程，包括玩家資料、隨機抽取、物品管理、分數計算與活動統計。

## 遊戲機制

玩家初始擁有 **300 金幣**，每次付費開箱需要 **30 金幣**。

物品分為五種稀有度，各自具有不同的出現機率、出售價格與社交分數：

| 稀有度 | 出現機率 | 出售價格 | 社交分數 |
| --- | ---: | ---: | ---: |
| ⚪ 白色 | 40% | 3 | 1 |
| 🔵 藍色 | 30% | 8 | 3 |
| 🟣 紫色 | 18% | 20 | 8 |
| 🔴 紅色 | 9% | 80 | 25 |
| 🟡 金色 | 3% | 不可出售 | 80 |

每完成 **5 次付費開箱**，玩家可獲得一次免費開箱機會。

玩家需要在兩種資源之間做選擇：

- **金幣**：用於繼續開箱
- **社交分數**：由目前保留的物品計算

出售物品可以取得更多金幣，但同時會失去該物品提供的社交分數。

## 功能

- 不同稀有度的加權隨機抽取
- 開箱動畫與結果顯示
- 玩家金幣與物品庫存管理
- 單件與批次出售物品
- 社交分數即時計算
- 免費開箱券機制
- 玩家操作紀錄
- Firebase 儲存玩家與活動資料
- 玩家排行榜
- 管理員活動統計頁面
- 手機與桌面版面支援

## 使用技術

- **React** — 前端介面與狀態管理
- **Vite** — 開發與建置工具
- **Tailwind CSS** — 介面樣式
- **Firebase Firestore** — 玩家與活動資料儲存
- **Framer Motion** — 開箱與介面動畫
- **Lucide React** — UI 圖示

## 本機執行

Clone repository：

```bash
git clone https://github.com/Trioc/lucky-draw.git
cd lucky-draw
```
安裝套件：
```bash
npm install
```
啟動開發環境：
```bash
npm run dev
```
建立 production build：
```bash
npm run build
```
部分功能需要 Firebase Firestore 才能正常運作。

## 專案狀態

本專案原先為一次性的課堂活動使用，目前活動已結束，也不再維護穩定的線上 Demo。

Repository 保留作為專案紀錄與程式實作參考。

## 備註

此專案的管理員頁面是為課堂活動需求設計，使用前端 PIN 作為簡易進入限制，
並非正式的安全驗證機制。

若作為正式或公開服務使用，管理員驗證與資料存取權限應改由後端或 Firebase
Authentication / Security Rules 等機制處理。
