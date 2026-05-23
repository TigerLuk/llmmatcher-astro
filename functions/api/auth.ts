export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  if (code) {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      return new Response("Error: " + JSON.stringify(tokenData), { status: 400 });
    }

    const token = tokenData.access_token;
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Auth</title></head>
<body>
<script>
  (function() {
    function receiveMessage(e) {
      console.log("receiveMessage", e.data);
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage(
      "authorization:github:success:" + JSON.stringify({token:"${token}"}),
      "*"
    );
    setTimeout(function() { window.close(); }, 500);
  })();
</script>
<p>Login successful! Closing window...</p>
</body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const state = crypto.randomUUID();
  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", `${url.origin}/api/auth`);
  authUrl.searchParams.set("scope", "repo");
  authUrl.searchParams.set("state", state);
  return Response.redirect(authUrl.toString(), 302);
};
