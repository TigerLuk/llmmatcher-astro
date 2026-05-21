import { describe, it, expect } from 'vitest';
import type { GPU } from '../data/gpus';
import { getGPUBySlug } from '../data/gpus';
import type { LLMModel } from '../data/models';
import { getModelsForVram, getModelBySlug } from '../data/models';
import { affiliates, tagAffiliates } from '../data/affiliates';
import { profiles, getProfileFromAnswers, getProfileBySlug } from '../data/quizProfiles';

const gpuFixtures: GPU[] = [
  { slug: 'rtx-4060', name: 'RTX 4060', vram: 8, category: 'desktop', amazonLink: 'https://amzn.to/example' },
  { slug: 'rtx-4090-laptop', name: 'RTX 4090 Laptop', vram: 16, category: 'laptop', amazonLink: 'https://amzn.to/example' },
  { slug: 'm4', name: 'Apple M4', vram: 16, category: 'mac' },
  { slug: 'cloud-h100', name: 'Cloud H100 (80GB)', vram: 80, category: 'cloud' },
];

const modelFixtures: LLMModel[] = [
  { slug: 'llama-4-scout', name: 'Llama 4 Scout', family: 'Llama 4', minVram: 72, fullVram: 217, params: '109B MoE (17B active)', tags: ['chat', 'research'], ollamaCmd: 'ollama run llama4:scout', description: 'Meta multimodal long-context model for GPU servers.', affiliateTier: 'high' },
  { slug: 'llama-4-maverick', name: 'Llama 4 Maverick', family: 'Llama 4', minVram: 256, fullVram: 803, params: '400B MoE (17B active)', tags: ['chat', 'research'], ollamaCmd: 'ollama run llama4:maverick', description: 'Large multimodal Llama 4 model for cloud-scale inference.', affiliateTier: 'high' },
  { slug: 'deepseek-r1', name: 'DeepSeek R1', family: 'DeepSeek', minVram: 6, fullVram: 16, params: '8B distilled', tags: ['coding', 'research', 'reasoning'], ollamaCmd: 'ollama run deepseek-r1', description: 'Reasoning-focused distilled DeepSeek model for local GPUs.', affiliateTier: 'mid' },
  { slug: 'qwen3-30b', name: 'Qwen3 30B', family: 'Qwen3', minVram: 20, fullVram: 60, params: '30B', tags: ['chat', 'coding', 'multilingual'], ollamaCmd: 'ollama run qwen3:30b', description: 'High-context Qwen3 model for stronger local performance.', affiliateTier: 'high' },
  { slug: 'qwen3-8b', name: 'Qwen3 8B', family: 'Qwen3', minVram: 6, fullVram: 16, params: '8B', tags: ['chat', 'coding'], ollamaCmd: 'ollama run qwen3:8b', description: 'Fast general-purpose local model.', affiliateTier: 'mid' },
  { slug: 'mistral-7b', name: 'Mistral 7B', family: 'Mistral', minVram: 5, fullVram: 14, params: '7B', tags: ['chat', 'creative', 'coding'], ollamaCmd: 'ollama run mistral', description: 'Fast 7B local model.', affiliateTier: 'beginner' },
  { slug: 'gemma3-27b', name: 'Gemma 3 27B', family: 'Gemma 3', minVram: 18, fullVram: 55, params: '27B', tags: ['chat', 'research', 'creative'], ollamaCmd: 'ollama run gemma3:27b', description: 'Google multimodal Gemma 3 large variant.', affiliateTier: 'high' },
  { slug: 'gemma3-12b', name: 'Gemma 3 12B', family: 'Gemma 3', minVram: 9, fullVram: 24, params: '12B', tags: ['chat', 'creative'], ollamaCmd: 'ollama run gemma3:12b', description: 'Google multimodal Gemma 3 mid-size model.', affiliateTier: 'mid' },
  { slug: 'phi-4', name: 'Phi-4', family: 'Phi', minVram: 10, fullVram: 29, params: '14B', tags: ['coding', 'research'], ollamaCmd: 'ollama run phi4', description: 'Microsoft 14B model with strong coding quality.', affiliateTier: 'mid' },
  { slug: 'phi-4-mini', name: 'Phi-4 Mini', family: 'Phi', minVram: 3, fullVram: 8, params: '3.8B', tags: ['chat', 'coding'], ollamaCmd: 'ollama run phi4-mini', description: 'Small Phi model for entry-level hardware.', affiliateTier: 'beginner' },
  { slug: 'llama3.2-3b', name: 'Llama 3.2 3B', family: 'Llama 3', minVram: 2, fullVram: 6, params: '3B', tags: ['chat', 'coding'], ollamaCmd: 'ollama run llama3.2:3b', description: 'Budget-friendly Llama 3.2 model for daily local use.', affiliateTier: 'beginner' },
  { slug: 'phi3.5', name: 'Phi 3.5 Mini', family: 'Phi', minVram: 3, fullVram: 8, params: '3.8B', tags: ['reasoning', 'coding', 'chat'], ollamaCmd: 'ollama run phi3.5', description: 'Compact Phi model with strong reasoning for its size.', affiliateTier: 'beginner' },
  { slug: 'qwen3-4b', name: 'Qwen3 4B', family: 'Qwen3', minVram: 3, fullVram: 8, params: '4B', tags: ['chat', 'coding', 'multilingual'], ollamaCmd: 'ollama run qwen3:4b', description: 'Balanced Qwen3 model for everyday local tasks.', affiliateTier: 'beginner' },
  { slug: 'qwen2.5-coder-7b', name: 'Qwen 2.5 Coder 7B', family: 'Qwen 2.5 Coder', minVram: 5, fullVram: 14, params: '7B', tags: ['coding'], ollamaCmd: 'ollama run qwen2.5-coder:7b', description: 'Strong 7B coding model for local development workflows.', affiliateTier: 'mid' },
  { slug: 'deepseek-r1-7b', name: 'DeepSeek R1 7B', family: 'DeepSeek', minVram: 5, fullVram: 14, params: '7B distilled', tags: ['reasoning', 'coding', 'research'], ollamaCmd: 'ollama run deepseek-r1:7b', description: 'Reasoning-focused DeepSeek distill for consumer GPUs.', affiliateTier: 'mid' },
  { slug: 'qwen2.5-coder-14b', name: 'Qwen 2.5 Coder 14B', family: 'Qwen 2.5 Coder', minVram: 9, fullVram: 28, params: '14B', tags: ['coding', 'reasoning'], ollamaCmd: 'ollama run qwen2.5-coder:14b', description: 'High-end local coding model for 12GB+ systems.', affiliateTier: 'mid' },
  { slug: 'deepseek-r1-14b', name: 'DeepSeek R1 14B', family: 'DeepSeek', minVram: 9, fullVram: 28, params: '14B distilled', tags: ['reasoning', 'coding', 'research'], ollamaCmd: 'ollama run deepseek-r1:14b', description: 'Higher-capability DeepSeek reasoning distill for local GPUs.', affiliateTier: 'mid' },
  { slug: 'deepseek-r1-32b', name: 'DeepSeek R1 32B', family: 'DeepSeek', minVram: 19, fullVram: 64, params: '32B distilled', tags: ['reasoning', 'coding', 'research'], ollamaCmd: 'ollama run deepseek-r1:32b', description: 'Large DeepSeek reasoning model for 24GB-class hardware.', affiliateTier: 'high' },
  { slug: 'qwen3-32b', name: 'Qwen3 32B', family: 'Qwen3', minVram: 20, fullVram: 64, params: '32B', tags: ['chat', 'coding', 'multilingual', 'reasoning'], ollamaCmd: 'ollama run qwen3:32b', description: 'Top-tier Qwen3 model for large local deployments.', affiliateTier: 'high' },
  { slug: 'llama3.3-70b', name: 'Llama 3.3 70B', family: 'Llama 3', minVram: 40, fullVram: 140, params: '70B', tags: ['chat', 'coding', 'research', 'reasoning'], ollamaCmd: 'ollama run llama3.3:70b', description: 'Frontier-scale Llama model for cloud or multi-GPU use.', affiliateTier: 'high' },
  { slug: 'deepseek-r1-70b', name: 'DeepSeek R1 70B', family: 'DeepSeek', minVram: 40, fullVram: 140, params: '70B distilled', tags: ['reasoning', 'research', 'coding'], ollamaCmd: 'ollama run deepseek-r1:70b', description: 'Server-class DeepSeek reasoning model for maximum quality.', affiliateTier: 'high' },
  { slug: 'qwen2.5-72b', name: 'Qwen 2.5 72B', family: 'Qwen 2.5', minVram: 43, fullVram: 144, params: '72B', tags: ['chat', 'coding', 'multilingual', 'research'], ollamaCmd: 'ollama run qwen2.5:72b', description: 'Large multilingual Qwen model for cloud-grade deployments.', affiliateTier: 'high' },
];

describe('gpu helpers', () => {
  it('every fixture GPU has required fields', () => {
    gpuFixtures.forEach(g => {
      expect(g.slug).toBeTruthy();
      expect(g.name).toBeTruthy();
      expect(g.vram).toBeGreaterThan(0);
      expect(['desktop', 'laptop', 'mac', 'cloud']).toContain(g.category);
    });
  });

  it('getGPUBySlug returns correct GPU from provided array', () => {
    const gpu = getGPUBySlug(gpuFixtures, 'rtx-4060');
    expect(gpu?.vram).toBe(8);
    expect(gpu?.name).toContain('4060');
  });

  it('getGPUBySlug returns undefined for unknown slug', () => {
    expect(getGPUBySlug(gpuFixtures, 'unknown-gpu')).toBeUndefined();
  });
});

describe('model helpers', () => {
  it('every fixture model has required fields', () => {
    modelFixtures.forEach(m => {
      expect(m.slug).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.minVram).toBeGreaterThan(0);
      expect(m.ollamaCmd).toContain('ollama');
      expect(m.tags.length).toBeGreaterThan(0);
    });
  });

  it('getModelsForVram returns only models needing available VRAM', () => {
    const result = getModelsForVram(modelFixtures, 8);
    result.forEach(m => expect(m.minVram).toBeLessThanOrEqual(8));
  });

  it('getModelsForVram returns fewer models for 4GB than 24GB', () => {
    expect(getModelsForVram(modelFixtures, 4).length).toBeLessThan(getModelsForVram(modelFixtures, 24).length);
  });

  it('getModelsForVram sorts by minVram descending', () => {
    const result = getModelsForVram(modelFixtures, 80);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].minVram).toBeGreaterThanOrEqual(result[i].minVram);
    }
  });

  it('getModelBySlug returns correct model from provided array', () => {
    const model = getModelBySlug(modelFixtures, 'mistral-7b');
    expect(model?.minVram).toBe(5);
  });

  it('all model slugs are unique', () => {
    const slugs = modelFixtures.map(m => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('affiliates data', () => {
  it('all required affiliate keys exist', () => {
    expect(affiliates.amazon_gpu).toContain('amzn.to');
    expect(affiliates.runpod).toContain('runpod.io');
    expect(affiliates.surfshark).toBeTruthy();
    expect(affiliates.pluralsight).toBeTruthy();
  });

  it('all affiliate URLs start with https', () => {
    Object.values(affiliates).forEach(url => {
      expect(url).toMatch(/^https?:\/\//);
    });
  });

  it('tagAffiliates gpu tag maps to amazon_gpu', () => {
    const gpuTag = tagAffiliates.gpu;
    expect(gpuTag).toBeDefined();
    expect(gpuTag[0].key).toBe('amazon_gpu');
  });

  it('tagAffiliates cloud tag maps to runpod', () => {
    const cloudTag = tagAffiliates.cloud;
    expect(cloudTag[0].key).toBe('runpod');
  });
});

describe('quiz profiles', () => {
  it('has 5 profiles', () => {
    expect(profiles.length).toBe(5);
  });

  it('all profiles have required fields', () => {
    profiles.forEach(profile => {
      expect(profile.slug).toBeTruthy();
      expect(profile.title).toBeTruthy();
      expect(profile.recommendedModels.length).toBeGreaterThan(0);
      expect(profile.affiliateKey).toBeTruthy();
    });
  });

  it('getProfileFromAnswers cloud budget returns cloud-user', () => {
    expect(getProfileFromAnswers('chat', 'cloud', 'beginner')).toBe('cloud-user');
  });

  it('getProfileFromAnswers coding returns coder', () => {
    expect(getProfileFromAnswers('coding', 'gaming-pc', 'developer')).toBe('coder');
  });

  it('getProfileFromAnswers creative returns creative-writer', () => {
    expect(getProfileFromAnswers('creative', 'laptop', 'intermediate')).toBe('creative-writer');
  });

  it('getProfileBySlug returns correct profile', () => {
    const profile = getProfileBySlug('coder');
    expect(profile?.emoji).toBe('💻');
  });

  it('all profile recommendedModels exist in the supported model list', () => {
    profiles.forEach(profile => {
      profile.recommendedModels.forEach(slug => {
        expect(getModelBySlug(modelFixtures, slug)).toBeDefined();
      });
    });
  });
});
