import { Deck } from '../types';

export const defaultDeck: Deck = {
  id: 'deck-default',
  title: '實用核心英語字彙集',
  description: '日常與職場高頻使用單字',
  createdAt: Date.now(),
  cards: [
    {
      id: 'c1',
      term: 'implement',
      definition: '實施、執行',
      exampleSentence: 'The team will implement the new strategy tomorrow.',
      mastered: false,
    },
    {
      id: 'c2',
      term: 'collaborate',
      definition: '合作、協同工作',
      exampleSentence: 'We need to collaborate with other teams to finish the project.',
      mastered: false,
    },
    {
      id: 'c3',
      term: 'innovative',
      definition: '創新的',
      exampleSentence: 'She proposed an innovative approach to solve the problem.',
      mastered: false,
    },
    {
      id: 'c4',
      term: 'feasible',
      definition: '切實可行的',
      exampleSentence: 'The plan is feasible and within our budget.',
      mastered: false,
    },
    {
      id: 'c5',
      term: 'perspective',
      definition: '觀點、視角',
      exampleSentence: 'Try to see the situation from a different perspective.',
      mastered: false,
    },
    {
      id: 'c6',
      term: 'optimize',
      definition: '優化、使完善',
      exampleSentence: 'We should optimize the website to make it faster.',
      mastered: false,
    },
    {
      id: 'c7',
      term: 'substantial',
      definition: '大量的、實質的',
      exampleSentence: 'They made substantial progress this week.',
      mastered: false,
    },
    {
      id: 'c8',
      term: 'negotiate',
      definition: '談判、協商',
      exampleSentence: 'They will negotiate the contract terms next Monday.',
      mastered: false,
    },
    {
      id: 'c9',
      term: 'efficient',
      definition: '有效率的',
      exampleSentence: 'This tool makes our workflow much more efficient.',
      mastered: false,
    },
    {
      id: 'c10',
      term: 'objective',
      definition: '目標、客觀的',
      exampleSentence: 'Our main objective is to satisfy customers.',
      mastered: false,
    }
  ]
};
