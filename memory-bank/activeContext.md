# Active Context

## Current Focus (next 1–2 iterations)
- Enforce IAM perimeter for `health` function (private invoker) + CI post-deploy bindings
- RC-driven optional in-code auth guard stays as defense-in-depth

## Near-Term Follow-ups
- Configure GitHub OIDC (WIF) and secrets in repo/org to enable IAM steps
- Update nonprod test docs: use identity token when invoking protected endpoint

## Dependencies
- Google GitHub Actions (auth, setup-gcloud)
- GCP SA with roles: cloudfunctions.admin, iam.securityAdmin
- Secrets: ADMIN_USER_EMAIL, INVOKER_SA_EMAIL_*, WIF provider, SA email
