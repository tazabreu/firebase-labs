# Active Context

## Current Focus (next 1–2 iterations)
- Remote Config: add `health_env_label` to surface environment in responses; validate local vs nonprod via integration tests.
- Auth Hardening for `health` HTTPS function:
  - Evaluate Firebase Auth ID token verification + admin email allowlist (via Remote Config)
  - Evaluate Firebase App Check for abuse protection from the open web

## Near-Term Follow-ups
- Gate enforcement behind new RC flag `require_auth` (default false), then enable in nonprod for validation.
- Optional: thin admin UI/client to fetch ID token and invoke function.

## Dependencies
- Firebase Admin SDK (verifyIdToken; optional App Check verification)
- Remote Config template changes per project
- Integration tests updates for RC and (later) auth behaviors
