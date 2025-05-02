# GitHub Configuration

This directory contains GitHub-specific configuration for the Firebase Labs project.

## Contents

- **workflows/**: Contains GitHub Actions workflow definitions for CI/CD
  - `deploy-nonprod.yml`: Workflow for deploying to non-production environment
  - `deploy-prod.yml`: Workflow for deploying to production environment

## Prerequisites

To use these GitHub configurations:

1. The repository must be hosted on GitHub
2. Firebase service account credentials must be configured as GitHub secrets
3. Branch protection should be enabled for the `main` branch

## Additional Information

For detailed information about the deployment workflows, see the [workflows README](./workflows/README.md). 