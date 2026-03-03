import { useEffect } from 'react';
import { exchangeCodeForToken, fetchGitHubProfile } from '../util/oauth';
import { setSession } from '../util/session';
import { BASE_PATH } from '../util/basePath';

export function OAuthCallback() {
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const stored = sessionStorage.getItem('oauth_state');
        const codeVerifier = sessionStorage.getItem('oauth_code_verifier') || '';

        if (!code || !state || state !== stored) throw new Error('Invalid OAuth callback');

        const token = await exchangeCodeForToken(code, codeVerifier);
        const profile = await fetchGitHubProfile(token);

        setSession({ userId: profile.id, login: profile.login, email: profile.email, token, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

        // cleanup
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_code_verifier');

        // redirect home
        location.href = BASE_PATH;
      } catch (err) {
        console.error('OAuth callback failed', err);
        // show error and allow manual redirect
      }
    })();
  }, []);

  return <div className="p-4">Signing in...</div>;
}
