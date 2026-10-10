import { useState, useEffect } from 'react';
import { Flame, Layers, BookOpen, CheckCircle, Award, Plus, Globe } from 'lucide-react';
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

  const [hybridQuestions, setHybridQuestions] = useState<HybridQuizQuestion[]>(() =>
    generateLocalHybridQuestions(deck.cards, 8)
  );
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

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

  const masteredCount = deck.cards.filter((c) => c.mastered).length;

  return (
    <div className="min-h-screen bg-slate-50 text-black flex flex-col selection:bg-slate-200 selection:text-black relative">
      {/* 4 顆彩色毛玻璃環境光光暈 (Vocabulum 標誌性光效) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-sky-200/45 blur-3xl"></div>
        <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-emerald-100/45 blur-3xl"></div>
        <div className="absolute top-2/3 left-10 w-64 h-64 rounded-full bg-violet-100/35 blur-3xl"></div>
      </div>

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Vocabulum 主橫幅 Header Banner */}
        <div className="liquid-glass liquid-glass-hover rounded-3xl p-6 sm:p-10 shadow-lg border border-white/60">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl sm:text-5xl text-[#0a192f] tracking-tight leading-tight font-black">
              {deck.title}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              {deck.description || '精心編排的雙語語境單字庫，結合 3D 翻卡、AI 篇章克漏字與即時評測。'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setMode('deck-editor')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0a192f] hover:bg-[#132c5b] text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add words / 編輯單字</span>
              </button>
              <button
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl liquid-glass liquid-glass-hover text-[#0a192f] font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
              >
                <Globe className="w-4 h-4 text-[#0a192f]" />
                <span>Share deck / 分享題庫</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5 欄數據統計卡片 (Vocabulum 統計區塊) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="liquid-glass liquid-glass-hover p-5 rounded-2xl space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-bold">Daily Streak</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#0a192f]">1</span>
          </div>

          <div className="liquid-glass liquid-glass-hover p-5 rounded-2xl space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-bold">Total decks</span>
              <Layers className="w-4 h-4 text-[#0a192f]" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#0a192f]">1</span>
          </div>

          <div className="liquid-glass liquid-glass-hover p-5 rounded-2xl space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-bold">Total words</span>
              <BookOpen className="w-4 h-4 text-[#0a192f]" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#0a192f]">{deck.cards.length}</span>
          </div>

          <div className="liquid-glass liquid-glass-hover p-5 rounded-2xl space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-bold">Mastered</span>
              <CheckCircle className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{masteredCount}</span>
          </div>

          <div className="liquid-glass liquid-glass-hover p-5 rounded-2xl space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-bold">Review Needed</span>
              <Award className="w-4 h-4 text-[#0a192f]" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#0a192f]">
              {deck.cards.length - masteredCount}
            </span>
          </div>
        </div>

        {/* 模式主畫面 */}
        <div className="pt-2">
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
        </div>
      </main>

      {/* Vocabulum 底部 Footer */}
      <footer className="liquid-glass border-0 border-t border-white/40 py-6 text-center text-xs text-slate-500 mt-auto">
        <p>© 2026 Vocabulum • Vocabulary Learning Studio</p>
      </footer>

      {/* 彈窗 */}
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
