# GitHub Actions Deployment Workflows

This directory contains GitHub Actions workflows for deploying the Firebase Labs project to different environments using trunk-based development.

## Workflows

### 1. Deploy to NonProd (`deploy-nonprod.yml`)

This workflow deploys the application to the non-production Firebase environment.

- **Trigger**: Manual (workflow_dispatch)
- **Branch Restriction**: Only runs on the `main` branch
- **Confirmation**: Requires typing "DEPLOY" to confirm
- **Target**: `fir-labs-nonprod` Firebase project
- **Environment**: Sets `NODE_ENV=nonprod`

### 2. Deploy to Production (`deploy-prod.yml`)

This workflow deploys the application to the production Firebase environment.

- **Trigger**: Manual (workflow_dispatch)
- **Branch Restriction**: Only runs on the `main` branch
- **Confirmation**: Requires typing "DEPLOY-TO-PRODUCTION" to confirm
- **Target**: `fir-labs-prod` Firebase project
- **Environment**: Sets `NODE_ENV=production`

## Setup Requirements

Before using these workflows, configure the following GitHub repository secrets:

| Secret | Purpose |
|--------|---------|
| `FIREBASE_TOKEN_NONPROD` | Firebase CI token for the nonprod project |
| `FIREBASE_TOKEN_PROD` | Firebase CI token for the prod project |
| `GCP_WORKLOAD_IDENTITY_PROVIDER_NONPROD` | WIF provider resource name for nonprod (e.g. `projects/123/locations/global/workloadIdentityPools/my-pool/providers/my-provider`) |
| `GCP_WORKLOAD_IDENTITY_PROVIDER_PROD` | WIF provider resource name for prod |
| `GCP_SERVICE_ACCOUNT_NONPROD` | Service account email impersonated by WIF for nonprod deployments |
| `GCP_SERVICE_ACCOUNT_PROD` | Service account email impersonated by WIF for prod deployments |
| `ADMIN_USER_EMAIL` | Google account email granted `roles/cloudfunctions.invoker` on the health function |
| `INVOKER_SA_EMAIL_NONPROD` | Service account email granted invoker rights on the nonprod health function |
| `INVOKER_SA_EMAIL_PROD` | Service account email granted invoker rights on the prod health function |

Also ensure:
- `.firebaserc` has the correct project aliases (`fir-labs-nonprod` and `fir-labs-prod`)
- `firebase.json` is configured with the services to deploy (functions, remoteconfig)

## Using the Workflows

1. Navigate to the "Actions" tab in your GitHub repository
2. Select the workflow you want to run
3. Click "Run workflow"
4. Select the `main` branch
5. Enter the confirmation text
6. Click "Run workflow"

## Deployment Steps

Each workflow performs the following steps:

1. **Checkout** the repository
2. **Install** Node.js, pnpm, root dependencies, and health function dependencies
3. **Lint and build** the health function TypeScript source
4. **Select deployment scope** (`all` deploys functions + remoteconfig; `remoteconfig` deploys only Remote Config)
5. **Apply environment-specific Remote Config** template
6. **Deploy** to Firebase using the Firebase CLI and a CI token
7. **Authenticate** to Google Cloud using Workload Identity Federation
8. **Enforce IAM invoker bindings** on the deployed Cloud Function (removes public access, grants invoker to admin user and service account)

## Obtaining Firebase CI Tokens

1. Install Firebase CLI locally: `npm install -g firebase-tools`
2. Run `firebase login:ci`
3. A browser window will open — authenticate with your Google account
4. After authentication, a CI token is printed in the terminal
5. Add the token as a GitHub secret (`FIREBASE_TOKEN_NONPROD` or `FIREBASE_TOKEN_PROD`)
6. Repeat for each Firebase project if using separate accounts

## Workload Identity Federation (WIF) Setup

WIF allows GitHub Actions to authenticate with Google Cloud without storing long-lived service account keys.

### 1. Create a Workload Identity Pool

```bash
gcloud iam workload-identity-pools create "github-pool" \
  --project="YOUR_PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

### 2. Create a Provider

```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="YOUR_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### 3. Bind the Provider to a Service Account

```bash
gcloud iam service-accounts add-iam-policy-binding "YOUR_SA@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --project="YOUR_PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/OWNER/REPO"
```

### 4. Add Secrets to GitHub

- `GCP_WORKLOAD_IDENTITY_PROVIDER_NONPROD`: The full resource name of the WIF provider (e.g. `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider`)
- `GCP_SERVICE_ACCOUNT_NONPROD`: The service account email (e.g. `my-sa@my-project.iam.gserviceaccount.com`)

Repeat for the prod environment.

## IAM Invoker Configuration

After each deployment, the workflows enforce a strict IAM invoker policy on the `health` Cloud Function:

1. **Remove public access** (`allUsers` invoker binding is removed if present)
2. **Grant admin user** (`ADMIN_USER_EMAIL`) the `roles/cloudfunctions.invoker` role
3. **Grant invoker service account** (`INVOKER_SA_EMAIL_*`) the `roles/cloudfunctions.invoker` role

This ensures the health function is private and only accessible to authorized identities. When testing deployed functions, use a valid Google Cloud identity token:

```bash
ID_TOKEN="$(gcloud auth print-identity-token)"
curl -H "Authorization: Bearer $ID_TOKEN" \
  https://us-central1-fir-labs-nonprod.cloudfunctions.net/health
```
