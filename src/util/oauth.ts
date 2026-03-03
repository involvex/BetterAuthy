// PKCE helpers and GitHub OAuth starter for static-first flow

function base64urlencode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return hash;
}

export function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64urlencode(array.buffer);
}

export async function generateCodeChallenge(codeVerifier: string) {
  const hashed = await sha256(codeVerifier);
  return base64urlencode(hashed);
}

export function makeState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => ('0' + b.toString(16)).slice(-2)).join('');
}

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${location.origin}/oauth/callback`;
const SCOPE = 'read:user user:email';

import { setSession } from './session';

export async function startGitHubOAuth() {
  // In dev, skip real OAuth to simplify local testing
  if (import.meta.env.DEV) {
    setSession({ userId: 'dev', login: 'dev', email: 'dev@local', token: 'dev-token', expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    // Redirect to root after mocking session
    location.href = '/';
    return;
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = makeState();

  sessionStorage.setItem('oauth_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    allow_signup: 'false',
  });

  location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  // Attempt browser-side exchange. This may fail due to CORS — fallback is a worker.
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: params.toString(),
  });

  if (!res.ok) throw new Error('token exchange failed');
  const json = await res.json();
  return json.access_token as string;
}

interface GitHubProfile {
  id: number;
  login: string;
  email?: string;
}

interface GitHubEmail {
  email: string;
  primary?: boolean;
  verified?: boolean;
}

export async function fetchGitHubProfile(token: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('failed to fetch profile');
  const profile = (await res.json()) as GitHubProfile;

  // fetch email
  const emailRes = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const emailPayload = (await emailRes.json()) as GitHubEmail[] | Record<string, unknown>;
  const emails = Array.isArray(emailPayload) ? emailPayload : [];
  const primary = emails.find((e) => e.primary)?.email;

  return {
    id: String(profile.id),
    login: profile.login,
    email: profile.email || primary,
  };
}
