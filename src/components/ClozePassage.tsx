import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { ClozePassageQuestion, Flashcard } from '../types';
import { chunkCards, generatePassagesWithAI, AISettings } from '../services/aiService';
import { generateLocalClozePassage } from '../services/generator';

interface ClozePassageProps {
  cards: Flashcard[];
  aiSettings: AISettings;
}

export const ClozePassage: React.FC<ClozePassageProps> = ({ cards, aiSettings }) => {
  const cardChunks = chunkCards(cards, 5);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);

  const [passage, setPassage] = useState<ClozePassageQuestion | null>(() => {
    return generateLocalClozePassage(cardChunks[0] || cards, 0, cardChunks.length);
  });

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSwitchGroup = (idx: number) => {
    setCurrentGroupIdx(idx);
    setIsSubmitted(false);
    setUserAnswers({});
    setErrorMsg(null);
    const newPassage = generateLocalClozePassage(cardChunks[idx] || cards, idx, cardChunks.length);
    setPassage(newPassage);
  };

  const handleGenerateAI = async () => {
    if (!aiSettings.apiKey.trim()) {
      setErrorMsg('請先點選右上角「設定」填入 Gemini API Key');
      return;
    }
    setErrorMsg(null);
    setIsLoadingAI(true);
    try {
      const targetGroup = cardChunks[currentGroupIdx] || cards.slice(0, 5);
      const generated = await generatePassagesWithAI(
        targetGroup,
        currentGroupIdx,
        cardChunks.length,
        aiSettings
      );
      setPassage(generated);
      setIsSubmitted(false);
      setUserAnswers({});
    } catch (err: any) {
      setErrorMsg(err.message || 'AI 文章生成失敗');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSelectOption = (blankIndex: number, option: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [blankIndex]: option,
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (!passage || passage.blanks.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center liquid-glass rounded-3xl p-8 my-10 shadow-lg">
        <p className="text-slate-600 font-medium">題庫單字不足，無法生成文章測驗。</p>
      </div>
    );
  }

  const correctCount = passage.blanks.filter(
    (b) => userAnswers[b.blankIndex]?.toLowerCase() === b.correctAnswer.toLowerCase()
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 標題與篇章切換 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/5">
        <div>
          <h2 className="text-2xl font-black text-[#0a192f] tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#0a192f]" />
            <span>{passage.title}</span>
          </h2>
          <div className="text-xs text-slate-500 font-medium mt-1">
            單字庫共有 {cards.length} 個字，已自動拆分為 {cardChunks.length} 個連貫短文篇章
          </div>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={isLoadingAI}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-xs shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isLoadingAI ? 'AI 節省生成中...' : 'AI 生成此篇'}</span>
        </button>
      </div>

      {/* 篇章 Tab 切換 */}
      {cardChunks.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {cardChunks.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSwitchGroup(i)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                currentGroupIdx === i
                  ? 'bg-[#0a192f] text-white shadow-sm'
                  : 'liquid-glass liquid-glass-hover text-[#0a192f]'
              }`}
            >
              文章 {i + 1}
            </button>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
          {errorMsg}
        </div>
      )}

      {/* 文章正文 (液態毛玻璃卡片) */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-10 shadow-xl border border-white/60">
        <div className="text-base sm:text-lg leading-loose text-slate-800 font-serif">
          {passage.passageSegments.map((segment, idx) => {
            if (segment.blankIndex) {
              const bIdx = segment.blankIndex;
              const choice = userAnswers[bIdx];
              const blankObj = passage.blanks.find((b) => b.blankIndex === bIdx);
              const isCorrect = choice?.toLowerCase() === blankObj?.correctAnswer.toLowerCase();

              let badgeCls = 'border-b-2 border-[#0a192f] bg-white/60 text-[#0a192f] font-sans font-bold';
              if (isSubmitted) {
                badgeCls = isCorrect
                  ? 'bg-emerald-600 text-white font-sans font-bold shadow-sm'
                  : 'bg-rose-500/20 text-rose-800 line-through font-sans font-bold';
              }

              return (
                <span key={idx} className={`inline-block mx-1 px-2.5 py-0.5 rounded-lg ${badgeCls}`}>
                  ({bIdx}) {choice || '________'}
                  {isSubmitted && !isCorrect && (
                    <span className="ml-1.5 text-xs text-emerald-700 no-underline font-semibold">
                      [{blankObj?.correctAnswer}]
                    </span>
                  )}
                </span>
              );
            }
            return <span key={idx}>{segment.text}</span>;
          })}
        </div>

        {passage.fullTranslation && isSubmitted && (
          <div className="mt-6 pt-5 border-t border-black/5 text-xs text-slate-600 font-sans leading-relaxed">
            <span className="font-bold text-[#0a192f] block mb-1">篇章中文對照：</span>
            <p>{passage.fullTranslation}</p>
          </div>
        )}
      </div>

      {/* 選項作答區 */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl border border-white/60">
        <h3 className="text-sm font-bold text-[#0a192f]">作答區 (點選對應選項)：</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {passage.blanks.map((b) => (
            <div key={b.blankIndex} className="p-3.5 rounded-2xl bg-white/60 border border-black/5">
              <div className="text-xs font-bold text-[#0a192f] mb-2">空格 ({b.blankIndex})</div>
              <div className="grid grid-cols-2 gap-1.5">
                {b.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[b.blankIndex] === opt;
                  let btnCls = 'liquid-glass liquid-glass-hover text-[#0a192f] font-medium';
                  if (isSelected) btnCls = 'bg-[#0a192f] text-white font-bold shadow-sm';
                  if (isSubmitted) {
                    if (opt.toLowerCase() === b.correctAnswer.toLowerCase()) {
                      btnCls = 'bg-emerald-600 text-white font-bold shadow-sm';
                    } else if (isSelected && opt.toLowerCase() !== b.correctAnswer.toLowerCase()) {
                      btnCls = 'bg-rose-500/20 text-rose-800 line-through';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(b.blankIndex, opt)}
                      className={`py-2 px-3 rounded-xl text-xs transition ${btnCls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-semibold text-slate-600">
          {isSubmitted
            ? `批改結果：答對 ${correctCount} / ${passage.blanks.length} 題 (${Math.round((correctCount / passage.blanks.length) * 100)}分)`
            : `已填答 ${Object.keys(userAnswers).length} / ${passage.blanks.length} 空`}
        </div>

        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(userAnswers).length < passage.blanks.length}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>提交整篇批改</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setIsSubmitted(false);
              setUserAnswers({});
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl liquid-glass liquid-glass-hover text-[#0a192f] font-bold text-sm shadow-md transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重做此篇</span>
          </button>
        )}
      </div>
    </div>
  );
};
