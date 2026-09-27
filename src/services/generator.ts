import { Flashcard, ClozePassageQuestion, HybridQuizQuestion } from '../types';
import { corpusBank } from '../data/corpusBank';

// 工具：打亂陣列
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 選擇與填空合一本地題目生成
export function generateLocalHybridQuestions(cards: Flashcard[], count: number = 10): HybridQuizQuestion[] {
  if (cards.length === 0) return [];
  const selectedCards = shuffleArray(cards).slice(0, Math.min(count, cards.length));

  return selectedCards.map((card, idx) => {
    const sentence = card.exampleSentence || `We must consider how to ${card.term} in this situation.`;
    const parts = sentence.split(new RegExp(`\\b${card.term}\\b`, 'i'));
    const before = parts[0] || '';
    const after = parts.slice(1).join(card.term) || '';

    const otherWords = cards
      .filter((c) => c.id !== card.id)
      .map((c) => c.term);
    const distractors = shuffleArray(otherWords).slice(0, 3);
    const options = shuffleArray([card.term, ...distractors]);

    return {
      id: `local-h-${card.id}-${idx}`,
      targetCardId: card.id,
      term: card.term,
      definition: card.definition,
      contextSentence: sentence,
      sentenceBefore: before,
      sentenceAfter: after,
      options,
      correctAnswer: card.term,
    };
  });
}

// 離線生成文章克漏字
export function generateLocalClozePassage(cards: Flashcard[], groupIndex: number = 0, totalGroups: number = 1): ClozePassageQuestion | null {
  if (cards.length === 0) return null;
  const template = corpusBank[groupIndex % corpusBank.length];

  const matchedCards = cards.filter((c) => new RegExp(`\\b${c.term}\\b`, 'i').test(template.text));
  const targetCards = matchedCards.length > 0 ? matchedCards : cards.slice(0, 5);

  const rawText = template.text;
  const positions: { start: number; end: number; word: string; card: Flashcard }[] = [];

  targetCards.forEach((card) => {
    const reg = new RegExp(`\\b(${card.term})\\b`, 'gi');
    let m = reg.exec(rawText);
    if (m) {
      positions.push({
        start: m.index,
        end: m.index + m[0].length,
        word: m[0],
        card,
      });
    }
  });

  positions.sort((a, b) => a.start - b.start);

  const segments: ClozePassageQuestion['passageSegments'] = [];
  const blanks: ClozePassageQuestion['blanks'] = [];
  let currentIdx = 0;

  positions.forEach((pos, i) => {
    const blankNumber = i + 1;
    if (pos.start > currentIdx) {
      segments.push({ text: rawText.substring(currentIdx, pos.start) });
    }
    segments.push({
      blankIndex: blankNumber,
      targetCardId: pos.card.id,
      correctAnswer: pos.word,
    });

    const otherWords = cards.filter((c) => c.id !== pos.card.id).map((c) => c.term);
    const distractors = shuffleArray(otherWords).slice(0, 3);
    const options = shuffleArray([pos.word, ...distractors]);

    blanks.push({
      blankIndex: blankNumber,
      targetCardId: pos.card.id,
      correctAnswer: pos.word,
      options,
    });
    currentIdx = pos.end;
  });

  if (currentIdx < rawText.length) {
    segments.push({ text: rawText.substring(currentIdx) });
  }

  const titlePrefix = totalGroups > 1 ? `文章 (${groupIndex + 1}/${totalGroups})：` : '';

  return {
    id: `local-cloze-${Date.now()}-${groupIndex}`,
    title: `${titlePrefix}${template.title}`,
    passageSegments: segments,
    blanks,
    fullTranslation: template.translation,
  };
}
