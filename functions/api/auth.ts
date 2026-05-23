export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
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

    const tokenJson = JSON.stringify({ token: tokenData.access_token });
    const parentOrigin = escapeHtml(url.origin);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Auth</title>
  <style>
    body { font-family: sans-serif; padding: 40px; text-align: center; }
    .success { color: #2ea44f; }
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
        console.log("[OAuth] " + msg);
        var p = document.createElement("p");
        p.textContent = msg;
        logEl.appendChild(p);
      }

      var token = ${tokenJson};
      var origin = "${parentOrigin}";
      var handshakeMsg = "authorizing:github";
      var authMsg = "authorization:github:success:" + JSON.stringify(token);

      function sendAuth() {
        log("Sending auth...");
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(authMsg, origin);
            log("Auth sent via opener");
          } catch(e) { log("opener failed: " + e.message); }
        } else {
          log("opener not available");
        }

        if (typeof BroadcastChannel !== "undefined") {
          try {
            var bc = new BroadcastChannel("decap_cms_auth");
            bc.postMessage({ token: token.token, provider: "github" });
            bc.close();
            log("BroadcastChannel sent");
          } catch(e) {}
        }

        try {
          localStorage.setItem("decap_cms_github_token", token.token);
          log("Token saved to localStorage");
        } catch(e) {}

        document.querySelector("h2").textContent = "Authorization Successful!";
        document.querySelector("h2").className = "success";
        setTimeout(function() { window.close(); }, 800);
      }

      function doHandshake() {
        log("Handshake...");
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(handshakeMsg, origin);
            log("Handshake sent");
          } catch(e) {
            log("Handshake failed: " + e.message);
            sendAuth();
            return;
          }

          var timeout = setTimeout(function() {
            window.removeEventListener("message", onReply);
            log("Handshake timeout");
            sendAuth();
          }, 3000);

          function onReply(e) {
            log("Got: " + e.data + " from " + e.origin);
            if (e.origin === origin && e.data === handshakeMsg) {
              clearTimeout(timeout);
              window.removeEventListener("message", onReply);
              log("Handshake OK");
              sendAuth();
            }
          }
          window.addEventListener("message", onReply);
        } else {
          log("No opener, sending auth directly");
          sendAuth();
        }
      }

      setTimeout(doHandshake, 100);
    })();
  </script>
</body>
</html>`;

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

  const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <style>body { font-family: sans-serif; padding: 40px; text-align: center; color: #666; }</style>
</head>
<body>
  <p>Redirecting to GitHub...</p>
  <script>
    window.location.href = "${escapeHtml(githubAuthUrl.toString())}";
  </script>
</body>
</html>`;

  return new Response(redirectHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
