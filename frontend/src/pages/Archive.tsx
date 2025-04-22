import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 環境変数から URL / KEY を取得（Vite では import.meta.env)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

type Entry = {
  id: number;
  content: string;
  created_at: string;
  emotion: string | null;
};

const Archive: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error.message);
      } else if (data) {
        setEntries(data as Entry[]);
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  if (loading) return <p style={{ textAlign: 'center' }}>読み込み中…</p>;

  return (
    <main style={{ maxWidth: 420, margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>過去の日記</h1>

      {entries.length === 0 && <p>まだ日記はありません。</p>}

      {entries.map((e) => {
        let emotionData = null;
        if (e.emotion) {
          try {
            emotionData = JSON.parse(e.emotion);
          } catch (error) {
            console.error('感情データの解析に失敗:', error);
          }
        }
        
        return (
          <article
            key={e.id}
            style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <time style={{ fontSize: '0.85rem', color: '#666' }}>
              {new Date(e.created_at).toLocaleDateString()}
            </time>
            <p style={{ marginTop: '.5rem' }}>
              {e.content.slice(0, 30)}
              {e.content.length > 30 && '…'}
            </p>
            
            {emotionData && (
              <div className="entry-emotions" style={{ marginTop: '.5rem', display: 'flex', gap: '8px' }}>
                {Object.entries(emotionData).map(([emotion, value]) => (
                  <div key={emotion} style={{ 
                    display: 'inline-block', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    backgroundColor: 
                      emotion === 'joy' ? '#FFC107' : 
                      emotion === 'anger' ? '#F44336' : 
                      emotion === 'sadness' ? '#2196F3' : 
                      '#4CAF50',
                    color: '#fff',
                    opacity: Number(value) * 0.8 + 0.2
                  }}>
                    {emotion === 'joy' ? '喜び' : 
                     emotion === 'anger' ? '怒り' : 
                     emotion === 'sadness' ? '悲しみ' : 
                     '楽しさ'}: {Math.round(Number(value) * 100)}%
                  </div>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </main>
  );
};

export default Archive;    