import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const models = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    family: z.string(),
    minVram: z.number(),
    fullVram: z.number(),
    params: z.string(),
    tags: z.array(z.string()).default([]),
    ollamaCmd: z.string(),
    description: z.string(),
    affiliateTier: z.enum(['beginner', 'mid', 'high']),
    tpsRtx4090: z.number().optional(),
  }),
});

const gpus = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    vram: z.number(),
    category: z.enum(['laptop', 'desktop', 'workstation', 'mac', 'cloud']),
    amazonLink: z.string().optional(),
    tpsRatio: z.number().optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    lastUpdated: z.string().optional(),
  }),
});

export const collections = { blog, models, gpus, pages };
