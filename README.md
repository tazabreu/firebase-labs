# Firebase Labs

A Firebase project with CI/CD deployment using GitHub Actions.

## Project Structure

- `backend/`: Backend functions and services
  - `health/`: Health check service (Firebase Cloud Function)
    - `integration-tests/`: Integration tests for the health endpoint
- `frontend/`: Frontend web application
- `.github/workflows/`: CI/CD workflows for GitHub Actions

## Deployment

This project uses GitHub Actions for automated deployments following trunk-based development:

- All development happens against the `main` branch
- Manual deployments can be triggered from GitHub Actions:
  - Non-production deployment: `deploy-nonprod.yml` workflow
  - Production deployment: `deploy-prod.yml` workflow

### Deployment Requirements

Before deploying, configure the following GitHub repository secrets:

| Secret | Purpose |
|--------|---------|
| `FIREBASE_TOKEN_NONPROD` | Firebase CI token for the nonprod project |
| `FIREBASE_TOKEN_PROD` | Firebase CI token for the prod project |
| `GCP_WORKLOAD_IDENTITY_PROVIDER_NONPROD` | Workload Identity Federation provider resource name for nonprod |
| `GCP_WORKLOAD_IDENTITY_PROVIDER_PROD` | Workload Identity Federation provider resource name for prod |
| `GCP_SERVICE_ACCOUNT_NONPROD` | Service account email used to impersonate via WIF for nonprod |
| `GCP_SERVICE_ACCOUNT_PROD` | Service account email used to impersonate via WIF for prod |
| `ADMIN_USER_EMAIL` | Google account email to grant `roles/cloudfunctions.invoker` |
| `INVOKER_SA_EMAIL_NONPROD` | Service account email granted invoker rights on nonprod function |
| `INVOKER_SA_EMAIL_PROD` | Service account email granted invoker rights on prod function |

Also verify Firebase project configuration in:
- `.firebaserc`
- `firebase.json`

### Setting Up Firebase CI Tokens

1. **Generate Firebase CI Tokens**:
   ```bash
   # Install Firebase CLI if not already installed
   npm install -g firebase-tools

   # Login and generate a CI token
   firebase login:ci
   ```

   This will open a browser window for authentication and return a token in the terminal.

2. **Add Tokens to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Add a secret named `FIREBASE_TOKEN_NONPROD` with the nonprod token
   - Add a secret named `FIREBASE_TOKEN_PROD` with the production token

### Setting Up Workload Identity Federation (WIF)

WIF allows the GitHub Actions workflows to authenticate with Google Cloud without long-lived service account keys. See the [workflows README](./.github/workflows/README.md#workload-identity-federation-wif-setup) for full setup instructions.

## Local Development

1. Install dependencies:
   ```bash
   pnpm install
   cd backend/health
   pnpm install
   ```

2. Start the health service locally (builds TypeScript and starts Firebase emulators):
   ```bash
   cd backend/health
   pnpm run serve
   ```

3. Test the health endpoint:
   ```bash
   curl http://127.0.0.1:5001/labs-nonprod/us-central1/health
   ```

For more details on running and testing the health service, see [backend/health/README.md](./backend/health/README.md).

## Integration Tests

The `backend/health/integration-tests/` directory contains integration tests that verify the health endpoint across different environments.

```bash
cd backend/health/integration-tests
npm install

# Run against local emulator
npm run test:local

# Run against nonprod environment
npm run test:nonprod
```

See [backend/health/integration-tests/README.md](./backend/health/integration-tests/README.md) for full usage instructions.

## ESLint

The project uses ESLint for code quality. To run linting:

```bash
cd backend/health
pnpm run lint
```

To fix automatically fixable issues:

```bash
cd backend/health
pnpm run lint -- --fix
```

## More Information

For detailed information about deployment workflows, see [.github/workflows/README.md](./.github/workflows/README.md)