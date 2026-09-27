import { Flashcard, ClozePassageQuestion, HybridQuizQuestion } from '../types';

export interface AISettings {
  apiKey: string;
  model: string;
}

// 快速獲取可用模型
export async function getAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        return data.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''));
      }
    }
  } catch (e) {
    console.error('查詢可用模型失敗', e);
  }
  return [];
}

// 核心通用 AI 呼叫（節省模式：maxOutputTokens 限制、低溫度、無贅字）
async function callGeminiRaw(
  apiKey: string,
  preferredModel: string,
  prompt: string,
  maxTokens: number = 800
): Promise<string> {
  const dynamicModels = await getAvailableModels(apiKey);
  const modelsToTry = Array.from(
    new Set([
      preferredModel,
      ...dynamicModels.filter((m) => m.includes('flash')),
      ...dynamicModels,
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
    ])
  ).filter(Boolean);

  let lastError = '';
  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3, // 節省計算量與維持穩定
            maxOutputTokens: maxTokens, // 嚴格控制輸出長度省 token
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = errJson.error?.message || response.statusText;
      }
    } catch (e: any) {
      lastError = e.message || '連線錯誤';
    }
  }
  throw new Error(`AI 調用失敗: ${lastError}。請檢查 API Key 是否正確。`);
}

// 工具：安全擷取 JSON
function extractJson(raw: string): any {
  let text = raw.trim();
  if (text.includes('```json')) {
    text = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    text = text.split('```')[1].split('```')[0].trim();
  }
  return JSON.parse(text);
}

// 1. AI 生成選擇填空合一題目（一次性批量生成，省 Token）
export async function generateHybridQuestionsWithAI(
  cards: Flashcard[],
  settings: AISettings,
  count: number = 5
): Promise<HybridQuizQuestion[]> {
  const apiKey = settings.apiKey.trim();
  const selectedCards = cards.slice(0, count);
  const termsList = selectedCards.map((c) => `${c.term}: ${c.definition}`).join('\n');

  if (apiKey) {
    try {
      const prompt = `為以下英文單字分別產生 1 個英文情境填空句。
單字：
${termsList}

請以 JSON 陣列格式輸出，不要多餘贅字：
[
  {
    "term": "單字",
    "sentence": "包含該單字的英文句子，該單字不要空格",
    "distractors": ["干擾字1", "干擾字2", "干擾字3"]
  }
]`;

      const raw = await callGeminiRaw(apiKey, settings.model || 'gemini-2.0-flash', prompt, 700);
      const list = extractJson(raw);

      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any, idx: number) => {
          const matchedCard = cards.find((c) => c.term.toLowerCase() === item.term.toLowerCase()) || cards[idx % cards.length];
          const term = matchedCard.term;
          const sentence = item.sentence || `${term} is important.`;
          const parts = sentence.split(new RegExp(`\\b${term}\\b`, 'i'));
          const before = parts[0] || '';
          const after = parts.slice(1).join(term) || '';
          const distractors = Array.isArray(item.distractors) && item.distractors.length >= 3
            ? item.distractors.slice(0, 3)
            : cards.filter((c) => c.id !== matchedCard.id).map((c) => c.term).slice(0, 3);

          const options = [term, ...distractors].sort(() => 0.5 - Math.random());

          return {
            id: `ai-hybrid-${matchedCard.id}-${idx}`,
            targetCardId: matchedCard.id,
            term: matchedCard.term,
            definition: matchedCard.definition,
            contextSentence: sentence,
            sentenceBefore: before,
            sentenceAfter: after,
            options,
            correctAnswer: term,
          };
        });
      }
    } catch (e) {
      console.warn('AI 出題失敗，自動切換為本地省流演算法', e);
    }
  }

  // 本地免 AI 備援模式
  return selectedCards.map((card, idx) => {
    const fallbackSentence = card.exampleSentence || `We need to ${card.term} in this situation.`;
    const parts = fallbackSentence.split(new RegExp(`\\b${card.term}\\b`, 'i'));
    const otherWords = cards.filter((c) => c.id !== card.id).map((c) => c.term).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [card.term, ...otherWords].sort(() => 0.5 - Math.random());

    return {
      id: `local-hybrid-${card.id}-${idx}`,
      targetCardId: card.id,
      term: card.term,
      definition: card.definition,
      contextSentence: fallbackSentence,
      sentenceBefore: parts[0] || '',
      sentenceAfter: parts.slice(1).join(card.term) || '',
      options,
      correctAnswer: card.term,
    };
  });
}

// 2. 將過多的單字切分成多個群組（每組 4-6 個字），避免文章過長或混亂
export function chunkCards(cards: Flashcard[], size: number = 5): Flashcard[][] {
  const chunks: Flashcard[][] = [];
  for (let i = 0; i < cards.length; i += size) {
    chunks.push(cards.slice(i, i + size));
  }
  return chunks;
}

// 3. AI 生成多篇短文克漏字（支援切分多篇文章、節省模式）
export async function generatePassagesWithAI(
  cardGroup: Flashcard[],
  groupIndex: number,
  totalGroups: number,
  settings: AISettings
): Promise<ClozePassageQuestion> {
  const apiKey = settings.apiKey.trim();
  const termsList = cardGroup.map((c) => c.term).join(', ');

  if (!apiKey) {
    throw new Error('請先輸入 API Key');
  }

  const prompt = `以嚴格 JSON 格式輸出一段約 80-120 字的簡短英文短文，自然使用這些單字：${termsList}。
格式：
{
  "title": "文章標題",
  "content": "英文短文內容",
  "translation": "繁體中文翻譯"
}`;

  const raw = await callGeminiRaw(apiKey, settings.model || 'gemini-2.0-flash', prompt, 500);
  const parsed = extractJson(raw);

  const title = totalGroups > 1 ? `文章 (${groupIndex + 1}/${totalGroups})：${parsed.title || '主題短文'}` : parsed.title || '主題短文';
  const content = parsed.content || '';
  const translation = parsed.translation || '';

  // 動態挖空
  const positions: { start: number; end: number; word: string; card: Flashcard }[] = [];
  cardGroup.forEach((card) => {
    const reg = new RegExp(`\\b(${card.term})\\b`, 'gi');
    let m = reg.exec(content);
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
      segments.push({ text: content.substring(currentIdx, pos.start) });
    }
    segments.push({
      blankIndex: blankNumber,
      targetCardId: pos.card.id,
      correctAnswer: pos.word,
    });

    const otherWords = cardGroup.filter((c) => c.id !== pos.card.id).map((c) => c.term);
    const distractors = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [pos.word, ...distractors].sort(() => 0.5 - Math.random());

    blanks.push({
      blankIndex: blankNumber,
      targetCardId: pos.card.id,
      correctAnswer: pos.word,
      options,
    });
    currentIdx = pos.end;
  });

  if (currentIdx < content.length) {
    segments.push({ text: content.substring(currentIdx) });
  }

  return {
    id: `passage-${Date.now()}-${groupIndex}`,
    title,
    passageSegments: segments,
    blanks,
    fullTranslation: translation,
  };
}
