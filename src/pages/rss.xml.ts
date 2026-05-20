// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', (p) => !p.data.draft);
  return rss({
    title: 'LLM Matcher Blog',
    description: 'Guides, reviews and news for local AI',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((p) => ({
        title: p.data.title,
        pubDate: p.data.date,
        description: p.data.description,
        link: `/blog/${p.id.replace(/\.(md|mdx)$/, '')}/`,
      })),
  });
}
