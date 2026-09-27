import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FlashcardView } from './components/FlashcardView';
import { HybridQuiz } from './components/HybridQuiz';
import { ClozePassage } from './components/ClozePassage';
import { DeckEditor } from './components/DeckEditor';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { defaultDeck } from './data/defaultDeck';
import { Deck, StudyMode, HybridQuizQuestion } from './types';
import { generateLocalHybridQuestions } from './services/generator';
import { generateHybridQuestionsWithAI, AISettings } from './services/aiService';
import { SupabaseConfig, fetchDeckFromSupabase, decodeDeckFromURL } from './services/supabase';

export function App() {
  const [deck, setDeck] = useState<Deck>(() => {
    const saved = localStorage.getItem('context_quiz_deck');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultDeck;
  });

  const [mode, setMode] = useState<StudyMode>('flashcards');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem('context_quiz_supabase');
    return saved ? JSON.parse(saved) : { url: '', anonKey: '' };
  });

  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('context_quiz_ai');
    return saved ? JSON.parse(saved) : { apiKey: '', model: 'gemini-2.0-flash' };
  });

  // 選擇填空合一題目狀態
  const [hybridQuestions, setHybridQuestions] = useState<HybridQuizQuestion[]>(() =>
    generateLocalHybridQuestions(deck.cards, 8)
  );
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // 重新載入題庫
  const handleUpdateDeck = (newDeck: Deck) => {
    setDeck(newDeck);
    localStorage.setItem('context_quiz_deck', JSON.stringify(newDeck));
    setHybridQuestions(generateLocalHybridQuestions(newDeck.cards, 8));
  };

  const handleToggleMastered = (id: string) => {
    const updatedCards = deck.cards.map((c) =>
      c.id === id ? { ...c, mastered: !c.mastered } : c
    );
    handleUpdateDeck({ ...deck, cards: updatedCards });
  };

  // 重新生成選擇填空題（若有 AI Key 則使用 AI 節省模式生成情境句子與選項）
  const handleRestartQuiz = async () => {
    if (aiSettings.apiKey.trim()) {
      setIsLoadingQuiz(true);
      try {
        const aiQuestions = await generateHybridQuestionsWithAI(deck.cards, aiSettings, 6);
        setHybridQuestions(aiQuestions);
      } catch (e) {
        setHybridQuestions(generateLocalHybridQuestions(deck.cards, 8));
      } finally {
        setIsLoadingQuiz(false);
      }
    } else {
      setHybridQuestions(generateLocalHybridQuestions(deck.cards, 8));
    }
  };

  const handleSaveSupabaseConfig = (cfg: SupabaseConfig) => {
    setSupabaseConfig(cfg);
    localStorage.setItem('context_quiz_supabase', JSON.stringify(cfg));
  };

  const handleSaveAISettings = (ai: AISettings) => {
    setAiSettings(ai);
    localStorage.setItem('context_quiz_ai', JSON.stringify(ai));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const deckParam = params.get('deck');

    if (code && supabaseConfig.url && supabaseConfig.anonKey) {
      fetchDeckFromSupabase(code, supabaseConfig).then((res) => {
        if (res.deck) {
          handleUpdateDeck(res.deck);
          alert(`已載入題庫：「${res.deck.title}」`);
        }
      });
    } else if (deckParam) {
      const decoded = decodeDeckFromURL(deckParam);
      if (decoded) {
        handleUpdateDeck(decoded);
        alert(`已載入題庫：「${decoded.title}」`);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <Navbar
        currentMode={mode}
        onSelectMode={(m) => {
          setMode(m);
          if (m === 'hybrid-quiz') {
            handleRestartQuiz();
          }
        }}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        cardCount={deck.cards.length}
      />

      {/* 標題列 */}
      <div className="max-w-5xl mx-auto px-4 py-4 w-full flex items-center justify-between border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{deck.title}</h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">{deck.description}</p>
        </div>
        <div className="text-xs font-mono text-neutral-500">
          已掌握：{deck.cards.filter((c) => c.mastered).length} / {deck.cards.length}
        </div>
      </div>

      {/* 主視圖 */}
      <main className="flex-1 w-full pb-12">
        {mode === 'flashcards' && (
          <FlashcardView cards={deck.cards} onToggleMastered={handleToggleMastered} />
        )}

        {mode === 'hybrid-quiz' && (
          <HybridQuiz
            questions={hybridQuestions}
            onRestart={handleRestartQuiz}
            isLoading={isLoadingQuiz}
          />
        )}

        {mode === 'cloze-passage' && (
          <ClozePassage cards={deck.cards} aiSettings={aiSettings} />
        )}

        {mode === 'deck-editor' && (
          <DeckEditor deck={deck} onUpdateDeck={handleUpdateDeck} />
        )}
      </main>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        currentDeck={deck}
        onLoadDeck={handleUpdateDeck}
        supabaseConfig={supabaseConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        supabaseConfig={supabaseConfig}
        onSaveSupabaseConfig={handleSaveSupabaseConfig}
        aiSettings={aiSettings}
        onSaveAISettings={handleSaveAISettings}
      />
    </div>
  );
}

export default App;
