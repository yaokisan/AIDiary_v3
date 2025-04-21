// 環境変数を読み込むための仮のコード
// 実際のSupabase Clientの初期化は、アプリケーションのエントリーポイントや
// Supabaseを使用する具体的なファイルで行うことを推奨します。

// Viteを使用する場合、環境変数は `import.meta.env.VITE_SUPABASE_URL` のようにアクセスします。
// Node.js環境（例: Next.jsのサーバーサイド）では `process.env.SUPABASE_URL` のようにアクセスします。

// このファイルは、環境変数のキー名を定義しておく場所として利用できます。
export const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
export const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL または Anon Key が環境変数に設定されていません。','\n','フロントエンドからSupabaseに接続する場合は .env ファイルに VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。'
  );
}

// Supabaseクライアントのインスタンスを作成する関数（例）
// import { createClient } from '@supabase/supabase-js'
// export const supabase = createClient(supabaseUrl!, supabaseAnonKey!) 