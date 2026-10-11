/**
 * Configuração vinda do arquivo .env (veja .env.example).
 * Sem as chaves do Supabase o site roda em modo demonstração: pedidos,
 * pagamentos e alunos ficam salvos só neste navegador.
 */
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
};

export const isLive = Boolean(env.supabaseUrl && env.supabaseAnonKey);
