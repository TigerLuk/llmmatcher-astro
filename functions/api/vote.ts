// functions/api/vote.ts
interface Env {
  DB: D1Database;
  VOTE_RATE: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { gpuSlug, modelSlug } = await request.json() as { gpuSlug: string; modelSlug: string };
    if (!gpuSlug || !modelSlug) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateKey = `vote:${ip}:${gpuSlug}:${modelSlug}`;
    const existing = await env.VOTE_RATE.get(rateKey);
    if (existing) {
      return new Response(JSON.stringify({ error: 'Already voted' }), { status: 429 });
    }

    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO votes (id, gpu_slug, model_slug, created_at) VALUES (?, ?, ?, ?)'
    ).bind(id, gpuSlug, modelSlug, Date.now()).run();

    await env.VOTE_RATE.put(rateKey, '1', { expirationTtl: 86400 });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
