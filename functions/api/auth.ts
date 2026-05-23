export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Handle callback
  const code = url.searchParams.get('code');
  if (code) {
    // Exchange code for access token
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
    
    // Redirect back to admin with token
    const redirectUrl = new URL('/admin/', url.origin);
    redirectUrl.hash = `access_token=${tokenData.access_token}`;
    return Response.redirect(redirectUrl.toString(), 302);
  }
  
  // Initiate OAuth flow
  const state = crypto.randomUUID();
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`);
  githubAuthUrl.searchParams.set('scope', 'repo');
  githubAuthUrl.searchParams.set('state', state);
  
  return Response.redirect(githubAuthUrl.toString(), 302);
};
