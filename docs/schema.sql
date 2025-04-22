-- スキーマバックアップ (生成日: 2024-05-??)
-- Supabase から取得したテーブル定義

-- テーブル: public.entries
CREATE TABLE IF NOT EXISTS public.entries (
  id serial PRIMARY KEY,
  user_id uuid,
  content text,
  emotion text,
  created_at timestamptz DEFAULT now()
); 