from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from pathlib import Path
# ルート (.env) を明示的に読み込む
load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
# Google Generative AI追加
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

def gemini_chat(prompt: str) -> str:
    resp = model.generate_content(prompt)
    return resp.text.strip()
# ここまで追記 
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

# ----- ここに対話用のリクエストモデルを追加 -----
class DiaryRequest(BaseModel):
    history: str
    round: int

class SummaryRequest(BaseModel):
    transcript: str
# ---------------------------------------------------

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


# ----- AI Diary Endpoints -----
@app.post("/diary/ask")
async def ask(req: DiaryRequest):
    """
    対話履歴を受け取り、次の深掘り質問を 1 文返します。
    round はクライアント側でカウントアップして送信。
    """
    prompt = (
        "あなたは傾聴コーチです。以下の対話履歴を読んで、"
        "ユーザーの内省を促す質問を日本語で 1 文だけ作成してください。\n"
        f"{req.history}"
    )
    try:
        question = gemini_chat(prompt)
        return {"question": question, "round": req.round + 1}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/diary/summary")
async def summary(req: SummaryRequest):
    """
    対話履歴を 200〜300 字の日記に要約し、
    喜怒哀楽のスコア (0–100) を JSON で返します。
    返却例:
      {
        "diary": "今日は ...",
        "scores": {"joy":65,"anger":0,"sadness":15,"pleasure":20}
      }
    """
    prompt = (
        "以下の対話履歴を読み、200〜300字の日本語の日記文を作成してください。"
        "加えて、喜怒哀楽それぞれを 0 から 100 で評価し、"
        "次の JSON 形式で返してください: "
        '{"diary":"...", "scores":{"joy":n,"anger":n,"sadness":n,"pleasure":n}}\n'
        f"{req.transcript}"
    )
    try:
        result = gemini_chat(prompt)
        return result  # Frontend side will parse JSON
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# ----- End AI Diary Endpoints -----

# ヘルスチェック用エンドポイント (任意)
@app.get("/")
def read_root():
    return {"message": "AIDiary backend is running"}