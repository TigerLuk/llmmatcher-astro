// src/data/models.ts
export interface LLMModel {
  slug: string;
  name: string;
  family: string;
  minVram: number;      // GB needed for q4 quantization
  fullVram: number;     // GB needed for full fp16
  params: string;       // e.g. "8B", "70B"
  tags: string[];       // use cases: coding, chat, creative, research
  ollamaCmd: string;
  description: string;
  affiliateTier: 'beginner' | 'mid' | 'high';
}

export const models: LLMModel[] = [
  {
    slug: 'llama-4-scout',
    name: 'Llama 4 Scout',
    family: 'Llama 4',
    minVram: 8, fullVram: 16,
    params: '17B MoE',
    tags: ['chat', 'coding', 'research'],
    ollamaCmd: 'ollama run llama4:scout',
    description: "Meta's latest MoE model, excellent all-rounder for 8GB VRAM.",
    affiliateTier: 'mid',
  },
  {
    slug: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    family: 'Llama 4',
    minVram: 24, fullVram: 48,
    params: '400B MoE',
    tags: ['chat', 'coding', 'research', 'creative'],
    ollamaCmd: 'ollama run llama4:maverick',
    description: "Llama 4's larger model, rivals GPT-4o. Needs 24GB+ VRAM.",
    affiliateTier: 'high',
  },
  {
    slug: 'deepseek-r2',
    name: 'DeepSeek R2',
    family: 'DeepSeek',
    minVram: 16, fullVram: 32,
    params: '236B MoE',
    tags: ['coding', 'research', 'reasoning'],
    ollamaCmd: 'ollama run deepseek-r2',
    description: 'Top reasoning model from DeepSeek. Best for coding and math.',
    affiliateTier: 'high',
  },
  {
    slug: 'qwen3-30b',
    name: 'Qwen3 30B A3B',
    family: 'Qwen3',
    minVram: 8, fullVram: 20,
    params: '30B MoE',
    tags: ['chat', 'coding', 'multilingual'],
    ollamaCmd: 'ollama run qwen3:30b-a3b',
    description: "Alibaba's Qwen3 MoE, great balance of size and performance.",
    affiliateTier: 'mid',
  },
  {
    slug: 'qwen3-8b',
    name: 'Qwen3 8B',
    family: 'Qwen3',
    minVram: 6, fullVram: 16,
    params: '8B',
    tags: ['chat', 'coding'],
    ollamaCmd: 'ollama run qwen3:8b',
    description: 'Fast and capable 8B model, great for 6-8GB VRAM GPUs.',
    affiliateTier: 'mid',
  },
  {
    slug: 'mistral-7b',
    name: 'Mistral 7B',
    family: 'Mistral',
    minVram: 5, fullVram: 14,
    params: '7B',
    tags: ['chat', 'creative', 'coding'],
    ollamaCmd: 'ollama run mistral',
    description: 'Fast, creative, and efficient. Ideal for laptops and 6GB GPUs.',
    affiliateTier: 'beginner',
  },
  {
    slug: 'gemma3-27b',
    name: 'Gemma 3 27B',
    family: 'Gemma 3',
    minVram: 16, fullVram: 54,
    params: '27B',
    tags: ['chat', 'research', 'creative'],
    ollamaCmd: 'ollama run gemma3:27b',
    description: "Google's Gemma 3 large variant. Strong reasoning and creativity.",
    affiliateTier: 'high',
  },
  {
    slug: 'gemma3-12b',
    name: 'Gemma 3 12B',
    family: 'Gemma 3',
    minVram: 8, fullVram: 24,
    params: '12B',
    tags: ['chat', 'creative'],
    ollamaCmd: 'ollama run gemma3:12b',
    description: "Google's Gemma 3 mid-size. Good for creative writing on 8GB+ GPUs.",
    affiliateTier: 'mid',
  },
  {
    slug: 'phi-4',
    name: 'Phi-4',
    family: 'Phi',
    minVram: 4, fullVram: 8,
    params: '14B',
    tags: ['coding', 'research'],
    ollamaCmd: 'ollama run phi4',
    description: 'Microsoft Phi-4 — punches above its weight for coding on minimal VRAM.',
    affiliateTier: 'beginner',
  },
  {
    slug: 'phi-4-mini',
    name: 'Phi-4 Mini',
    family: 'Phi',
    minVram: 3, fullVram: 6,
    params: '3.8B',
    tags: ['chat', 'coding'],
    ollamaCmd: 'ollama run phi4-mini',
    description: 'Runs on 4GB VRAM. Best entry-level model for very limited hardware.',
    affiliateTier: 'beginner',
  },
];

export function getModelsForVram(vram: number): LLMModel[] {
  return models
    .filter(m => m.minVram <= vram)
    .sort((a, b) => b.minVram - a.minVram);
}

export function getModelBySlug(slug: string): LLMModel | undefined {
  return models.find(m => m.slug === slug);
}
