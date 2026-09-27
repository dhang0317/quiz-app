import React, { useState } from 'react';
import { Deck } from '../types';
import { uploadDeckToSupabase, fetchDeckFromSupabase, encodeDeckToURL, SupabaseConfig } from '../services/supabase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDeck: Deck;
  onLoadDeck: (deck: Deck) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSettings: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  currentDeck,
  onLoadDeck,
  supabaseConfig,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isSupabaseReady = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

  const handleUpload = async () => {
    setStatusMsg(null);
    if (!isSupabaseReady) {
      setStatusMsg('尚未設定 Supabase，可使用下方免雲端 URL 連結直接分享。');
      return;
    }
    setIsLoading(true);
    const res = await uploadDeckToSupabase(currentDeck, supabaseConfig);
    setIsLoading(false);
    if (res.error) {
      setStatusMsg(res.error);
    } else {
      setShareCode(res.shareCode);
    }
  };

  const handleDownload = async () => {
    if (!inputCode.trim()) return;
    setIsLoading(true);
    setStatusMsg(null);
    const res = await fetchDeckFromSupabase(inputCode, supabaseConfig);
    setIsLoading(false);
    if (res.error || !res.deck) {
      setStatusMsg(res.error || '載入失敗');
    } else {
      onLoadDeck(res.deck);
      setStatusMsg(`成功載入題庫「${res.deck.title}」！`);
    }
  };

  const copyUrl = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已複製到剪貼簿！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white border-2 border-black w-full max-w-md p-6 space-y-4 font-mono">
        <div className="flex justify-between items-center border-b border-black pb-2">
          <h3 className="font-bold text-base">題庫分享與載入</h3>
          <button onClick={onClose} className="px-2 py-0.5 border border-black hover:bg-black hover:text-white">
            關閉
          </button>
        </div>

        <div className="flex border-b border-black text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 border-t border-l border-r border-black ${
              activeTab === 'upload' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            分享題庫
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-1.5 border-t border-l border-r border-black ${
              activeTab === 'download' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            代碼載入
          </button>
        </div>

        {statusMsg && <div className="p-2 border border-black text-xs bg-neutral-100">{statusMsg}</div>}

        {activeTab === 'upload' && (
          <div className="space-y-3 text-xs">
            <p>題庫：{currentDeck.title} ({currentDeck.cards.length} 個單字)</p>

            {!shareCode ? (
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="w-full py-2 border border-black font-bold hover:bg-black hover:text-white disabled:opacity-40"
              >
                {isLoading ? '生成中...' : '生成 6 位雲端分享碼'}
              </button>
            ) : (
              <div className="p-3 border border-black bg-neutral-50 text-center space-y-2">
                <div className="text-xl font-bold tracking-widest">{shareCode}</div>
                <button
                  onClick={() => copyUrl(`${window.location.origin}${window.location.pathname}?code=${shareCode}`)}
                  className="px-3 py-1 border border-black hover:bg-black hover:text-white text-xs"
                >
                  複製專屬連結
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-300">
              <button
                onClick={() => copyUrl(`${window.location.origin}${window.location.pathname}?deck=${encodeDeckToURL(currentDeck)}`)}
                className="w-full py-1.5 border border-black hover:bg-black hover:text-white text-xs"
              >
                複製免雲端 URL 連結 (直接內嵌資料)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'download' && (
          <div className="space-y-3 text-xs">
            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="輸入 6 位分享碼..."
              className="w-full text-center font-bold text-lg p-2 border border-black uppercase"
            />
            <button
              onClick={handleDownload}
              disabled={isLoading || inputCode.length < 4}
              className="w-full py-2 border border-black font-bold hover:bg-black hover:text-white disabled:opacity-40"
            >
              {isLoading ? '載入中...' : '確認載入'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
