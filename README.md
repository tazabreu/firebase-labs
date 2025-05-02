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

1. Set up Firebase service account keys as GitHub secrets:
   - `FIREBASE_SERVICE_ACCOUNT_NONPROD`
   - `FIREBASE_SERVICE_ACCOUNT_PROD`

2. Verify Firebase project configuration in:
   - `.firebaserc`
   - `firebase.json`

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

## More Information

For detailed information about deployment workflows, see [.github/workflows/README.md](./.github/workflows/README.md)