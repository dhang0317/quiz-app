export interface Flashcard {
  id: string;
  term: string;          // 單字或短語
  definition: string;    // 中文定義
  partOfSpeech?: string; // 詞性 (可選)
  phonetic?: string;     // 音標 (可選)
  exampleSentence?: string; // 例句 (可選，沒填也能使用)
  exampleTranslation?: string; // 翻譯 (可選)
  mastered?: boolean;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  createdAt: number;
}

// 選擇與填空合一題目型別 (Hybrid Question)
export interface HybridQuizQuestion {
  id: string;
  targetCardId: string;
  term: string;
  definition: string;
  contextSentence: string;      // 包含填空的完整例句或題目
  sentenceBefore: string;       // 空格前
  sentenceAfter: string;        // 空格後
  options: string[];            // 4個選項供點選（若使用者想用選的）
  correctAnswer: string;
  explanation?: string;
}

// 文章克漏字題目型別
export interface ClozePassageQuestion {
  id: string;
  title: string;
  passageSegments: {
    text?: string;
    blankIndex?: number;
    targetCardId?: string;
    correctAnswer?: string;
  }[];
  blanks: {
    blankIndex: number;
    targetCardId: string;
    correctAnswer: string;
    options: string[];
  }[];
  fullTranslation?: string;
}

export type StudyMode = 'flashcards' | 'hybrid-quiz' | 'cloze-passage' | 'deck-editor';
