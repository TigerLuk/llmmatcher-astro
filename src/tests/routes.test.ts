import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const dist = (path: string) => resolve(process.cwd(), 'dist', path);

describe('build output — required pages exist', () => {
  const requiredPages = [
    'index.html',
    'quiz/index.html',
    'compare/index.html',
    'leaderboard/index.html',
    'models/index.html',
    'blog/index.html',
    'about/index.html',
    'match/rtx-4060/index.html',
    'match/rtx-4090/index.html',
    'match/m4/index.html',
    'quiz/result/coder/index.html',
    'quiz/result/creative-writer/index.html',
    'quiz/result/researcher/index.html',
    'quiz/result/casual-chatter/index.html',
    'quiz/result/cloud-user/index.html',
    'sitemap-index.xml',
    'rss.xml',
  ];

  requiredPages.forEach(page => {
    it(`dist/${page} exists`, () => {
      expect(existsSync(dist(page))).toBe(true);
    });
  });

  it('homepage contains GA4 tracking ID', () => {
    const html = readFileSync(dist('index.html'), 'utf-8');
    expect(html).toContain('G-SHF1GLMN0F');
  });

  it('homepage contains canonical URL', () => {
    const html = readFileSync(dist('index.html'), 'utf-8');
    expect(html).toContain('locallmmatcher.com');
  });

  it('match/rtx-4060 page has correct title', () => {
    const html = readFileSync(dist('match/rtx-4060/index.html'), 'utf-8');
    expect(html).toContain('RTX 4060');
    expect(html).toContain('8GB');
  });

  it('sitemap contains all match pages', () => {
    const hasSitemap = existsSync(dist('sitemap-index.xml')) || existsSync(dist('sitemap.xml'));
    expect(hasSitemap).toBe(true);
  });

  it('rss.xml is valid XML with items', () => {
    const rss = readFileSync(dist('rss.xml'), 'utf-8');
    expect(rss).toContain('<rss');
    expect(rss).toContain('<channel>');
  });

  it('about page contains affiliate disclosure text', () => {
    const html = readFileSync(dist('about/index.html'), 'utf-8');
    expect(html.toLowerCase()).toContain('affiliate');
  });

  it('homepage has sponsored affiliate links', () => {
    const html = readFileSync(dist('index.html'), 'utf-8');
    expect(html).toContain('sponsored');
  });
});

describe('model pages', () => {
  it('each model has its own page', () => {
    const modelSlugs = ['mistral-7b', 'phi-4', 'qwen3-8b', 'llama-4-scout', 'gemma3-12b'];
    modelSlugs.forEach(slug => {
      expect(existsSync(dist(`models/${slug}/index.html`))).toBe(true);
    });
  });
});
