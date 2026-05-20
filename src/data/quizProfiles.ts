// src/data/quizProfiles.ts
import { affiliates } from './affiliates';

export interface QuizProfile {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  recommendedModels: string[];
  affiliateKey: keyof typeof affiliates;
  affiliateCTA: string;
}

export const profiles: QuizProfile[] = [
  {
    slug: 'creative-writer',
    title: 'The Creative Writer',
    emoji: '✍️',
    description: 'You want AI for storytelling, brainstorming, and creative work. Best for: fluid conversation, imaginative output.',
    recommendedModels: ['mistral-7b', 'gemma3-12b', 'llama-4-scout'],
    affiliateKey: 'pluralsight',
    affiliateCTA: 'Level up with AI writing courses →',
  },
  {
    slug: 'coder',
    title: 'The Developer',
    emoji: '💻',
    description: 'You want AI for code completion, debugging, and documentation. Best for: precise, technical output.',
    recommendedModels: ['qwen3-8b', 'phi-4', 'deepseek-r2'],
    affiliateKey: 'pluralsight',
    affiliateCTA: 'Learn AI-assisted coding on Pluralsight →',
  },
  {
    slug: 'researcher',
    title: 'The Researcher',
    emoji: '🔬',
    description: 'You want AI for analysis, summarization, and deep Q&A. Best for: factual accuracy and reasoning.',
    recommendedModels: ['llama-4-maverick', 'deepseek-r2', 'gemma3-27b'],
    affiliateKey: 'runpod',
    affiliateCTA: 'Run large research models on RunPod →',
  },
  {
    slug: 'casual-chatter',
    title: 'The Everyday AI User',
    emoji: '💬',
    description: 'You want a smart assistant for daily questions, summaries, and general help. Best for: ease of use.',
    recommendedModels: ['phi-4-mini', 'mistral-7b', 'qwen3-8b'],
    affiliateKey: 'amazon_gpu',
    affiliateCTA: 'Upgrade your GPU for smoother AI →',
  },
  {
    slug: 'cloud-user',
    title: 'The Cloud Runner',
    emoji: '☁️',
    description: 'You prefer cloud GPU power without hardware investment. Best for: maximum model quality.',
    recommendedModels: ['llama-4-maverick', 'deepseek-r2', 'gemma3-27b'],
    affiliateKey: 'runpod',
    affiliateCTA: 'Start running LLMs on RunPod →',
  },
];

export function getProfileFromAnswers(useCase: string, budget: string, _techLevel: string): string {
  if (budget === 'cloud') return 'cloud-user';
  if (useCase === 'coding') return 'coder';
  if (useCase === 'creative') return 'creative-writer';
  if (useCase === 'research') return 'researcher';
  return 'casual-chatter';
}

export function getProfileBySlug(slug: string): QuizProfile | undefined {
  return profiles.find(p => p.slug === slug);
}
