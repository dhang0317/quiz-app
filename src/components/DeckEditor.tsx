import React, { useState } from 'react';
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
    alert('題庫已保存');
  };

  // 簡化極致的單字輸入：一鍵快速貼上
  const handleQuickAdd = () => {
    if (!quickInputText.trim()) return;
    const lines = quickInputText.split('\n').filter((l) => l.trim().length > 0);
    const newCards: Flashcard[] = lines.map((line, idx) => {
      // 支援多種常見分隔符：空格、破折號、等號、逗號、冒號
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
    alert(`成功新增 ${newCards.length} 個單字！`);
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between border-b border-black pb-3 mb-6">
        <div>
          <h2 className="text-xl font-bold">題庫管理</h2>
          <p className="text-xs font-mono text-neutral-500 mt-1">簡化單字錄入：直接貼上即可解析，無需繁瑣欄位</p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 border-2 border-black font-bold bg-black text-white hover:bg-neutral-800 transition"
        >
          保存題庫
        </button>
      </div>

      {/* 題庫名稱 */}
      <div className="mb-6">
        <label className="block text-xs font-mono mb-1">題庫名稱</label>
        <input
          type="text"
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          className="w-full px-3 py-2 border border-black font-mono text-sm focus:outline-none"
        />
      </div>

      {/* Tab 切換 */}
      <div className="flex border-b border-black mb-6">
        <button
          onClick={() => setActiveTab('quick')}
          className={`px-4 py-2 text-sm font-mono border-t border-l border-r border-black transition ${
            activeTab === 'quick' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          超簡易快速貼上新增
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-sm font-mono border-t border-l border-r border-black transition ${
            activeTab === 'list' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          現有單字清單 ({cards.length})
        </button>
      </div>

      {/* 快速貼上模式 */}
      {activeTab === 'quick' && (
        <div className="border border-black p-6 bg-white space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold mb-1">
              直接貼上單字列表（一行一個，格式只需：「單字 中文」或「單字 - 中文」）：
            </label>
            <p className="text-xs text-neutral-500 mb-2">
              例如：
              <br />apple 蘋果
              <br />banana - 香蕉
              <br />implement 實施 The team will implement the plan.
            </p>
            <textarea
              rows={8}
              value={quickInputText}
              onChange={(e) => setQuickInputText(e.target.value)}
              placeholder="在此直接貼上單字..."
              className="w-full p-3 border border-black font-mono text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={handleQuickAdd}
            disabled={!quickInputText.trim()}
            className="w-full py-2.5 border border-black font-bold bg-black text-white hover:bg-neutral-800 transition disabled:opacity-30"
          >
            一鍵加入題庫
          </button>
        </div>
      )}

      {/* 單字清單列表 */}
      {activeTab === 'list' && (
        <div className="space-y-2">
          {cards.map((c, idx) => (
            <div key={c.id} className="border border-black p-3 bg-white flex items-center justify-between">
              <div className="font-mono text-sm">
                <span className="font-bold text-neutral-400 mr-2">#{idx + 1}</span>
                <span className="font-bold text-black mr-3">{c.term}</span>
                <span className="text-neutral-600">{c.definition}</span>
                {c.exampleSentence && (
                  <span className="text-xs text-neutral-400 block mt-0.5 font-serif italic">"{c.exampleSentence}"</span>
                )}
              </div>
              <button
                onClick={() => handleDeleteCard(c.id)}
                className="px-2 py-1 text-xs border border-black hover:bg-black hover:text-white transition"
              >
                刪除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
