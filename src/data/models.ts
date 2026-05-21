export interface LLMModel {
  slug: string;
  name: string;
  family: string;
  minVram: number;
  fullVram: number;
  params: string;
  tags: string[];
  ollamaCmd: string;
  description: string;
  affiliateTier: 'beginner' | 'mid' | 'high';
  tpsRtx4090?: number;
}

export function getModelsForVram(models: LLMModel[], vram: number): LLMModel[] {
  return models
    .filter((model) => model.minVram <= vram)
    .sort((a, b) => b.minVram - a.minVram);
}

export function getModelBySlug(models: LLMModel[], slug: string): LLMModel | undefined {
  return models.find((model) => model.slug === slug);
}
