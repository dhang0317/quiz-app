import React, { useState, useEffect } from 'react';
import { Volume2, RotateCw, ArrowLeft, ArrowRight, Shuffle, CheckCircle, Flame } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardViewProps {
  cards: Flashcard[];
  onToggleMastered: (id: string) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ cards, onToggleMastered }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>(cards);

  useEffect(() => {
    setShuffledCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  if (shuffledCards.length === 0) {
    return (
      <div className="text-center py-20 liquid-glass rounded-3xl p-8 max-w-md mx-auto my-10">
        <p className="text-slate-600 font-medium">題庫中沒有卡片，請先至「單字管理」新增單字。</p>
      </div>
    );
  }

  const currentCard = shuffledCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledCards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length);
    }, 150);
  };

  const handleShuffle = () => {
    setShuffledCards([...shuffledCards].sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const speakText = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
      {/* 頂部進度與操作 */}
      <div className="flex items-center justify-between text-sm text-slate-600 font-medium px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Card</span>
          <span className="text-lg font-black text-[#0a192f]">{currentIndex + 1}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">{shuffledCards.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold liquid-glass liquid-glass-hover text-[#0a192f]"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>隨機</span>
          </button>
          <button
            onClick={() => onToggleMastered(currentCard.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              currentCard.mastered
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'liquid-glass liquid-glass-hover text-[#0a192f]'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{currentCard.mastered ? '已掌握' : '標記掌握'}</span>
          </button>
        </div>
      </div>

      {/* 3D 翻轉卡片 */}
      <div
        className="w-full h-96 sm:h-[420px] cursor-pointer perspective-1000 select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d rounded-3xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* 正面 */}
          <div className="absolute inset-0 w-full h-full backface-hidden liquid-glass rounded-3xl p-8 sm:p-12 flex flex-col justify-between items-center text-center shadow-xl border border-white/60">
            <div className="w-full flex justify-between items-center text-slate-400">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Term</span>
              <button
                onClick={(e) => speakText(currentCard.term, e)}
                className="p-2.5 rounded-2xl liquid-glass liquid-glass-hover text-[#0a192f]"
                title="發音"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="my-auto">
              <h2 className="text-4xl sm:text-5xl font-black text-[#0a192f] tracking-tight">
                {currentCard.term}
              </h2>
              {currentCard.partOfSpeech && (
                <span className="inline-block mt-3 px-3 py-1 bg-[#0a192f]/5 text-[#0a192f] rounded-full text-xs font-semibold">
                  {currentCard.partOfSpeech}
                </span>
              )}
            </div>

            <div className="text-slate-400 text-xs flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5" />
              <span>點擊翻面查看定義與例句</span>
            </div>
          </div>

          {/* 背面 */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 liquid-glass rounded-3xl p-8 sm:p-12 flex flex-col justify-between items-center text-center shadow-xl border border-white/60 bg-white/70">
            <div className="w-full flex justify-between items-center text-slate-400">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#0a192f]">Definition</span>
              <button
                onClick={(e) => speakText(currentCard.exampleSentence || currentCard.term, e)}
                className="p-2.5 rounded-2xl liquid-glass liquid-glass-hover text-[#0a192f]"
                title="朗讀例句"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="my-auto max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0a192f]">
                {currentCard.definition}
              </h3>
              {currentCard.exampleSentence && (
                <div className="mt-5 p-4 rounded-2xl bg-white/80 border border-black/5 text-left shadow-sm">
                  <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                    "{currentCard.exampleSentence}"
                  </p>
                  {currentCard.exampleTranslation && (
                    <p className="mt-1 text-xs text-slate-500">
                      {currentCard.exampleTranslation}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-slate-400 text-xs flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5" />
              <span>點擊翻回正面</span>
            </div>
          </div>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          className="p-3.5 rounded-2xl liquid-glass liquid-glass-hover text-[#0a192f] shadow-md"
          title="上一張"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-3 rounded-2xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
        >
          翻轉卡片
        </button>

        <button
          onClick={handleNext}
          className="p-3.5 rounded-2xl liquid-glass liquid-glass-hover text-[#0a192f] shadow-md"
          title="下一張"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
