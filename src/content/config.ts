// src/content/config.ts
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
    minVram: z.number(),
    description: z.string(),
  }),
});

export const collections = { blog, models };
