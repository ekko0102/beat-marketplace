# BeatMarketplace 🎵

一個專為音樂製作人打造的伴奏交易與作品展示平台，類似 BeatStars，針對台灣市場優化。

## 專案概述

BeatMarketplace 是一個讓音樂製作人能夠展示作品、銷售伴奏，並與詞曲創作者直接媒合的網頁平台。

## 核心功能

- 製作人個人資料卡（Credits、Bio、擅長曲風）
- 作品集展示（試聽）
- 伴奏市集（搜尋、篩選、購買）
- 購物車 + 台灣金流（綠界 ECPay）
- 聯絡製作人（客製化編曲）

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | Next.js 14 + TailwindCSS |
| 後端 | Node.js + Express |
| 資料庫 | PostgreSQL |
| 音訊播放 | Howler.js |
| 付款 | 綠界 ECPay + Stripe |
| 容器化 | Docker + docker-compose |

## 快速啟動

```bash
# 安裝依賴
cd frontend && npm install
cd ../backend && npm install

# 啟動開發環境
docker-compose up -d

# 啟動前端
cd frontend && npm run dev

# 啟動後端
cd backend && npm run dev
```

## 文件目錄

- [需求規格書](./REQUIREMENTS.md)
- [技術規格書](./TECHNICAL_SPEC.md)
- [資料庫設計](./DATABASE_SCHEMA.md)
- [API 規格](./API_SPEC.md)
- [UI/UX 規格](./UI_SPEC.md)
- [開發計畫](./PROJECT_PLAN.md)

## 目錄結構

```
BeatMarketplace/
├── docs/               # 文件
├── frontend/           # Next.js 前端
│   ├── app/
│   ├── components/
│   └── public/
├── backend/            # Express 後端
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── middleware/
├── uploads/            # 音樂、圖片檔案
│   ├── beats/
│   ├── avatars/
│   └── banners/
├── database/           # Schema & migrations
└── docker-compose.yml
```
