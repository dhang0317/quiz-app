import React, { useState } from 'react';
import { Plus, Trash2, Check, Sparkles, BookOpen } from 'lucide-react';
import { Deck, Flashcard } from '../types';

interface DeckEditorProps {
  deck: Deck;
  onUpdateDeck: (updated: Deck) => void;
}

export const DeckEditor: React.FC<DeckEditorProps> = ({ deck, onUpdateDeck }) => {
  const [cards, setCards] = useState<Flashcard[]>(deck.cards);
  const [deckTitle, setDeckTitle] = useState(deck.title);
  const [quickInputText, setQuickInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'list'>('quick');

  const handleSave = () => {
    onUpdateDeck({
      ...deck,
      title: deckTitle,
      cards,
    });
    alert('題庫設定已成功儲存！');
  };

  const handleQuickAdd = () => {
    if (!quickInputText.trim()) return;
    const lines = quickInputText.split('\n').filter((l) => l.trim().length > 0);
    const newCards: Flashcard[] = lines.map((line, idx) => {
      const parts = line.split(/[-–—=:,，\t]+/).map((s) => s.trim());
      const term = parts[0] || '';
      const definition = parts[1] || parts[0];
      const example = parts[2] || '';

      return {
        id: `card-${Date.now()}-${idx}`,
        term,
        definition,
        exampleSentence: example,
        mastered: false,
      };
    });

    setCards([...cards, ...newCards]);
    setQuickInputText('');
    alert(`已新增 ${newCards.length} 個單字！`);
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 標頭 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/5">
        <div>
          <h2 className="text-2xl font-black text-[#0a192f] tracking-tight">單字庫管理</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">支援極簡快速貼上，直接錄入單字與意思</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
        >
          <Check className="w-4 h-4" />
          <span>保存所有變更</span>
        </button>
      </div>

      {/* 題庫名稱 */}
      <div className="liquid-glass rounded-3xl p-6 space-y-2 shadow-md">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">學習集名稱</label>
        <input
          type="text"
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          className="liquid-glass w-full px-4 py-2.5 rounded-xl text-base text-[#0a192f] font-bold focus:outline-none focus:ring-2 focus:ring-[#0a192f]/20"
        />
      </div>

      {/* Tab 選單 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('quick')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === 'quick'
              ? 'bg-[#0a192f] text-white shadow-md'
              : 'liquid-glass liquid-glass-hover text-[#0a192f]'
          }`}
        >
          超簡易快速貼上
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === 'list'
              ? 'bg-[#0a192f] text-white shadow-md'
              : 'liquid-glass liquid-glass-hover text-[#0a192f]'
          }`}
        >
          單字清單 ({cards.length})
        </button>
      </div>

      {/* 快速貼上模式 */}
      {activeTab === 'quick' && (
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border border-white/60">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0a192f]">直接貼上單字列表：</h3>
            <p className="text-xs text-slate-500">
              一行一個，格式只需：「單字 中文」或「單字 - 中文」：
              <br />
              <span className="font-mono text-slate-400">例：apple 蘋果 或 implement 實施 The team will implement the plan.</span>
            </p>
          </div>

          <textarea
            rows={8}
            value={quickInputText}
            onChange={(e) => setQuickInputText(e.target.value)}
            placeholder="在此貼入單字列表..."
            className="liquid-glass w-full p-4 rounded-2xl text-sm font-mono text-[#0a192f] focus:outline-none focus:ring-2 focus:ring-[#0a192f]/20 leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              onClick={handleQuickAdd}
              disabled={!quickInputText.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-xs shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              <span>一鍵解析並加入</span>
            </button>
          </div>
        </div>
      )}

      {/* 單字清單 */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {cards.map((c, idx) => (
            <div key={c.id} className="liquid-glass liquid-glass-hover p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 mr-2">#{idx + 1}</span>
                <span className="font-bold text-[#0a192f] text-base mr-2">{c.term}</span>
                <span className="text-xs text-slate-600">{c.definition}</span>
                {c.exampleSentence && (
                  <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">"{c.exampleSentence}"</p>
                )}
              </div>
              <button
                onClick={() => handleDeleteCard(c.id)}
                className="p-2 text-slate-400 hover:text-rose-600 transition"
                title="刪除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
