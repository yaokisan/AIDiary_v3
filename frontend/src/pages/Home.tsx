import React, { useState } from 'react';
import { API_BASE } from "../lib/supabase";
import { DiaryModal } from "../components/DiaryModal";

const Home: React.FC = () => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSave = async () => {
    setMessage(''); // Clear previous messages
    try {
      const response = await fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Save successful:', result);
      setMessage(`保存しました！ (ID: ${result.id})`);
      setContent(''); // Clear the textarea after successful save
    } catch (error) {
      console.error('Failed to save entry:', error);
      setMessage(`保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div>
      <h1>日記を入力</h1>

      {/* 旧入力 UI */}
      <textarea
        rows={10}
        cols={50}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日の出来事を記録しましょう..."
      />
      <div>
        <button onClick={handleSave}>保存</button>
        {/* ▼▼ 追加: AI対話で日記を書く ▼▼ */}
        <button style={{ marginLeft: "1rem" }} onClick={() => setShowModal(true)}>
          日記を書く（AI）
        </button>
      </div>
      {message && <p>{message}</p>}

      {/* モーダル表示 */}
      {showModal && <DiaryModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Home; 