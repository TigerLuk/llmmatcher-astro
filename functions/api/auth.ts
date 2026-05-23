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
<head>
  <meta charset="utf-8">
  <title>Auth Success</title>
</head>
<body>
  <h1 id="status">Processing...</h1>
  <div id="debug"></div>
  <script>
    (function() {
      var token = ${tokenJson};
      var debugEl = document.getElementById("debug");
      var statusEl = document.getElementById("status");
      var logs = [];

      function log(msg) {
        logs.push(msg);
        console.log("[OAuth] " + msg);
      }

      function show() {
        if (debugEl) {
          debugEl.innerHTML = "<pre style='background:#f0f0f0;padding:10px;font-size:12px;white-space:pre-wrap;'>" + logs.join("\\n") + "</pre>";
        }
      }

      function success() {
        statusEl.textContent = "Authorization Successful!";
        show();
        setTimeout(function() { window.close(); }, 500);
      }

      function error(msg) {
        statusEl.textContent = "Error: " + msg;
        show();
      }

      function trySend() {
        log("Trying to send token...");
        log("window.opener exists: " + !!window.opener);

        // Method 1: Try window.opener.postMessage (standard Decap CMS way)
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({ token: token, provider: "github" }, "*");
            log("postMessage sent via window.opener");
            success();
            return;
          } catch (e) {
            log("postMessage failed: " + e.message);
          }
        }

        // Method 2: Try window.parent (iframe fallback)
        if (window.parent && window.parent !== window) {
          try {
            window.parent.postMessage({ token: token, provider: "github" }, "*");
            log("postMessage sent via window.parent");
            success();
            return;
          } catch (e) {
            log("parent.postMessage failed: " + e.message);
          }
        }

        // Method 3: Store in localStorage and notify parent
        try {
          localStorage.setItem("decap_cms_auth_token", token);
          localStorage.setItem("decap_cms_auth_provider", "github");
          localStorage.setItem("decap_cms_auth_time", Date.now().toString());
          log("Token saved to localStorage");

          if (typeof BroadcastChannel !== "undefined") {
            var bc = new BroadcastChannel("decap_cms_auth");
            bc.postMessage({ token: token, provider: "github" });
            bc.close();
            log("BroadcastChannel message sent");
          }

          statusEl.innerHTML = "Token saved! <br>Please close this window and refresh the CMS page.";
          show();
          setTimeout(function() { window.close(); }, 2000);
        } catch (e) {
          error("All methods failed: " + e.message);
        }
      }

      if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(trySend, 100);
      } else {
        document.addEventListener("DOMContentLoaded", function() {
          setTimeout(trySend, 100);
        });
      }
    })();
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
n    });
  }

  const state = crypto.randomUUID();
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set("redirect_uri", `${url.origin}/api/auth`);
  githubAuthUrl.searchParams.set("scope", "repo");
  githubAuthUrl.searchParams.set("state", state);

  return Response.redirect(githubAuthUrl.toString(), 302);
};
