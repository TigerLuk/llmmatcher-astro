import { describe, it, expect } from 'vitest';
import { gpus, getGPUBySlug } from '../data/gpus';
import { models, getModelsForVram, getModelBySlug } from '../data/models';
import { affiliates, tagAffiliates } from '../data/affiliates';
import { profiles, getProfileFromAnswers, getProfileBySlug } from '../data/quizProfiles';

describe('gpus data', () => {
  it('has at least 30 GPUs', () => {
    expect(gpus.length).toBeGreaterThanOrEqual(30);
  });
  it('every GPU has required fields', () => {
    gpus.forEach(g => {
      expect(g.slug).toBeTruthy();
      expect(g.name).toBeTruthy();
      expect(g.vram).toBeGreaterThan(0);
      expect(['desktop','laptop','mac','cloud']).toContain(g.category);
    });
  });
  it('getGPUBySlug returns correct GPU', () => {
    const gpu = getGPUBySlug('rtx-4060');
    expect(gpu?.vram).toBe(8);
    expect(gpu?.name).toContain('4060');
  });
  it('getGPUBySlug returns undefined for unknown slug', () => {
    expect(getGPUBySlug('unknown-gpu')).toBeUndefined();
  });
  it('all GPU slugs are unique', () => {
    const slugs = gpus.map(g => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('models data', () => {
  it('has at least 10 models', () => {
    expect(models.length).toBeGreaterThanOrEqual(10);
  });
  it('every model has required fields', () => {
    models.forEach(m => {
      expect(m.slug).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.minVram).toBeGreaterThan(0);
      expect(m.ollamaCmd).toContain('ollama');
      expect(m.tags.length).toBeGreaterThan(0);
    });
  });
  it('getModelsForVram(8) returns only models needing ≤8GB', () => {
    const result = getModelsForVram(8);
    result.forEach(m => expect(m.minVram).toBeLessThanOrEqual(8));
  });
  it('getModelsForVram(4) returns fewer models than getModelsForVram(24)', () => {
    expect(getModelsForVram(4).length).toBeLessThan(getModelsForVram(24).length);
  });
  it('getModelsForVram returns sorted by minVram descending', () => {
    const result = getModelsForVram(32);
    for (let i = 1; i < result.length; i++) {
      expect(result[i-1].minVram).toBeGreaterThanOrEqual(result[i].minVram);
    }
  });
  it('getModelBySlug returns correct model', () => {
    const m = getModelBySlug('mistral-7b');
    expect(m?.minVram).toBe(5);
  });
  it('all model slugs are unique', () => {
    const slugs = models.map(m => m.slug);
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
    const gpuTag = tagAffiliates['gpu'];
    expect(gpuTag).toBeDefined();
    expect(gpuTag[0].key).toBe('amazon_gpu');
  });
  it('tagAffiliates cloud tag maps to runpod', () => {
    const cloudTag = tagAffiliates['cloud'];
    expect(cloudTag[0].key).toBe('runpod');
  });
});

describe('quiz profiles', () => {
  it('has 5 profiles', () => {
    expect(profiles.length).toBe(5);
  });
  it('all profiles have required fields', () => {
    profiles.forEach(p => {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.recommendedModels.length).toBeGreaterThan(0);
      expect(p.affiliateKey).toBeTruthy();
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
    const p = getProfileBySlug('coder');
    expect(p?.emoji).toBe('💻');
  });
  it('all profile recommendedModels exist in models data', () => {
    profiles.forEach(p => {
      p.recommendedModels.forEach(slug => {
        expect(getModelBySlug(slug)).toBeDefined();
      });
    });
  });
});
