import React, { useState } from 'react';
import { X, Copy, Check, UploadCloud, DownloadCloud, Link2 } from 'lucide-react';
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
  const [isCopied, setIsCopied] = useState(false);

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
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="liquid-glass rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl border border-white/60">
        <div className="flex justify-between items-center pb-2 border-b border-black/5">
          <h3 className="font-black text-lg text-[#0a192f]">題庫雲端分享與載入</h3>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-black/5 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'upload' ? 'bg-[#0a192f] text-white shadow-sm' : 'liquid-glass text-slate-600'
            }`}
          >
            分享題庫
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'download' ? 'bg-[#0a192f] text-white shadow-sm' : 'liquid-glass text-slate-600'
            }`}
          >
            代碼載入
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-white/70 text-xs text-slate-700 border border-black/5">
            {statusMsg}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              即將分享：<strong className="text-[#0a192f]">{currentDeck.title}</strong> ({currentDeck.cards.length} 個單字)
            </p>

            {!shareCode ? (
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-xs shadow-md transition disabled:opacity-40"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isLoading ? '生成中...' : '生成 6 位雲端分享碼'}</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-white/70 border border-black/5 text-center space-y-3">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">分享代碼</span>
                <div className="text-3xl font-black text-[#0a192f] tracking-widest">{shareCode}</div>
                <button
                  onClick={() => copyUrl(`${window.location.origin}${window.location.pathname}?code=${shareCode}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a192f] text-white font-bold text-xs shadow-sm"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? '已複製連結！' : '複製專屬連結'}</span>
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-black/5">
              <button
                onClick={() => copyUrl(`${window.location.origin}${window.location.pathname}?deck=${encodeDeckToURL(currentDeck)}`)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl liquid-glass liquid-glass-hover text-[#0a192f] font-semibold text-xs"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>複製免雲端 URL 連結 (內嵌所有單字)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'download' && (
          <div className="space-y-4 text-xs">
            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="輸入 6 位分享碼..."
              className="liquid-glass w-full text-center font-black text-2xl p-3 rounded-2xl tracking-widest text-[#0a192f] uppercase focus:outline-none focus:ring-2 focus:ring-[#0a192f]/20"
            />
            <button
              onClick={handleDownload}
              disabled={isLoading || inputCode.length < 4}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-xs shadow-md transition disabled:opacity-40"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{isLoading ? '載入中...' : '確認載入'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
