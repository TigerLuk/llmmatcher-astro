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

    const safeToken = encodeURIComponent(tokenData.access_token);
    return Response.redirect(`${url.origin}/admin/#token=${safeToken}`, 302);
  }

  const state = crypto.randomUUID();
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set("redirect_uri", `${url.origin}/api/auth`);
  githubAuthUrl.searchParams.set("scope", "repo");
  githubAuthUrl.searchParams.set("state", state);

  return Response.redirect(githubAuthUrl.toString(), 302);
};
