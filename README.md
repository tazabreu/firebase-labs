# Firebase Labs

A Firebase project with CI/CD deployment using GitHub Actions.

## Project Structure

- `backend/`: Backend functions and services
  - `health/`: Health check service
  - `cqrs-demo/`: CQRS pattern demo service
- `frontend/`: Frontend web application
- `.github/workflows/`: CI/CD workflows for GitHub Actions

## Deployment

This project uses GitHub Actions for automated deployments following trunk-based development:

- All development happens against the `main` branch
- Manual deployments can be triggered from GitHub Actions:
  - Non-production deployment: `deploy-nonprod.yml` workflow
  - Production deployment: `deploy-prod.yml` workflow

### Deployment Requirements

Before deploying:

1. Set up Firebase CI tokens as GitHub secrets:
   - `FIREBASE_TOKEN_NONPROD`
   - `FIREBASE_TOKEN_PROD`

2. Verify Firebase project configuration in:
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

## Local Development

1. Install dependencies:
   ```
   pnpm install
   cd backend/health
   pnpm install
   ```

2. Start Firebase emulators:
   ```
   firebase emulators:start
   ```

3. Test function locally:
   ```
   curl http://127.0.0.1:5001/labs-nonprod/us-central1/http
   ```

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