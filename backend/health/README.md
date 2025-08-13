# Health Service

A Firebase Function service that provides health and status information.

## Features

- `/` - Health endpoint with comprehensive status checks of Firebase and external services, including:
  - Service status (UP/DOWN)
  - Downstream API checks (Cat Facts API)
  - Environment information
  - Feature flags from Firebase Remote Config
  - Timestamp of check

## Development

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env.local` file with necessary environment variables (if not already present)

### Running the Service

To run the service locally:

```bash
pnpm run serve
```

This automatically builds the TypeScript code first (via the `preserve` script) and then starts the Firebase emulator.

For active development, you can use two terminals:

**Terminal 1: Watch for code changes**
```bash
pnpm run build:watch
```

**Terminal 2: Run the emulator**
```bash
pnpm run serve
```

### Testing the Endpoints

#### Local Testing (Emulator)

Once the emulator is running, you can test the endpoints:

```bash
# Health endpoint
curl http://localhost:5001/[PROJECT_ID]/us-central1/health
```

Replace `[PROJECT_ID]` with your Firebase project ID.

#### Testing Deployed Functions

For testing deployed functions, you'll need authentication tokens. Get an ID token using gcloud:

```bash
# Get your ID token for authentication
ID_TOKEN="$(gcloud auth print-identity-token)"
```

**Testing Non-Production Environment (`fir-labs-nonprod`):**

```bash
# Health endpoint
curl -H "Authorization: Bearer $ID_TOKEN" \
  https://us-central1-fir-labs-nonprod.cloudfunctions.net/health
```

**Testing Production Environment (`fir-labs-prod`):**

```bash
# Health endpoint
curl -H "Authorization: Bearer $ID_TOKEN" \
  https://us-central1-fir-labs-prod.cloudfunctions.net/health
```

#### Authentication Requirements

- **Local Development**: No authentication required when using Firebase emulators
- **Deployed Environments**: Requires valid Google Cloud authentication
  - Ensure you're logged in: `gcloud auth login`
  - Your account must have proper IAM permissions for the target Firebase project
  - ID tokens are valid for 1 hour and will need to be refreshed for extended testing sessions

#### Validation Results

**✅ Non-Production Environment (`fir-labs-nonprod`)** - Tested: 2025-08-13
```json
{
  "status": "UP",
  "timestamp": "2025-08-13T01:38:38.455Z",
  "downstreamApis": {
    "catFacts": {
      "status": "UP",
      "responseTime": 89,
      "url": "https://catfact.ninja/fact"
    }
  },
  "feature-flags": {
    "health_sample_message": "all-good-nonprod",
    "health_env_label": "nonprod"
  },
  "environmentLabel": "nonprod"
}
```

**✅ Production Environment (`fir-labs-prod`)** - Tested: 2025-08-13
```json
{
  "status": "UP",
  "timestamp": "2025-08-13T01:38:22.987Z",
  "downstreamApis": {
    "catFacts": {
      "status": "UP",
      "responseTime": 90,
      "url": "https://catfact.ninja/fact"
    }
  },
  "feature-flags": {
    "health_sample_message": "all-good-prod",
    "health_env_label": "prod"
  },
  "environmentLabel": "prod"
}
```

**✅ Local Emulator Environment** - Tested: 2025-08-13
```json
{
  "status": "UP",
  "timestamp": "2025-08-13T01:41:28.906Z",
  "downstreamApis": {
    "catFacts": {
      "status": "UP",
      "responseTime": 1711,
      "url": "https://catfact.ninja/fact"
    }
  },
  "feature-flags": {
    "health_sample_message": "all-good-nonprod",
    "health_env_label": "nonprod"
  },
  "environmentLabel": "nonprod"
}
```

All environments (production, non-production, and local emulator) are functioning correctly and returning clean health status responses with proper environment labeling via Firebase Remote Config. The hardcoded `"environment": "production"` field has been removed.

### Other Commands

- `pnpm run build` - Build the TypeScript code
- `pnpm run lint` - Run ESLint to check code quality
- `pnpm run test` - Run Jest tests
- `pnpm run deploy` - Deploy the function to Firebase 