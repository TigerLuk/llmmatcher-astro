import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://llmmatcher.com',
  integrations: [sitemap(), mdx()],
  output: 'static',
  legacy: {
    collectionsBackwardsCompat: true,
  },
});
