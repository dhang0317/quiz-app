import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Deck } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  if (config && config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
      return supabaseInstance;
    } catch (e) {
      console.error('Supabase 初始化失敗', e);
      return null;
    }
  }
  return supabaseInstance;
}

// 產生 6 位隨機短碼
export function generateShareCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 保存題庫至 Supabase
export async function uploadDeckToSupabase(
  deck: Deck,
  config: SupabaseConfig
): Promise<{ shareCode: string; error?: string }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { shareCode: '', error: '請先在設定中輸入正確的 Supabase 專案 URL 與 Anon Key' };
  }

  const shareCode = generateShareCode();

  try {
    const { error } = await client.from('shared_decks').upsert(
      {
        share_code: shareCode,
        title: deck.title,
        description: deck.description,
        deck_data: deck,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'share_code' }
    );

    if (error) {
      return { shareCode: '', error: error.message };
    }

    return { shareCode };
  } catch (err: any) {
    return { shareCode: '', error: err.message || '連線錯誤' };
  }
}

// 從 Supabase 藉由分享碼下載題庫
export async function fetchDeckFromSupabase(
  shareCode: string,
  config: SupabaseConfig
): Promise<{ deck?: Deck; error?: string }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { error: '請先在設定中輸入 Supabase 專案 URL 與 Anon Key' };
  }

  try {
    const { data, error } = await client
      .from('shared_decks')
      .select('deck_data')
      .eq('share_code', shareCode.trim().toUpperCase())
      .single();

    if (error || !data) {
      return { error: '找不到此分享代碼對應的題庫，請確認代碼是否正確。' };
    }

    return { deck: data.deck_data as Deck };
  } catch (err: any) {
    return { error: err.message || '連線取得題庫失敗' };
  }
}

// 支援 URL 參數 Base64 免雲端備援分享
export function encodeDeckToURL(deck: Deck): string {
  const jsonStr = JSON.stringify(deck);
  return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
}

export function decodeDeckFromURL(encoded: string): Deck | null {
  try {
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    return JSON.parse(jsonStr) as Deck;
  } catch {
    return null;
  }
}
