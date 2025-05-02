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

Before using these workflows, you need to configure:

1. GitHub repository secrets:
   - `FIREBASE_SERVICE_ACCOUNT_NONPROD`: Service account key for nonprod environment
   - `FIREBASE_SERVICE_ACCOUNT_PROD`: Service account key for prod environment

2. Firebase project configuration:
   - Ensure `.firebaserc` has the correct project aliases
   - Verify Firebase configuration in `firebase.json`

## Using the Workflows

1. Navigate to the "Actions" tab in your GitHub repository
2. Select the workflow you want to run
3. Click "Run workflow"
4. Select the `main` branch
5. Enter the confirmation text
6. Click "Run workflow"

## Obtaining Firebase Service Account Keys

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file
4. In your GitHub repository, go to Settings > Secrets > Actions
5. Add the content of the JSON file as a secret with the appropriate name # Firebase Service Account Setup

To generate Firebase service account tokens and add them to GitHub:

## Step 1: Generate Firebase CI tokens

1. Install Firebase CLI locally: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login:ci`
3. This will open a browser window - authenticate with your Google account
4. After authentication, you'll receive a token in your terminal
5. Save this token securely - you'll need it for GitHub
6. Repeat for each Firebase project (nonprod and prod) if using different accounts

## Step 2: Add tokens to GitHub Secrets

1. In your GitHub repository, go to Settings > Secrets and variables > Actions
2. Click 'New repository secret'
3. Create a secret named `FIREBASE_TOKEN_NONPROD` with the nonprod CI token
4. Create another secret named `FIREBASE_TOKEN_PROD` with the production CI token

These tokens will be used by the GitHub Actions workflows to authenticate with Firebase.
