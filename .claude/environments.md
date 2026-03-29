# Environments

## Overview

| Environment | Git Branch | Frontend | Backend API |
|-------------|------------|----------|-------------|
| **DEV** | `main` | dev.kidpen.space | dev-api.kidpen.space |
| **STAGING** | `staging` | staging.kidpen.space | staging-api.kidpen.space |
| **PRODUCTION** | `PRODUCTION` | kidpen.space | api.kidpen.space |

## Databases (Supabase)

| Environment | Project |
|-------------|---------|
| DEV | heprlhlltebrxydgtsjs |
| STAGING | ujzsbwvurfyeuerxxeaz |
| PRODUCTION | jbriwassebxdwoieikga |

## Promotion Flow

```
main (DEV) → staging (STAGING) → PRODUCTION
```

Use GitHub Actions "Promote Branch" workflow to promote between environments.
