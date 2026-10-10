import React from 'react';
import { Layers, HelpCircle, BookOpen, Edit3, Share2, Settings } from 'lucide-react';
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
    <header className="liquid-glass sticky top-0 z-40 w-full border-0 border-b border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => onSelectMode('flashcards')}
        >
          <span className="text-2xl font-bold tracking-tight text-[#0a192f]">
            Vocabulum
          </span>
          <span className="hidden sm:inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#0a192f]/5 text-[#0a192f] border border-[#0a192f]/10">
            Studio
          </span>
        </div>

        {/* 模式切換按鈕 */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onSelectMode('flashcards')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              currentMode === 'flashcards'
                ? 'bg-[#0a192f] text-white shadow-md'
                : 'liquid-glass liquid-glass-hover text-[#0a192f]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>翻卡 ({cardCount})</span>
          </button>

          <button
            onClick={() => onSelectMode('hybrid-quiz')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              currentMode === 'hybrid-quiz'
                ? 'bg-[#0a192f] text-white shadow-md'
                : 'liquid-glass liquid-glass-hover text-[#0a192f]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>選擇/填空合一</span>
          </button>

          <button
            onClick={() => onSelectMode('cloze-passage')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              currentMode === 'cloze-passage'
                ? 'bg-[#0a192f] text-white shadow-md'
                : 'liquid-glass liquid-glass-hover text-[#0a192f]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>文章測驗</span>
          </button>

          <button
            onClick={() => onSelectMode('deck-editor')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              currentMode === 'deck-editor'
                ? 'bg-[#0a192f] text-white shadow-md'
                : 'liquid-glass liquid-glass-hover text-[#0a192f]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>單字管理</span>
          </button>
        </nav>

        {/* 右側操作 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium liquid-glass liquid-glass-hover text-[#0a192f]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">分享</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl liquid-glass liquid-glass-hover text-[#0a192f]"
            title="設定"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
