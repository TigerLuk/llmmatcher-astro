import { test, expect } from '@playwright/test';

test.describe('Homepage — GPU Matcher', () => {
  test('loads with hero title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('LLM');
  });

  test('quick pick buttons are visible', async ({ page }) => {
    await page.goto('/');
    const btns = page.locator('.gpu-quick-btn');
    await expect(btns.first()).toBeVisible();
  });

  test('selecting RTX 4060 shows match results', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-slug="rtx-4060"]');
    await expect(page.locator('#results')).toBeVisible();
    await expect(page.locator('#results-title')).toContainText('RTX 4060');
  });

  test('results show at least one model card', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-slug="rtx-4060"]');
    const cards = page.locator('.model-card');
    await expect(cards.first()).toBeVisible();
  });

  test('copy button copies ollama command', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.click('[data-slug="rtx-4060"]');
    await page.locator('.copy-btn').first().click();
    const clipText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipText).toContain('ollama');
  });

  test('nav links are all present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav .logo')).toBeVisible();
    await expect(page.locator('nav a[href="/quiz"]')).toHaveCount(1);
    await expect(page.locator('nav a[href="/compare"]')).toHaveCount(1);
    await expect(page.locator('nav a[href="/leaderboard"]')).toHaveCount(1);
    await expect(page.locator('nav a[href="/blog"]')).toHaveCount(1);
  });

});

test.describe('Shareable Match Pages', () => {
  test('/match/rtx-4060 loads with correct title', async ({ page }) => {
    await page.goto('/match/rtx-4060');
    await expect(page.locator('h1')).toContainText('RTX 4060');
    await expect(page.locator('h1')).toContainText('8GB');
  });

  test('/match/rtx-4060 shows model cards', async ({ page }) => {
    await page.goto('/match/rtx-4060');
    const cards = page.locator('.model-card');
    await expect(cards.first()).toBeVisible();
  });

  test('/match/m4 loads Apple Silicon page', async ({ page }) => {
    await page.goto('/match/m4');
    await expect(page.locator('h1')).toContainText('M4');
  });
});

test.describe('Quiz Flow', () => {
  test('/quiz loads with first question', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('#q0 h1')).toBeVisible();
    await expect(page.locator('#q0 .opt-btn').first()).toBeVisible();
  });

  test('completing quiz redirects to result page', async ({ page }) => {
    await page.goto('/quiz');
    await page.locator('#q0 .opt-btn').first().click();
    await expect(page.locator('#q1')).toBeVisible();
    await page.locator('#q1 .opt-btn').first().click();
    await expect(page.locator('#q2')).toBeVisible();
    await page.locator('#q2 .opt-btn').first().click();
    await expect(page).toHaveURL(/\/quiz\/result\//);
  });

  test('quiz result page shows recommended models', async ({ page }) => {
    await page.goto('/quiz/result/coder');
    await expect(page.locator('.model-row').first()).toBeVisible();
    await expect(page.locator('h1')).toContainText('Developer');
  });

  test('share button on result copies URL', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/quiz/result/coder');
    await page.locator('#share-quiz-btn').click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('/quiz/result/coder');
  });
});

test.describe('Comparison Tool', () => {
  test('/compare loads with GPU picker', async ({ page }) => {
    await page.goto('/compare');
    await expect(page.locator('.pick-btn').first()).toBeVisible();
  });

  test('selecting two GPUs shows comparison table', async ({ page }) => {
    await page.goto('/compare');
    await page.locator('.pick-btn').nth(0).click();
    await page.locator('.pick-btn').nth(1).click();
    await expect(page.locator('.compare-table')).toBeVisible();
  });

  test('URL updates when GPUs are selected', async ({ page }) => {
    await page.goto('/compare');
    await page.locator('.pick-btn[data-slug="rtx-4060"]').click();
    await expect(page).toHaveURL(/gpus=rtx-4060/);
  });
});

test.describe('Blog', () => {
  test('/blog loads with at least one post', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('.post-card').first()).toBeVisible();
  });

  test('blog post page loads with affiliate CTA or newsletter', async ({ page }) => {
    await page.goto('/blog');
    const firstPost = page.locator('.post-card').first();
    const href = await firstPost.getAttribute('href');
    await page.goto(href!);
    await expect(page.locator('.affiliate-section, .aff-card, .newsletter-block').first()).toBeVisible();
  });
});

test.describe('Model Database', () => {
  test('/models loads model cards', async ({ page }) => {
    await page.goto('/models');
    await expect(page.locator('.model-preview').first()).toBeVisible();
  });

  test('/models/mistral-7b loads detail page', async ({ page }) => {
    await page.goto('/models/mistral-7b');
    await expect(page.locator('h1')).toContainText('Mistral');
    await expect(page.locator('.ollama-block')).toBeVisible();
  });
});

test.describe('Leaderboard', () => {
  test('/leaderboard loads', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.locator('h1')).toContainText('Leaderboard');
    await expect(page.locator('#board')).toBeVisible();
  });
});

test.describe('SEO & Accessibility', () => {
  test('homepage has canonical link tag', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('locallmmatcher.com');
  });

  test('homepage has GA4 script', async ({ page }) => {
    await page.goto('/');
    const gaScript = page.locator('script[src*="googletagmanager"]');
    await expect(gaScript).toHaveCount(1);
  });

  test('about page has affiliate disclosure', async ({ page }) => {
    await page.goto('/about');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.toLowerCase()).toContain('affiliate');
  });

  test('mobile: homepage is usable on 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.gpu-quick-btn').first()).toBeVisible();
  });
});

test.describe('Badge Generator', () => {
  test('badge appears after selecting GPU and clicking generate', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-slug="rtx-4060"]');
    await page.locator('button:has-text("Generate My AI Setup Badge")').click();
    await expect(page.locator('#badge-canvas')).toBeVisible();
    await expect(page.locator('#badge-dl')).toBeVisible();
  });
});
