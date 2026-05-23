export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // ========== 处理 GitHub 回调 ==========
  const code = url.searchParams.get('code');
  if (code) {
    // 1. 用 code 换 access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(JSON.stringify(tokenData), { status: 400 });
    }

    // 2. Decap CMS 标准：通过 postMessage 把 token 传回父窗口
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Auth Success</title>
  <script>
    (function() {
      function receiveMessage(e) {
        console.log("receiveMessage", e.data);
      }
      window.opener.postMessage(
        {
          token: "${tokenData.access_token}",
          provider: "github"
        },
        "*"
      );
      window.addEventListener("message", receiveMessage, false);
    })();
  </script>
</head>
<body>
  <h1>Authorization successful</h1>
  <p>You can close this window.</p>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // ========== 发起 OAuth 授权 ==========
  const state = crypto.randomUUID();
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth`);
  githubAuthUrl.searchParams.set('scope', 'repo');
  githubAuthUrl.searchParams.set('state', state);

  return Response.redirect(githubAuthUrl.toString(), 302);
};
