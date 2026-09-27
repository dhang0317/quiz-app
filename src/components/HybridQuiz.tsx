import React, { useState } from 'react';
import { HybridQuizQuestion } from '../types';

interface HybridQuizProps {
  questions: HybridQuizQuestion[];
  onRestart: () => void;
  isLoading?: boolean;
}

export const HybridQuiz: React.FC<HybridQuizProps> = ({ questions, onRestart, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center font-mono">
        <p className="border border-black p-6 inline-block">AI 正在以節省模式生成語境題目...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center border border-black p-8 my-10">
        <p className="mb-4">尚無可測驗題目，請確認題庫是否有單字。</p>
        <button onClick={onRestart} className="px-4 py-2 border border-black hover:bg-black hover:text-white">
          重新載入
        </button>
      </div>
    );
  }

  const isFinished = currentIndex >= questions.length;
  const currentQ = questions[currentIndex];

  // 提交驗證（無論是點選項或輸入文字）
  const handleCheckAnswer = (answerValue: string) => {
    if (isSubmitted) return;
    const isCorrect = answerValue.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    setIsSubmitted(true);
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setTypedInput('');
    setIsSubmitted(false);
    setCurrentIndex((c) => c + 1);
  };

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto my-12 border-2 border-black p-8 text-center bg-white">
        <h2 className="text-2xl font-bold mb-2">測驗完成</h2>
        <p className="text-sm font-mono mb-6">答對題數：{score} / {questions.length}</p>
        <div className="text-4xl font-mono font-bold mb-8">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setIsSubmitted(false);
            onRestart();
          }}
          className="w-full py-2.5 border-2 border-black font-semibold hover:bg-black hover:text-white transition"
        >
          重新開始
        </button>
      </div>
    );
  }

  const currentAnswer = selectedOption || typedInput;
  const isAnswerCorrect = currentAnswer.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 進度 */}
      <div className="flex justify-between items-center text-sm font-mono border-b border-black pb-2 mb-6">
        <span>選擇 / 填空合一測驗 (AI 語境)</span>
        <span>{currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="border-2 border-black p-6 bg-white space-y-6">
        {/* 中文意釋 */}
        <div className="text-xs font-mono uppercase text-neutral-500 border-b border-neutral-200 pb-1">
          題意：{currentQ.definition}
        </div>

        {/* 語境句子填空展示 (不要提示，直接留空) */}
        <div className="text-xl leading-relaxed font-serif">
          <span>{currentQ.sentenceBefore} </span>
          <span className="font-sans font-bold border-b-2 border-black px-2 inline-block min-w-24 text-center">
            {isSubmitted ? currentQ.correctAnswer : currentAnswer || '________'}
          </span>
          <span> {currentQ.sentenceAfter}</span>
        </div>

        {/* 填答方式一：鍵盤輸入填空 */}
        <div>
          <label className="block text-xs font-mono text-neutral-600 mb-1">方式一：直接鍵盤輸入 (不分大小寫)</label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedInput.trim()) handleCheckAnswer(typedInput);
            }}
            className="flex space-x-2"
          >
            <input
              type="text"
              autoFocus
              disabled={isSubmitted}
              value={typedInput}
              onChange={(e) => {
                setTypedInput(e.target.value);
                setSelectedOption(null);
              }}
              placeholder="輸入單字後按 Enter..."
              className="flex-1 px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
            />
            {!isSubmitted && (
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="px-4 py-2 border border-black font-medium hover:bg-black hover:text-white disabled:opacity-30"
              >
                確認
              </button>
            )}
          </form>
        </div>

        {/* 填答方式二：點選選擇題選項 */}
        <div>
          <label className="block text-xs font-mono text-neutral-600 mb-2">方式二：或直接點選選項</label>
          <div className="grid grid-cols-2 gap-2">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              let btnStyle = 'border border-black hover:bg-neutral-100';
              if (isSubmitted) {
                if (opt.toLowerCase() === currentQ.correctAnswer.toLowerCase()) {
                  btnStyle = 'border-2 border-black bg-black text-white font-bold';
                } else if (isSelected) {
                  btnStyle = 'border border-black bg-neutral-200 line-through';
                }
              } else if (isSelected) {
                btnStyle = 'border-2 border-black bg-neutral-200 font-semibold';
              }

              return (
                <button
                  key={i}
                  disabled={isSubmitted}
                  onClick={() => {
                    setSelectedOption(opt);
                    setTypedInput(opt);
                    handleCheckAnswer(opt);
                  }}
                  className={`py-2 px-3 text-sm font-mono text-left transition ${btnStyle}`}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 批改反饋 */}
        {isSubmitted && (
          <div className="border-t border-black pt-4 mt-4">
            <div className="font-mono text-sm font-bold mb-2">
              {isAnswerCorrect ? '[ 正確 ]' : `[ 錯誤 ] 正確答案為：${currentQ.correctAnswer}`}
            </div>
            <div className="text-xs text-neutral-600 mb-4">
              全句：{currentQ.contextSentence}
            </div>
            <button
              onClick={handleNext}
              className="w-full py-2 border border-black font-bold bg-black text-white hover:bg-neutral-800 transition"
            >
              下一題
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
