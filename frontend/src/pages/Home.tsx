import React, { useState } from 'react';
import { API_BASE } from "../lib/supabase";

const Home: React.FC = () => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

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
      <textarea
        rows={10}
        cols={50}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日の出来事を記録しましょう..."
      />
      <div>
        <button onClick={handleSave}>保存</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Home; 