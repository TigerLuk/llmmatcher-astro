export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // ========== 处理 GitHub 回调 ==========
  const code = url.searchParams.get("code");
  if (code) {
    // 1. 用 code 换 access_token
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

    // 2. 用 JSON.stringify 安全转义 token，避免特殊字符破坏 JS
    const tokenJson = JSON.stringify(tokenData.access_token);

    // 3. Decap CMS 标准：通过 postMessage 把 token 传回父窗口
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Auth Success</title>
  <script>
    (function() {
      var token = ${tokenJson};
n      var provider = "github";
      var logs = [];

      function log(msg) {
        logs.push(msg);
        console.log("[OAuth] " + msg);
      }

      function send() {
        log("Token length: " + token.length);
        log("window.opener exists: " + !!window.opener);
        log("window.opener closed: " + (window.opener ? window.opener.closed : "N/A"));

        if (!window.opener || window.opener.closed) {
          showError("Cannot access parent window. Try disabling popup blockers or use normal browsing mode instead of incognito.");
          return;
        }

        try {
          window.opener.postMessage({ token: token, provider: provider }, "*");
          log("postMessage sent OK");
          showSuccess();
          setTimeout(function() { window.close(); }, 800);
        } catch (e) {
          log("postMessage error: " + e.message);
          showError(e.message);
        }
      }

      function showSuccess() {
        document.body.innerHTML = "<h1>Authorization Successful</h1><p>Closing window...</p><div id=\'logs\'></div>";
        showLogs();
      }

      function showError(msg) {
        document.body.innerHTML = "<h1>Error</h1><p>" + msg + "</p><div id=\'logs\'></div>";
        showLogs();
      }

      function showLogs() {
        var el = document.getElementById("logs");
        if (el) el.innerHTML = "<h3>Debug Log:</h3><pre style=\'background:#f5f5f5;padding:10px;margin-top:10px;font-size:12px;\'>" + logs.join("\\n") + "</pre>";
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", send);
      } else {
        send();
      }
    })();
  </script>
</head>
<body>
  <h1>Processing...</h1>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // ========== 发起 OAuth 授权 ==========
  const state = crypto.randomUUID();
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set("redirect_uri", `${url.origin}/api/auth`);
  githubAuthUrl.searchParams.set("scope", "repo");
  githubAuthUrl.searchParams.set("state", state);

  return Response.redirect(githubAuthUrl.toString(), 302);
};
