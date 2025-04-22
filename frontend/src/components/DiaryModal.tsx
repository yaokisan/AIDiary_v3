import React, { useState } from "react";
import { API_BASE } from "../lib/supabase";

type Msg = { role: "ai" | "user"; text: string };

export const DiaryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [chat, setChat] = useState<Msg[]>([
    { role: "ai", text: "今日いちばん印象に残ったことは何ですか？" },
  ]);
  const [input, setInput] = useState("");
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"chat" | "preview">("chat");
  const [preview] = useState(""); // placeholder to keep linter satisfied (can be removed later)
  const [diary, setDiary] = useState("");
  const [scores, setScores] = useState<{joy:number; anger:number; sadness:number; pleasure:number} | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newHistory = [...chat, { role: "user", text: input }];
    setChat(newHistory);
    setInput("");
    const historyStr = newHistory
      .map((m) => (m.role === "ai" ? `Q:` : `A:`) + m.text)
      .join("\n");

    // increment round
    const nextRound = round + 1;
    setRound(nextRound);
    // まとめフェーズへ
    if (nextRound >= 3) {
      const res = await fetch(`${API_BASE}/diary/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: historyStr }),
      });
      const raw = await res.text();           // Gemini から返るテキスト(JSON文字列)
      try {
        const parsed = JSON.parse(raw);
        setDiary(parsed.diary);
        setScores(parsed.scores);
      } catch (_) {
        // パース失敗時はそのまま全文を日記本文として扱う
        setDiary(raw);
        setScores(null);
      }
      setPhase("preview");
      return;
    }

    // 通常質問
    const res = await fetch(`${API_BASE}/diary/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: historyStr, round }),
    });
    const { question, round: next } = await res.json();
    setRound(next);
    setChat((prev) => [...prev, { role: "ai", text: question }]);
  };

  if (phase === "preview") {
    return (
      <div className="modal">
        <h2 className="mb-2">プレビュー</h2>
        <pre className="border p-2 whitespace-pre-wrap">{diary}</pre>

        {scores && (
          <div className="mt-2">
            <p>喜: {scores.joy}</p>
            <p>怒: {scores.anger}</p>
            <p>哀: {scores.sadness}</p>
            <p>楽: {scores.pleasure}</p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            className="btn-primary"
            onClick={async () => {
              try {
                await fetch(`${API_BASE}/entries`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: diary, ...scores }),
                });
                alert("保存しました！");
                onClose();
              } catch (e) {
                alert("保存に失敗しました");
              }
            }}
          >
            保存
          </button>
          <button className="btn-secondary" onClick={() => setPhase("chat")}>
            もう少し質問を続ける
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal">
      <div className="chat-area">
        {chat.map((m, i) => (
          <p key={i} className={m.role === "ai" ? "ai" : "user"}>
            {m.text}
          </p>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="ここに入力..."
      />
      <button onClick={handleSend}>送信</button>
    </div>
  );
};