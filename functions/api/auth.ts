export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  if (code) {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      return new Response(`Error: ${JSON.stringify(tokenData)}`, { status: 400 });
    }

    const tokenJson = JSON.stringify(tokenData.access_token);

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Auth</title></head>
<body>
<script>
(function() {
  var token = ${tokenJson};
  localStorage.setItem("decap_cms_github_token", token);
  
  if (typeof BroadcastChannel !== "undefined") {
    try {
      var bc = new BroadcastChannel("decap_cms_auth");
      bc.postMessage({ token: token });
      bc.close();
    } catch(e) {}
  }
  
  if (window.opener && !window.opener.closed) {
    try {
      window.opener.postMessage({ token: token, provider: "github" }, "*");
    } catch(e) {}
n  }
  
  setTimeout(function() { window.close(); }, 300);
})();
</script>
<p>Authorization successful. Closing window...</p>
</body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const state = crypto.randomUUID();
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set("redirect_uri", `${url.origin}/api/auth`);
  githubAuthUrl.searchParams.set("scope", "repo");
  githubAuthUrl.searchParams.set("state", state);

  return Response.redirect(githubAuthUrl.toString(), 302);
};
