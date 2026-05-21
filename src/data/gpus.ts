export interface GPU {
  slug: string;
  name: string;
  vram: number;
  category: 'laptop' | 'desktop' | 'workstation' | 'mac' | 'cloud';
  amazonLink?: string;
  tpsRatio?: number;
}

export function getGPUBySlug(gpus: GPU[], slug: string): GPU | undefined {
  return gpus.find((gpu) => gpu.slug === slug);
}
