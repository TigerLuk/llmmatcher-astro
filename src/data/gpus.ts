// src/data/gpus.ts
export interface GPU {
  slug: string;
  name: string;
  vram: number;       // GB
  category: 'laptop' | 'desktop' | 'workstation' | 'mac' | 'cloud';
  amazonLink?: string;
}

export const gpus: GPU[] = [
  // Desktop NVIDIA
  { slug: 'rtx-5090',  name: 'RTX 5090',  vram: 32, category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-5080',  name: 'RTX 5080',  vram: 16, category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-4090',  name: 'RTX 4090',  vram: 24, category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-4080',  name: 'RTX 4080',  vram: 16, category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-4070-ti', name: 'RTX 4070 Ti', vram: 12, category: 'desktop',  amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-4070',  name: 'RTX 4070',  vram: 12, category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-4060-ti', name: 'RTX 4060 Ti', vram: 16, category: 'desktop',  amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-4060',  name: 'RTX 4060',  vram: 8,  category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-3090',  name: 'RTX 3090',  vram: 24, category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-3080',  name: 'RTX 3080',  vram: 10, category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-3070',  name: 'RTX 3070',  vram: 8,  category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-3060',  name: 'RTX 3060',  vram: 12, category: 'desktop',      amazonLink: 'https://amzn.to/4uGfGdl' },
  // Laptop NVIDIA
  { slug: 'rtx-4090-laptop', name: 'RTX 4090 Laptop', vram: 16, category: 'laptop', amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-4080-laptop', name: 'RTX 4080 Laptop', vram: 12, category: 'laptop', amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-4070-laptop', name: 'RTX 4070 Laptop', vram: 8,  category: 'laptop', amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rtx-4060-laptop', name: 'RTX 4060 Laptop', vram: 8,  category: 'laptop', amazonLink: 'https://amzn.to/4uGfGdl' },
  // AMD
  { slug: 'rx-7900-xtx', name: 'RX 7900 XTX', vram: 24, category: 'desktop', amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rx-7900-xt',  name: 'RX 7900 XT',  vram: 20, category: 'desktop', amazonLink: 'https://amzn.to/4uGfGdl' },
  { slug: 'rx-7800-xt',  name: 'RX 7800 XT',  vram: 16, category: 'desktop', amazonLink: 'https://amzn.to/4uGfGdl' },
  // Apple Silicon
  { slug: 'm4-max',    name: 'Apple M4 Max',    vram: 128, category: 'mac' },
  { slug: 'm4-pro',    name: 'Apple M4 Pro',    vram: 48,  category: 'mac' },
  { slug: 'm4',        name: 'Apple M4',        vram: 32,  category: 'mac' },
  { slug: 'm3-max',    name: 'Apple M3 Max',    vram: 128, category: 'mac' },
  { slug: 'm3-pro',    name: 'Apple M3 Pro',    vram: 36,  category: 'mac' },
  { slug: 'm3',        name: 'Apple M3',        vram: 24,  category: 'mac' },
  { slug: 'm2-max',    name: 'Apple M2 Max',    vram: 96,  category: 'mac' },
  { slug: 'm2-pro',    name: 'Apple M2 Pro',    vram: 32,  category: 'mac' },
  { slug: 'm2',        name: 'Apple M2',        vram: 24,  category: 'mac' },
  // Cloud
  { slug: 'cloud-a100', name: 'Cloud A100 (40GB)', vram: 40, category: 'cloud' },
  { slug: 'cloud-h100', name: 'Cloud H100 (80GB)', vram: 80, category: 'cloud' },
];

export function getGPUBySlug(slug: string): GPU | undefined {
  return gpus.find(g => g.slug === slug);
}
