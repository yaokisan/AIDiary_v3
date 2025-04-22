# AIDiary_v3

『**言語化が苦手な人でも続けられる日記アプリ**』を目指す学習用プロジェクト（React + FastAPI + Supabase）。

現在は **「日記を保存 → 一覧で確認」までが本番環境で動作** します。

---
### ✨ 現状の主な機能
| 画面 | 概要 |
| --- | --- |
| Home | テキスト入力→保存ボタンで **POST /entries** 。保存成功時に入力欄クリア & トースト表示 |
| Archive | Supabase から投稿を取得し、作成日時降順でカード表示 |
| API | `/entries` POST: content を Supabase `entries` テーブルに書込 |

> **TODO** : 感情スコア列追加・グラフページ・AI 対話入力 など

---
## 🔧 技術スタック
| レイヤ | 技術 |
| --- | --- |
| フロント | React 18 / Vite / TypeScript |
| UI | Tailwind (一部手書き CSS) |
| バックエンド | FastAPI / Uvicorn |
| DB/API | Supabase (PostgreSQL) |
| 生成AI | OpenAI (今後導入) |
| インフラ | Vercel (front) / Render (back) |

---
## ディレクトリ構成
```
AIDiary_v3/
├── backend/            # FastAPI アプリ
│   └── fastapi_app.py
├── frontend/           # Vite + React
│   ├── src/pages/
│   └── ...
├── docs/
│   └── schema.sql      # Supabase テーブル定義 (手動バックアップ)
├── tests/              # pytest
├── .env.example        # FastAPI 用サンプル環境変数
└── frontend/.env.example  # フロント用サンプル環境変数
```

---
## 🖥️ ローカル開発手順

### 前提
- Node.js v18 以上 / npm v9 以上がインストールされていること  
  （未インストールの場合は https://nodejs.org/ から LTS 版を入れてください）

### 1. リポジトリ取得 & ルートに移動
```bash
git clone https://github.com/yaokisan/AIDiary_v3.git
cd AIDiary_v3
```

### 2. Python 仮想環境 + 依存インストール
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. フロント依存インストール
```bash
cd frontend
npm install
```

### 4. 環境変数を設定
- ルート `.env` :  `SUPABASE_URL` / `SUPABASE_KEY` (service_role)
- `frontend/.env` :  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_API_BASE_URL` (Render URL)

ひな形ファイルをコピーして値を入れるだけで OK です。
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### 5. 開発サーバー起動
```bash
# バックエンド
cd backend
uvicorn fastapi_app:app --reload

# フロント（別ターミナル）
cd frontend
npm run dev
```
- フロント: http://localhost:5173
- バック:   http://localhost:8000/docs

---
## ✅ 本番 URL
| レイヤ | URL |
| --- | --- |
| Front (Vercel) | https://YOUR-PROJECT.vercel.app |
| API (Render)   | https://aidiary-v3.onrender.com |

---
## デプロイ手順
### フロント (Vercel)
1. GitHub 連携済み。push / merge で自動デプロイ
2. 環境変数は **Project › Settings › Environment Variables** に設定

### バックエンド (Render)
1. Dashboard → Manual Deploy または push で自動再ビルド
2. 環境変数を同画面で変更したら **Save & Deploy**

---
## テスト
```bash
pytest -q
```
HTTP 200 & JSON スキーマを簡易チェックします。

---
## 今後のロードマップ
1. **感情スコア列追加** (joy/anger/sadness/pleasure)
2. **感情グラフページ** (react-chartjs-2)
3. **AI 対話入力ウィザード**
4. Supabase RLS + Auth
5. Vercel → CI で E2E テスト自動実行

---
## ライセンス
MIT