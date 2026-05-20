// functions/api/subscribe.ts
interface Env { SUBSCRIBERS: KVNamespace; }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { email } = await request.json() as { email: string };
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
    }
    await env.SUBSCRIBERS.put(`email:${email}`, JSON.stringify({ email, createdAt: Date.now() }));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
