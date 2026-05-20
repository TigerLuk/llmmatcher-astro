// functions/api/leaderboard.ts
interface Env { DB: D1Database; }

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const gpuSlug = url.searchParams.get('gpu');

  const query = gpuSlug
    ? 'SELECT model_slug, COUNT(*) as votes FROM votes WHERE gpu_slug = ? GROUP BY model_slug ORDER BY votes DESC LIMIT 10'
    : 'SELECT model_slug, COUNT(*) as votes FROM votes GROUP BY model_slug ORDER BY votes DESC LIMIT 20';

  const result = gpuSlug
    ? await env.DB.prepare(query).bind(gpuSlug).all()
    : await env.DB.prepare(query).all();

  return new Response(JSON.stringify(result.results), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' },
  });
};
