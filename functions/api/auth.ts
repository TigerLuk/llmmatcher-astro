export interface Env {
  GITHUB_CLIENT_ID: string;
n  GITHUB_CLIENT_SECRET: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);

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

    const token = tokenData.access_token;
    const tokenJson = JSON.stringify({ token: token });

    // 2. 返回 HTML 页面，使用 window.opener.postMessage 发送 token
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Auth</title>
  <style>
    body { font-family: sans-serif; padding: 40px; text-align: center; }
    .success { color: #2ea44f; }
    .error { color: #cf222e; }
    pre { background: #f6f8fa; padding: 16px; text-align: left; overflow: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h2>Authenticating...</h2>
  <div id="log"><p>Processing...</p></div>

  <script>
    (function() {
      var logEl = document.getElementById("log");
      function log(msg) {
n        console.log("[OAuth] " + msg);
n        var p = document.createElement("p");
n        p.textContent = msg;
        logEl.appendChild(p);
n      }

      var token = ${tokenJson};
      var origin = "${escapeHtml(url.origin)}";
      var handshakeMsg = "authorizing:github";
      var authMsg = "authorization:github:success:" + JSON.stringify(token);

      function sendAuth() {
n        log("Sending auth message...");
n        if (window.opener && !window.opener.closed) {
n          try {
n            window.opener.postMessage(authMsg, origin);
            log("Auth message sent via opener");
n          } catch(e) {
n            log("opener failed: " + e.message);
n          }
n        } else {
n          log("window.opener not available");
n        }

        // 尝试 BroadcastChannel
        if (typeof BroadcastChannel !== "undefined") {
n          try {
            var bc = new BroadcastChannel("decap_cms_auth");
            bc.postMessage({ token: token.token, provider: "github" });
n            bc.close();
n            log("BroadcastChannel sent");
n          } catch(e) { log("BC failed: " + e.message); }
        }

        // 保存到 localStorage
        try {
n          localStorage.setItem("decap_cms_github_token", token.token);
n          log("Token saved to localStorage");
n        } catch(e) { log("LS failed: " + e.message); }

        // 显示成功并关闭窗口
n        document.querySelector("h2").textContent = "Authorization Successful!";
n        document.querySelector("h2").className = "success";
n        setTimeout(function() { window.close(); }, 800);
n      }

      function doHandshake() {
n        log("Starting handshake...");
n        if (window.opener && !window.opener.closed) {
n          try {
n            window.opener.postMessage(handshakeMsg, origin);
            log("Handshake sent");
n          } catch(e) {
n            log("Handshake failed: " + e.message);
n            sendAuth();
n            return;
n          }

n          var timeout = setTimeout(function() {
n            window.removeEventListener("message", onReply);
n            log("Handshake timeout");
n            sendAuth();
n          }, 3000);

n          function onReply(e) {
n            log("Got: " + e.data + " from " + e.origin);
n            if (e.origin === origin && e.data === handshakeMsg) {
n              clearTimeout(timeout);
n              window.removeEventListener("message", onReply);
n              log("Handshake OK");
n              sendAuth();
n            }
n          }
n          window.addEventListener("message", onReply);
n        } else {
n          log("No opener, sending auth directly");
n          sendAuth();
n        }
n      }

n      setTimeout(doHandshake, 100);
n    })();
n  </script>
</body>
</html>`;

n    return new Response(html, {
n      headers: { "Content-Type": "text/html; charset=utf-8" },
n    });
n  }

  // ========== 发起 OAuth 授权（用 JS 跳转，避免 302） ==========
n  const state = crypto.randomUUID();
n  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
n  githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
n  githubAuthUrl.searchParams.set("redirect_uri", `${url.origin}/api/auth`);
n  githubAuthUrl.searchParams.set("scope", "repo");
n  githubAuthUrl.searchParams.set("state", state);

n  // 返回 HTML 页面做 JS 跳转，而不是 302 重定向
n  const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
n  <style>body { font-family: sans-serif; padding: 40px; text-align: center; color: #666; }</style>
</head>
<body>
n  <p>Redirecting to GitHub...</p>
n  <script>
n    window.location.href = "${escapeHtml(githubAuthUrl.toString())}";
n  </script>
</body>
</html>`;

n  return new Response(redirectHtml, {
n    headers: { "Content-Type": "text/html; charset=utf-8" },
n  });
};
