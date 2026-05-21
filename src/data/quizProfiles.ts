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
    description: 'You want AI for storytelling, brainstorming, and creative work. Best for: fluid conversation and imaginative output.',
    recommendedModels: ['mistral-7b', 'gemma3-12b', 'qwen3-8b', 'llama3.2-3b'],
    affiliateKey: 'pluralsight',
    affiliateCTA: 'Level up with AI writing courses →',
  },
  {
    slug: 'coder',
    title: 'The Developer',
    emoji: '💻',
    description: 'You want AI for code completion, debugging, and documentation. Best for: precise, technical output.',
    recommendedModels: ['qwen2.5-coder-14b', 'deepseek-r1-14b', 'qwen2.5-coder-7b', 'deepseek-r1-7b'],
    affiliateKey: 'pluralsight',
    affiliateCTA: 'Learn AI-assisted coding on Pluralsight →',
  },
  {
    slug: 'researcher',
    title: 'The Researcher',
    emoji: '🔬',
    description: 'You want AI for analysis, summarization, and deep Q&A. Best for: factual accuracy and reasoning.',
    recommendedModels: ['deepseek-r1-32b', 'qwen3-32b', 'deepseek-r1-14b', 'gemma3-27b'],
    affiliateKey: 'runpod',
    affiliateCTA: 'Run larger research models on RunPod →',
  },
  {
    slug: 'casual-chatter',
    title: 'The Everyday AI User',
    emoji: '💬',
    description: 'You want a smart assistant for daily questions, summaries, and general help. Best for: ease of use.',
    recommendedModels: ['llama3.2-3b', 'phi3.5', 'qwen3-4b', 'mistral-7b'],
    affiliateKey: 'amazon_gpu',
    affiliateCTA: 'Upgrade your GPU for smoother AI →',
  },
  {
    slug: 'cloud-user',
    title: 'The Cloud Runner',
    emoji: '☁️',
    description: 'You prefer cloud GPU power without hardware investment. Best for: maximum model quality.',
    recommendedModels: ['llama3.3-70b', 'deepseek-r1-70b', 'qwen2.5-72b', 'qwen3-32b'],
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
  return profiles.find((profile) => profile.slug === slug);
}
