import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-mono">
      <div className="bg-white border-2 border-black w-full max-w-lg p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-black pb-2">
          <h3 className="font-bold text-base">系統設定 (AI 與雲端)</h3>
          <button onClick={onClose} className="px-2 py-0.5 border border-black hover:bg-black hover:text-white">
            關閉
          </button>
        </div>

        {/* AI 節省模式設定 */}
        <div className="space-y-3">
          <div className="font-bold text-sm">Google Gemini AI 設定 (已開啟節省模式)</div>
          <p className="text-xs text-neutral-500">
            * 系統已鎖定低溫與嚴格 token 輸出，極度節省額度。選擇題與多篇長文均使用此 API。
          </p>

          <div>
            <label className="block text-xs mb-1">Gemini API Key</label>
            <input
              type="password"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              placeholder="貼入 AIzaSy..."
              className="w-full px-3 py-1.5 border border-black text-xs"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">模型選擇</label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full px-3 py-1.5 border border-black text-xs bg-white"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (推薦，極速省 token)</option>
              <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash Latest</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>
        </div>

        <hr className="border-black" />

        {/* Supabase 雲端設定 */}
        <div className="space-y-3">
          <div className="font-bold text-sm">Supabase 題庫資料庫 (可選)</div>
          <div>
            <label className="block text-xs mb-1">Project URL</label>
            <input
              type="text"
              value={sbUrl}
              onChange={(e) => setSbUrl(e.target.value)}
              placeholder="https://xxx.supabase.co"
              className="w-full px-3 py-1.5 border border-black text-xs"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Anon Key</label>
            <input
              type="password"
              value={sbAnonKey}
              onChange={(e) => setSbAnonKey(e.target.value)}
              placeholder="eyJh..."
              className="w-full px-3 py-1.5 border border-black text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-black">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-black hover:bg-neutral-100 text-xs"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-1.5 border border-black font-bold bg-black text-white hover:bg-neutral-800 text-xs"
          >
            保存設定
          </button>
        </div>
      </div>
    </div>
  );
};
