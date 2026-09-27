import React, { useState, useEffect } from 'react';
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
      <div className="text-center py-20 border border-black p-8 max-w-md mx-auto my-10">
        <p className="text-black font-medium">題庫中沒有卡片，請先至「題庫編輯」新增單字。</p>
      </div>
    );
  }

  const currentCard = shuffledCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledCards.length);
    }, 100);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length);
    }, 100);
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 狀態列 */}
      <div className="flex items-center justify-between mb-4 text-sm font-mono border-b border-black pb-2">
        <div>
          {currentIndex + 1} / {shuffledCards.length}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleShuffle}
            className="px-2.5 py-1 border border-black hover:bg-black hover:text-white transition"
          >
            隨機
          </button>
          <button
            onClick={() => onToggleMastered(currentCard.id)}
            className={`px-2.5 py-1 border border-black transition ${
              currentCard.mastered ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
            }`}
          >
            {currentCard.mastered ? '已掌握' : '標記掌握'}
          </button>
        </div>
      </div>

      {/* 翻轉卡片 */}
      <div
        className="w-full h-80 border-2 border-black p-8 flex flex-col justify-between items-center text-center cursor-pointer select-none bg-white hover:bg-neutral-50 transition"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="w-full flex justify-between items-center text-xs font-mono text-neutral-500 uppercase">
          <span>{isFlipped ? '背面 [定義與例句]' : '正面 [單字]'}</span>
          <button
            onClick={(e) => speakText(isFlipped ? currentCard.exampleSentence || currentCard.term : currentCard.term, e)}
            className="px-2 py-0.5 border border-black text-black hover:bg-black hover:text-white transition"
          >
            發音
          </button>
        </div>

        {!isFlipped ? (
          <div className="my-auto">
            <h2 className="text-4xl font-bold tracking-tight text-black">{currentCard.term}</h2>
            {currentCard.partOfSpeech && (
              <span className="inline-block mt-2 font-mono text-sm text-neutral-600">
                [{currentCard.partOfSpeech}]
              </span>
            )}
          </div>
        ) : (
          <div className="my-auto max-w-lg">
            <h3 className="text-2xl font-bold text-black">{currentCard.definition}</h3>
            {currentCard.exampleSentence && (
              <div className="mt-4 pt-4 border-t border-dashed border-neutral-300 text-left">
                <p className="text-sm font-medium text-black">"{currentCard.exampleSentence}"</p>
                {currentCard.exampleTranslation && (
                  <p className="mt-1 text-xs text-neutral-600">{currentCard.exampleTranslation}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-neutral-400 font-mono">點擊卡片以翻面</div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrev}
          className="px-6 py-2 border border-black font-medium hover:bg-black hover:text-white transition"
        >
          上一張
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-2 border border-black font-medium bg-neutral-100 hover:bg-black hover:text-white transition"
        >
          翻面
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2 border border-black font-medium hover:bg-black hover:text-white transition"
        >
          下一張
        </button>
      </div>
    </div>
  );
};
