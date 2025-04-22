from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from pathlib import Path
import json
import google.generativeai as genai
# ルート (.env) を明示的に読み込む
load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional, Union

# .env から読み込み
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

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

chat_model = genai.GenerativeModel('gemini-2.0-flash')

# ────────────────────────────

class Entry(BaseModel):
    content: str
    emotion: Optional[Dict[str, float]] = None

class Message(BaseModel):
    role: str  # 'user' または 'model'
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class DiaryRequest(BaseModel):
    messages: List[Message]

@app.post("/chat")
async def chat_with_ai(chat_request: ChatRequest):
    """
    AIとの対話を行います。
    """
    try:
        gemini_messages = []
        for msg in chat_request.messages:
            role = "user" if msg.role == "user" else "model"
            gemini_messages.append({"role": role, "parts": [msg.content]})
        
        chat = chat_model.start_chat(history=gemini_messages)
        response = chat.send_message("今日の出来事について、もう少し詳しく教えてください。自然な会話で質問します。")
        
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_diary")
async def generate_diary(diary_request: DiaryRequest):
    """
    対話履歴から日記を生成します。
    """
    try:
        conversation = ""
        for msg in diary_request.messages:
            role = "ユーザー" if msg.role == "user" else "AI"
            conversation += f"{role}: {msg.content}\n"
        
        prompt = f"""
        以下の会話を元に、その日の出来事をまとめた日記形式のテキストを生成してください。
        一人称で、自然な文体で書いてください。
        
        会話:
        {conversation}
        """
        
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        diary_content = response.text
        
        emotion_prompt = f"""
        以下の日記テキストから、書き手の感情を分析し、以下の4つのカテゴリーで0.0から1.0の範囲でスコアを付けてください。
        JSONフォーマットで返してください。
        カテゴリー: joy（喜び）, anger（怒り）, sadness（悲しみ）, pleasure（楽しさ）
        
        日記:
        {diary_content}
        """
        
        emotion_response = model.generate_content(emotion_prompt)
        emotion_text = emotion_response.text
        
        import re
        json_match = re.search(r'\{.*\}', emotion_text, re.DOTALL)
        emotion_data = {}
        if json_match:
            try:
                emotion_data = json.loads(json_match.group())
            except:
                emotion_data = {"joy": 0.5, "anger": 0.0, "sadness": 0.0, "pleasure": 0.5}
        else:
            emotion_data = {"joy": 0.5, "anger": 0.0, "sadness": 0.0, "pleasure": 0.5}
            
        return {"diary": diary_content, "emotion": emotion_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/entries")
async def create_entry(entry: Entry):
    """
    新しい日記エントリを保存します。
    """
    # Supabase へ保存
    try:
        data = {"content": entry.content}
        if entry.emotion:
            data["emotion"] = json.dumps(entry.emotion)
            
        result = supabase.table("entries").insert(data).execute()
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