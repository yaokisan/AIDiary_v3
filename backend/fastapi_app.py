from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from pathlib import Path
# ルート (.env) を明示的に読み込む
load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware

# .env から読み込み
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 値を確認（None なら .env を再チェック）
print("DEBUG URL =", SUPABASE_URL)
print("DEBUG KEY =", SUPABASE_KEY[:10] + "…" if SUPABASE_KEY else SUPABASE_KEY)

# Supabase クライアントを生成
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# ────────── CORS 設定 ──────────
# フロントエンド(Vercel)からのリクエストを許可する。
# 必ず https://ai-diary-v3.vercel.app に置き換えてください。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-diary-v3.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# ────────────────────────────

class Entry(BaseModel):
    content: str

@app.post("/entries")
async def create_entry(entry: Entry):
    """
    新しい日記エントリを保存します。
    将来的にはSupabaseに保存する予定です。
    """
    # Supabase へ保存
    try:
        result = supabase.table("entries").insert({"content": entry.content}).execute()
        rows = result.data  # 挿入された行
        if rows:
            return {"id": rows[0]["id"], "message": "Entry created successfully"}
        raise HTTPException(status_code=500, detail="No rows returned")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ヘルスチェック用エンドポイント (任意)
@app.get("/")
def read_root():
    return {"message": "AIDiary backend is running"} 