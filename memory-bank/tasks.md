# Implementation Tasks

## 🚀 Immediate Plan (Level 3)
- [x] Remote Config: add `health_env_label` and `require_auth`
  - [x] Update `remoteconfig.template.json`
  - [x] Extend `remote-config.service.ts` types and mapping
  - [x] Include new flags in health response
  - [x] Local verify via emulator; deploy RC to nonprod (CI configured)
- [x] Protect `health` function
  - [x] Implement middleware: verify ID token when `require_auth` is true; allow only admin emails (RC)
  - [x] Set IAM perimeter: private invoker; CI post-deploy remove public and add invokers
  - [x] Update integration tests: optional Authorization header for protected envs

## ✅ Completed
- Existing health service, RC integration (`health_sample_message`), and integration tests
