from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv     # ← 追加
load_dotenv()                      # ← 追加
from supabase import create_client, Client     # ← 解除

# .env から読み込み
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# Supabase クライアントを生成
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

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