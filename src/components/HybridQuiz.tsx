import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
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
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="liquid-glass rounded-3xl p-8 max-w-md mx-auto space-y-3 shadow-lg">
          <Sparkles className="w-8 h-8 mx-auto text-[#0a192f] animate-pulse" />
          <p className="text-[#0a192f] font-bold">AI 正在以語境節省模式出題中...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center liquid-glass rounded-3xl p-8 my-10 shadow-lg">
        <p className="text-slate-600 mb-4 font-medium">尚無可測驗題目，請確認題庫是否有單字。</p>
        <button
          onClick={onRestart}
          className="px-5 py-2.5 rounded-2xl bg-[#0a192f] text-white font-bold text-sm shadow-md"
        >
          重新載入
        </button>
      </div>
    );
  }

  const isFinished = currentIndex >= questions.length;
  const currentQ = questions[currentIndex];

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
      <div className="max-w-md mx-auto my-12 liquid-glass rounded-3xl p-8 sm:p-10 text-center shadow-2xl border border-white/60">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0a192f] text-white flex items-center justify-center shadow-md mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-[#0a192f] tracking-tight">測驗完成</h2>
        <p className="text-sm text-slate-600 font-medium mt-1">答對題數：{score} / {questions.length}</p>
        <div className="my-6 py-4 rounded-2xl bg-white/70 border border-black/5 text-5xl font-black text-[#0a192f]">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setIsSubmitted(false);
            onRestart();
          }}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重新產生測驗</span>
        </button>
      </div>
    );
  }

  const currentAnswer = selectedOption || typedInput;
  const isAnswerCorrect = currentAnswer.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* 進度條 */}
      <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
        <span>Hybrid Quiz (AI Context)</span>
        <span className="text-[#0a192f] font-black text-sm">{currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-white/60">
        {/* 中文意釋 */}
        <div className="text-xs font-semibold text-slate-500 pb-2 border-b border-black/5">
          語意定義：<span className="text-[#0a192f] font-bold text-sm">{currentQ.definition}</span>
        </div>

        {/* 語境句子挖空 */}
        <div className="text-xl sm:text-2xl leading-relaxed text-slate-800 font-medium">
          <span>{currentQ.sentenceBefore} </span>
          <span className="font-bold border-b-2 border-[#0a192f] px-3 py-0.5 rounded-md bg-white/60 text-[#0a192f] inline-block min-w-28 text-center shadow-inner">
            {isSubmitted ? currentQ.correctAnswer : currentAnswer || '________'}
          </span>
          <span> {currentQ.sentenceAfter}</span>
        </div>

        {/* 方式一：鍵盤輸入 */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-semibold text-slate-500">方式一：直接鍵盤輸入</label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedInput.trim()) handleCheckAnswer(typedInput);
            }}
            className="flex gap-2"
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
              placeholder="在此輸入單字 (大小寫不限)..."
              className="liquid-glass flex-1 px-4 py-2.5 rounded-xl text-sm text-[#0a192f] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a192f]/20 font-medium"
            />
            {!isSubmitted && (
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-xs shadow-md transition disabled:opacity-40"
              >
                確認
              </button>
            )}
          </form>
        </div>

        {/* 方式二：點選選項 */}
        <div className="space-y-2 pt-2 border-t border-black/5">
          <label className="block text-xs font-semibold text-slate-500">方式二：或點選下方選項</label>
          <div className="grid grid-cols-2 gap-2.5">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              let btnCls = 'liquid-glass liquid-glass-hover text-[#0a192f] font-semibold';

              if (isSubmitted) {
                if (opt.toLowerCase() === currentQ.correctAnswer.toLowerCase()) {
                  btnCls = 'bg-emerald-600 text-white font-bold shadow-md';
                } else if (isSelected) {
                  btnCls = 'bg-rose-500/20 text-rose-800 line-through';
                }
              } else if (isSelected) {
                btnCls = 'bg-[#0a192f] text-white font-bold shadow-md';
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
                  className={`py-3 px-4 rounded-xl text-sm text-left transition flex items-center justify-between ${btnCls}`}
                >
                  <span>{opt}</span>
                  {isSubmitted && opt.toLowerCase() === currentQ.correctAnswer.toLowerCase() && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                  {isSubmitted && isSelected && opt.toLowerCase() !== currentQ.correctAnswer.toLowerCase() && (
                    <XCircle className="w-4 h-4 text-rose-700" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 批改反饋 */}
        {isSubmitted && (
          <div className="pt-4 border-t border-black/10 space-y-3">
            <div className={`text-sm font-bold flex items-center gap-1.5 ${isAnswerCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isAnswerCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>回答正確！</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>回答錯誤，正確答案為：{currentQ.correctAnswer}</span>
                </>
              )}
            </div>
            <div className="text-xs text-slate-600 bg-white/60 p-3 rounded-xl border border-black/5">
              語境全句："{currentQ.contextSentence}"
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-xs shadow-md transition transform hover:-translate-y-0.5"
              >
                <span>下一題</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
