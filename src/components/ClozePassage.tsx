import React, { useState } from 'react';
import { ClozePassageQuestion, Flashcard } from '../types';
import { chunkCards, generatePassagesWithAI, AISettings } from '../services/aiService';
import { generateLocalClozePassage } from '../services/generator';

interface ClozePassageProps {
  cards: Flashcard[];
  aiSettings: AISettings;
}

export const ClozePassage: React.FC<ClozePassageProps> = ({ cards, aiSettings }) => {
  // 將單字切成多個群組（每組 4-5 個單字），單字過多時分成多篇文章
  const cardChunks = chunkCards(cards, 5);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);

  const [passage, setPassage] = useState<ClozePassageQuestion | null>(() => {
    return generateLocalClozePassage(cardChunks[0] || cards, 0, cardChunks.length);
  });

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 切換文章篇章
  const handleSwitchGroup = (idx: number) => {
    setCurrentGroupIdx(idx);
    setIsSubmitted(false);
    setUserAnswers({});
    setErrorMsg(null);
    const newPassage = generateLocalClozePassage(cardChunks[idx] || cards, idx, cardChunks.length);
    setPassage(newPassage);
  };

  // 使用 AI 節省模式生成此組文章
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
      <div className="max-w-md mx-auto py-16 text-center border border-black p-8 my-10 font-mono">
        <p>題庫單字不足，無法生成文章測驗。</p>
      </div>
    );
  }

  const correctCount = passage.blanks.filter(
    (b) => userAnswers[b.blankIndex]?.toLowerCase() === b.correctAnswer.toLowerCase()
  ).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 頂部切換多篇文章 (若單字過多時切分) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black pb-3 mb-6 gap-2">
        <div>
          <h2 className="text-xl font-bold">{passage.title}</h2>
          <div className="text-xs font-mono text-neutral-500 mt-1">
            單字量共 {cards.length} 個，已切分為 {cardChunks.length} 個篇章
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleGenerateAI}
            disabled={isLoadingAI}
            className="px-3 py-1.5 border border-black text-xs font-mono hover:bg-black hover:text-white transition disabled:opacity-40"
          >
            {isLoadingAI ? 'AI 節省生成中...' : 'AI 生成此篇'}
          </button>
        </div>
      </div>

      {/* 篇章選擇分頁標籤 */}
      {cardChunks.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-6">
          {cardChunks.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSwitchGroup(i)}
              className={`px-3 py-1 text-xs font-mono border transition ${
                currentGroupIdx === i
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-white text-black border-neutral-300 hover:border-black'
              }`}
            >
              文章 {i + 1}
            </button>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="border border-black p-3 mb-6 text-xs font-mono bg-neutral-100">
          {errorMsg}
        </div>
      )}

      {/* 文章正文 (純文字挖空，無彩色提示) */}
      <div className="border-2 border-black p-6 sm:p-8 bg-white mb-6">
        <div className="text-base sm:text-lg leading-loose font-serif">
          {passage.passageSegments.map((segment, idx) => {
            if (segment.blankIndex) {
              const bIdx = segment.blankIndex;
              const choice = userAnswers[bIdx];
              const blankObj = passage.blanks.find((b) => b.blankIndex === bIdx);
              const isCorrect = choice?.toLowerCase() === blankObj?.correctAnswer.toLowerCase();

              let borderStyle = 'border-b-2 border-black font-sans px-2 font-bold';
              if (isSubmitted) {
                borderStyle = isCorrect
                  ? 'border-2 border-black bg-black text-white px-2 font-sans'
                  : 'border-2 border-black line-through bg-neutral-200 px-2 font-sans';
              }

              return (
                <span key={idx} className={`inline-block mx-1 ${borderStyle}`}>
                  ({bIdx}) {choice || '________'}
                  {isSubmitted && !isCorrect && (
                    <span className="ml-1 no-underline font-normal text-xs text-neutral-600">
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
          <div className="mt-6 pt-4 border-t border-neutral-300 text-xs text-neutral-600 font-sans">
            <span className="font-bold">中文對照：</span>
            <p className="mt-1">{passage.fullTranslation}</p>
          </div>
        )}
      </div>

      {/* 挖空選題區 (無贅言提示) */}
      <div className="border-2 border-black p-6 bg-white mb-6 space-y-4">
        <div className="text-sm font-bold font-mono">作答區 (點選對應選項)：</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {passage.blanks.map((b) => (
            <div key={b.blankIndex} className="border border-neutral-300 p-3">
              <div className="text-xs font-mono font-bold mb-2">空格 ({b.blankIndex})</div>
              <div className="grid grid-cols-2 gap-1.5">
                {b.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[b.blankIndex] === opt;
                  let btnCls = 'border border-black hover:bg-neutral-100 text-xs font-mono';
                  if (isSelected) btnCls = 'border-2 border-black bg-black text-white font-bold text-xs font-mono';
                  if (isSubmitted) {
                    if (opt === b.correctAnswer) {
                      btnCls = 'border-2 border-black bg-black text-white font-bold text-xs font-mono';
                    } else if (isSelected && opt !== b.correctAnswer) {
                      btnCls = 'border border-black bg-neutral-200 line-through text-xs font-mono';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(b.blankIndex, opt)}
                      className={`py-1.5 px-2 transition ${btnCls}`}
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

      {/* 批改與結果 */}
      <div className="flex items-center justify-between border-t border-black pt-4">
        <div className="font-mono text-sm">
          {isSubmitted
            ? `批改結果：答對 ${correctCount} / ${passage.blanks.length} 題`
            : `已填答 ${Object.keys(userAnswers).length} / ${passage.blanks.length} 空`}
        </div>

        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(userAnswers).length < passage.blanks.length}
            className="px-6 py-2 border-2 border-black font-bold bg-black text-white hover:bg-neutral-800 transition disabled:opacity-30"
          >
            提交批改
          </button>
        ) : (
          <button
            onClick={() => {
              setIsSubmitted(false);
              setUserAnswers({});
            }}
            className="px-6 py-2 border border-black font-medium hover:bg-black hover:text-white transition"
          >
            重做此篇
          </button>
        )}
      </div>
    </div>
  );
};
