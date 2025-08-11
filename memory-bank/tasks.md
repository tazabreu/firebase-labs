# Implementation Tasks

## 🚀 Immediate Plan (Level 3)
- [ ] Remote Config: add `health_env_label` and `require_auth`
  - [ ] Update `remoteconfig.template.json`
  - [ ] Extend `remote-config.service.ts` types and mapping
  - [ ] Include new flags in health response
  - [ ] Local verify via emulator; deploy RC to nonprod
- [ ] Protect `health` function
  - [ ] Research and choose between: Firebase Auth ID token allowlist vs App Check (or both)
  - [ ] Implement middleware: verify ID token when `require_auth` is true; allow only admin emails (RC value)
  - [ ] Return 401/403 for unauthorized; keep open when flag is false
  - [ ] Update integration tests: local (open), nonprod (auth-enabled path with token)

## ✅ Completed
- Existing health service, RC integration (`health_sample_message`), and integration tests
