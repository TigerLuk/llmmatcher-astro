interface Env { SUBSCRIBERS: KVNamespace; }

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  
  if (token !== "llmmatcher-admin-2024") {
    return new Response("Unauthorized", { status: 401 });
n  }

  const keys = await env.SUBSCRIBERS.list({ prefix: "email:" });
  let csv = "Email,Subscribed At\n";
  for (const k of keys.keys) {
    const v = await env.SUBSCRIBERS.get(k.name);
    const d = v ? JSON.parse(v) : {};
    csv += k.name.replace("email:", "") + "," + (d.createdAt ? new Date(d.createdAt).toISOString() : "") + "\n";
n  }
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=subscribers.csv",
n    },
n  });
};