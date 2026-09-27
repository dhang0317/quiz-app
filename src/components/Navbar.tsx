import React from 'react';
import { StudyMode } from '../types';

interface NavbarProps {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  onOpenShare: () => void;
  onOpenSettings: () => void;
  cardCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  onOpenShare,
  onOpenSettings,
  cardCount,
}) => {
  return (
    <header className="border-b border-black bg-white sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo (純文字，無圖標) */}
        <div
          className="font-bold text-lg tracking-tight cursor-pointer select-none"
          onClick={() => onSelectMode('flashcards')}
        >
          QUIZLET CONTEXT
        </div>

        {/* 模式導覽列 (純文字，純黑白) */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-sm font-medium">
          <button
            onClick={() => onSelectMode('flashcards')}
            className={`px-3 py-1.5 border transition ${
              currentMode === 'flashcards'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-transparent hover:border-black'
            }`}
          >
            翻卡 ({cardCount})
          </button>

          <button
            onClick={() => onSelectMode('hybrid-quiz')}
            className={`px-3 py-1.5 border transition ${
              currentMode === 'hybrid-quiz'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-transparent hover:border-black'
            }`}
          >
            選擇/填空合一
          </button>

          <button
            onClick={() => onSelectMode('cloze-passage')}
            className={`px-3 py-1.5 border transition ${
              currentMode === 'cloze-passage'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-transparent hover:border-black'
            }`}
          >
            文章測驗
          </button>

          <button
            onClick={() => onSelectMode('deck-editor')}
            className={`px-3 py-1.5 border transition ${
              currentMode === 'deck-editor'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-transparent hover:border-black'
            }`}
          >
            題庫編輯
          </button>
        </nav>

        {/* 設定與分享 */}
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={onOpenShare}
            className="px-3 py-1.5 border border-black hover:bg-black hover:text-white transition"
          >
            分享
          </button>
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 border border-black hover:bg-black hover:text-white transition"
          >
            設定
          </button>
        </div>
      </div>
    </header>
  );
};
