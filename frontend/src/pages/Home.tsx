import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from "../lib/supabase";

type MessageType = {
  role: 'user' | 'model';
  content: string;
};

type EmotionData = {
  joy: number;
  anger: number;
  sadness: number;
  pleasure: number;
};

const Home: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [diaryPreview, setDiaryPreview] = useState<string | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: MessageType = { role: 'user', content: inputMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      const aiResponse: MessageType = { role: 'model', content: result.response };
      setMessages([...updatedMessages, aiResponse]);
    } catch (error) {
      console.error('Failed to get response:', error);
      setMessage(`AIとの対話に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateDiaryPreview = async () => {
    if (messages.length < 3) return; // 最低3回のやり取りが必要
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate_diary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setDiaryPreview(result.diary);
      setEmotionData(result.emotion);
    } catch (error) {
      console.error('Failed to generate diary:', error);
      setMessage(`日記の生成に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveDiary = async () => {
    if (!diaryPreview) return;
    
    try {
      const response = await fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: diaryPreview, emotion: emotionData }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Save successful:', result);
      setMessage(`保存しました！ (ID: ${result.id})`);
      
      setMessages([]);
      setDiaryPreview(null);
      setEmotionData(null);
    } catch (error) {
      console.error('Failed to save entry:', error);
      setMessage(`保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const renderEmotionVisualization = () => {
    if (!emotionData) return null;
    
    return (
      <div className="emotion-visualization">
        <h3>感情分析</h3>
        <div className="emotion-bars">
          {Object.entries(emotionData).map(([emotion, value]) => (
            <div key={emotion} className="emotion-bar">
              <div className="emotion-label">
                {emotion === 'joy' ? '喜び' : 
                 emotion === 'anger' ? '怒り' : 
                 emotion === 'sadness' ? '悲しみ' : 
                 '楽しさ'}
              </div>
              <div className="emotion-value-container">
                <div 
                  className="emotion-value" 
                  style={{ 
                    width: `${value * 100}%`,
                    backgroundColor: 
                      emotion === 'joy' ? '#FFC107' : 
                      emotion === 'anger' ? '#F44336' : 
                      emotion === 'sadness' ? '#2196F3' : 
                      '#4CAF50'
                  }}
                ></div>
              </div>
              <div className="emotion-percentage">{Math.round(value * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="diary-container">
      <h1>AI対話で日記を作成</h1>
      
      {/* メッセージ表示エリア */}
      {messages.length > 0 && (
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* 入力エリア */}
      <div className="input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="今日の出来事を教えてください..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
          {isLoading ? '送信中...' : '送信'}
        </button>
      </div>
      
      {/* 日記プレビューボタン */}
      {messages.length >= 3 && !diaryPreview && (
        <button onClick={generateDiaryPreview} disabled={isLoading}>
          日記化してみますか？
        </button>
      )}
      
      {/* 日記プレビュー */}
      {diaryPreview && (
        <div className="diary-preview">
          <h2>日記プレビュー</h2>
          <div className="preview-content">{diaryPreview}</div>
          {renderEmotionVisualization()}
          <div className="preview-actions">
            <button onClick={() => setDiaryPreview(null)}>対話に戻る</button>
            <button onClick={saveDiary}>完成して保存</button>
          </div>
        </div>
      )}
      
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default Home; 