interface Env { SUBSCRIBERS: KVNamespace; }

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const expectedToken = 'llmmatcher-admin-2024';
  
  if (token !== expectedToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const keys = await env.SUBSCRIBERS.list({ prefix: 'email:' });
  
  let csv = 'Email,Subscribed At\n';
  for (const k of keys.keys) {
    const value = await env.SUBSCRIBERS.get(k.name);
    const data = value ? JSON.parse(value) : {};
    const date = data.createdAt ? new Date(data.createdAt).toISOString() : '';
    csv += k.name.replace('email:', '') + ',' + date + '\n';
n  }
  
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="subscribers.csv"',
    },
n  });
};
