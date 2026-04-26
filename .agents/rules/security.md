# Security Guardrails

## Input & Data
- **Sanitization:** Ensure no user-provided strings are injected directly into the DOM or used to load external assets without validation.
- **State Integrity:** All game state updates must go through defined actions in `gameStore.ts`. Avoid direct mutation.

## Secrets Management
- **Environment Variables:** Use `.env` files for any future API keys (e.g., leaderboards).
- **Hardcoding:** **NEVER** hardcode sensitive information.
- **Tracking:** Ensure `.env` and other sensitive files are in `.gitignore`.

## Dependencies
- **Audit:** Regularly run `npm audit` to check for vulnerabilities in Three.js or React.
- **Pinning:** Use `package-lock.json` to ensure consistent builds across development and deployment (Vercel).

## Public Safety
- **XSS:** While this is a client-side game, ensure any future username/leaderboard integration properly escapes HTML.
