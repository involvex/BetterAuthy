# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Quick commands
- Install: bun install (project includes bun.lock; npm install also works)
- Dev server: bun run start (equivalent: npm start)
- Build: bun run build
- Preview build: bun run preview
- Typecheck: bun run typecheck
- Lint: bun run lint
- Lint fix: bun run lint:fix

High level
- Stack: React 19 + TypeScript + Vite. Project is configured as a PWA via vite-plugin-pwa.
- App: Single-page client application (no backend in this repo). primary local store is IndexedDB with encryption helpers.
- Auth: GitHub OAuth helpers use a static-first PKCE flow. In DEV mode the code mocks a session for local testing (src/util/oauth.ts).
- Storage: Local user data persisted in IndexedDB (src/util/storage.ts). Session state stored in localStorage (src/util/session.ts).

Important files (start here)
- package.json: scripts and dependencies. See: package.json:5-14 for scripts.
- src/index.tsx: app entry point — createRoot and App mount. (src/index.tsx:40)
- src/components/App.tsx: top-level app UI and routing. (src/components/App.tsx)
- src/util/storage.ts: IndexedDB helpers (openDB, getUserData, setUserData). (src/util/storage.ts:16)
- src/util/session.ts: session management (setSession/getSession). (src/util/session.ts:13)
- src/util/oauth.ts: PKCE helpers and GitHub flow (generateCodeVerifier, exchangeCodeForToken). (src/util/oauth.ts:17)
- src/util/webauthn.ts: WebAuthn helpers and enrollment/login flows.
- vite.config.mts: build configuration, PWA manifest, and base URL handling (vite.config.mts:115-167)
- .github/workflows/main.yml: CI builds and GitHub Pages deploy.

Environment & conventions
- Environment variables: read via import.meta.env.VITE_* (examples: VITE_GITHUB_CLIENT_ID, VITE_GITHUB_REDIRECT_URI, VITE_BASE_URL).
- TypeScript paths: baseUrl is ./src and path alias ~* -> ./* (tsconfig.json:2-8).
- Package manager: this repo contains bun.lock; prefer bun commands in CLAUDE.md, but npm is an acceptable alternative.
- Do NOT commit secrets or real credentials. CI uses GitHub Actions; secrets are provided via repository secrets.

Testing
- There are no tests configured in the repository. If tests are added later, prefer vitest or jest; add test scripts to package.json and document them here.

Developer verification checklist
1. bun install
2. bun run start — app serves locally (vite)
3. bun run typecheck — TypeScript passes
4. bun run lint — linter is satisfied
5. bun run build && bun run preview — production build completes and serves from ./dist
6. Spot-check: load the app in browser, confirm OAuth DEV mock behavior and IndexedDB helpers

Notes for Claude Code
- When making changes, prefer editing existing files over creating new files unless the task explicitly requires new files.
- Avoid committing secrets. When asked to commit, stage only project files and avoid including env files or other sensitive data.
- Follow repository scripts and TypeScript configuration (tsconfig.json) for build and typecheck steps.

Where to look for auth/storage logic (examples)
- src/util/storage.ts:getUserData (line ~30)
- src/util/storage.ts:setUserData (line ~45)
- src/util/session.ts:setSession (line ~13)
- src/util/oauth.ts:generateCodeVerifier (line ~17)

-- End CLAUDE.md