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

    const tokenStr = JSON.stringify({ token: tokenData.access_token });
    const parentOrigin = url.origin;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Auth</title></head>
<body>
<p>Authenticating...</p>
<script>
(function() {
  var origin = "${parentOrigin}";
  var authMsg = "authorization:github:success:${tokenStr}";
  var handshakeMsg = "authorizing:github";

  function log(msg) {
    console.log("[OAuth] " + msg);
  }

  function sendAuth() {
    log("Sending auth message: " + authMsg);
    try {
      window.opener.postMessage(authMsg, origin);
      log("Auth sent");
    } catch(e) {
      log("Failed: " + e.message);
    }
    setTimeout(function() { window.close(); }, 500);
n  }

  function doHandshake() {
    log("Sending handshake");
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
      log("Timeout, sending auth directly");
      sendAuth();
    }, 3000);

    function onReply(e) {
      log("Got: " + e.data + " from " + e.origin);
      if (e.origin === origin && e.data === handshakeMsg) {
        clearTimeout(timeout);
        window.removeEventListener("message", onReply);
n        log("Handshake OK");
        sendAuth();
      }
    }

    window.addEventListener("message", onReply);
  }

  setTimeout(doHandshake, 100);
})();
</script>
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
