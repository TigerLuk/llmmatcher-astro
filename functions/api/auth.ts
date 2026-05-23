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

    // 2. 获取 GitHub 用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'llmmatcher',
      },
    });
    const userData = await userResponse.json();

    // 3. 用 Cookie 存储 token（比 hash 安全且可靠）
    const cookie = `gh_token=${tokenData.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;

    // 4. 跳转回首页或 admin 页面
    const redirectUrl = new URL('/', url.origin); // 或 '/admin/' 如果你有 admin 页面
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
        'Set-Cookie': cookie,
      },
    });
  }

  // ========== 发起 OAuth 授权 ==========
  const state = crypto.randomUUID();
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  
  // ⚠️ 关键：redirect_uri 必须和 GitHub App 里配置的一模一样！
  // 如果你 GitHub App 里配的是 /api/auth，这里就必须是 /api/auth
  githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth`);
  
  githubAuthUrl.searchParams.set('scope', 'repo');
  githubAuthUrl.searchParams.set('state', state);

  return Response.redirect(githubAuthUrl.toString(), 302);
};
