/**
 * Supabase Client Configuration & Schema Reference for PokerCoach
 *
 * If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment,
 * this client can be used for remote database sync and Supabase Auth.
 * Otherwise, PokerCoach automatically operates with the built-in,
 * server-authoritative Express + SSE real-time engine which requires zero external setup.
 */

export interface SupabaseRoomRow {
  id: string;
  code: string;
  host_id: string;
  settings: Record<string, any>;
  game_state: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SupabasePlayerRow {
  id: string;
  room_code: string;
  user_id: string;
  name: string;
  avatar: string;
  chips: number;
  is_active: boolean;
  joined_at: string;
}

const supabaseUrl = typeof window !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_URL : process.env.VITE_SUPABASE_URL;
const supabaseKey = typeof window !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY : process.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('xyzcompany'));

/**
 * SQL Schema for Supabase Migration (if deploying to Supabase):
 *
 * CREATE TABLE IF NOT EXISTS public.poker_rooms (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   code TEXT UNIQUE NOT NULL,
 *   host_id TEXT NOT NULL,
 *   settings JSONB NOT NULL DEFAULT '{}',
 *   game_state JSONB NOT NULL DEFAULT '{}',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE IF NOT EXISTS public.poker_players (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   room_code TEXT REFERENCES public.poker_rooms(code) ON DELETE CASCADE,
 *   user_id TEXT NOT NULL,
 *   name TEXT NOT NULL,
 *   avatar TEXT DEFAULT '🤠',
 *   chips INT DEFAULT 1000,
 *   is_active BOOLEAN DEFAULT TRUE,
 *   joined_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Enable Realtime publication
 * ALTER PUBLICATION supabase_realtime ADD TABLE public.poker_rooms;
 * ALTER PUBLICATION supabase_realtime ADD TABLE public.poker_players;
 *
 * -- RLS Policies
 * ALTER TABLE public.poker_rooms ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public read access to rooms" ON public.poker_rooms FOR SELECT USING (true);
 * CREATE POLICY "Allow players to insert/update rooms" ON public.poker_rooms FOR ALL USING (true);
 */
