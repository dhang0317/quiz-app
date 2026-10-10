import React, { useState } from 'react';
import { X, Sparkles, Database, Check } from 'lucide-react';
import { SupabaseConfig } from '../services/supabase';
import { AISettings } from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseConfig: SupabaseConfig;
  onSaveSupabaseConfig: (config: SupabaseConfig) => void;
  aiSettings: AISettings;
  onSaveAISettings: (settings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  supabaseConfig,
  onSaveSupabaseConfig,
  aiSettings,
  onSaveAISettings,
}) => {
  const [sbUrl, setSbUrl] = useState(supabaseConfig.url || '');
  const [sbAnonKey, setSbAnonKey] = useState(supabaseConfig.anonKey || '');
  const [aiKey, setAiKey] = useState(aiSettings.apiKey || '');
  const [aiModel, setAiModel] = useState(aiSettings.model || 'gemini-2.0-flash');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSupabaseConfig({ url: sbUrl.trim(), anonKey: sbAnonKey.trim() });
    onSaveAISettings({ apiKey: aiKey.trim(), model: aiModel });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="liquid-glass rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl border border-white/60">
        <div className="flex justify-between items-center pb-2 border-b border-black/5">
          <h3 className="font-black text-lg text-[#0a192f]">系統設定 (AI 與雲端)</h3>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-black/5 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI 節省模式設定 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0a192f]" />
            <span className="font-bold text-sm text-[#0a192f]">Google Gemini AI 設定 (已啟用節省模式)</span>
          </div>
          <p className="text-xs text-slate-500">
            * 系統已鎖定低溫與嚴格 token 輸出，極度節省額度。選擇題與多篇長文均使用此 API。
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Gemini API Key</label>
            <input
              type="password"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              placeholder="貼入 AIzaSy..."
              className="liquid-glass w-full px-4 py-2.5 rounded-xl text-xs text-[#0a192f] font-mono focus:outline-none focus:ring-2 focus:ring-[#0a192f]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">模型選擇</label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="liquid-glass w-full px-4 py-2.5 rounded-xl text-xs text-[#0a192f] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a192f]/20 bg-white/60"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (推薦，極速省 token)</option>
              <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash Latest</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>
        </div>

        <hr className="border-black/5" />

        {/* Supabase 雲端設定 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0a192f]" />
            <span className="font-bold text-sm text-[#0a192f]">Supabase 題庫資料庫 (可選)</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Project URL</label>
            <input
              type="text"
              value={sbUrl}
              onChange={(e) => setSbUrl(e.target.value)}
              placeholder="https://xxx.supabase.co"
              className="liquid-glass w-full px-4 py-2.5 rounded-xl text-xs text-[#0a192f] focus:outline-none focus:ring-2 focus:ring-[#0a192f]/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Anon Key</label>
            <input
              type="password"
              value={sbAnonKey}
              onChange={(e) => setSbAnonKey(e.target.value)}
              placeholder="eyJh..."
              className="liquid-glass w-full px-4 py-2.5 rounded-xl text-xs text-[#0a192f] font-mono focus:outline-none focus:ring-2 focus:ring-[#0a192f]/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl liquid-glass text-xs font-bold text-slate-600"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-xs shadow-md transition transform hover:-translate-y-0.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>保存設定</span>
          </button>
        </div>
      </div>
    </div>
  );
};
