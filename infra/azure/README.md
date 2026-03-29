# Kidpen.space Azure Infrastructure

Azure-only deployment configuration for Kidpen Thai STEM education platform with scale-to-zero architecture.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Azure Cloud (Southeast Asia)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────────────────────────────────┐   │
│  │  Azure CDN   │───▶│         Azure Container Apps              │   │
│  │ (Static)     │    │         (Consumption Plan)                │   │
│  └──────────────┘    │  ┌─────────────┐  ┌──────────────┐       │   │
│                      │  │  Frontend   │  │   Backend    │       │   │
│                      │  │  (Next.js)  │  │  (FastAPI)   │       │   │
│                      │  │  0-10 inst  │  │  0-10 inst   │       │   │
│                      │  └─────────────┘  └──────────────┘       │   │
│                      └───────────────────────┬──────────────────┘   │
│                                              │                       │
│        ┌─────────────────────────────────────┼───────────────────┐   │
│        │                                     ▼                   │   │
│  ┌─────┴─────┐   ┌──────────────┐   ┌──────────────┐             │   │
│  │  Blob     │   │  PostgreSQL  │   │    Redis     │             │   │
│  │  Storage  │   │  Flexible    │   │   Basic C0   │             │   │
│  │  (LRS)    │   │  B1ms        │   │              │             │   │
│  └───────────┘   └──────────────┘   └──────────────┘             │   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Cost Breakdown (~$166/month, ~$1,992/year)

| Service | SKU | Monthly Cost | Notes |
|---------|-----|--------------|-------|
| Container Apps | Consumption | ~$60-90 | Scale-to-zero, pay per use |
| PostgreSQL | B1ms | ~$13 | 1 vCore, 2GB RAM, 32GB storage |
| Redis | Basic C0 | ~$16 | 250MB cache |
| Container Registry | Basic | ~$5 | 10GB storage |
| Blob Storage | Standard LRS | ~$5-10 | Variable based on usage |
| CDN | Standard Microsoft | ~$0-10 | First 10GB/month free |
| **Total** | | **~$166/month** | **~$1,992/year** ✅ |

## Scale-to-Zero Benefits

- **No idle costs**: Apps scale to 0 instances during low traffic
- **Automatic scaling**: Up to 10 instances per app based on HTTP requests
- **Cold start**: ~2-5 seconds for first request after scale-down
- **Perfect for**: Education platform with predictable usage patterns (school hours)

## Prerequisites

1. **Azure CLI** installed and configured
   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   az login
   ```

2. **Docker** for building container images
   ```bash
   docker --version
   ```

3. **Bicep CLI** (installed with Azure CLI)
   ```bash
   az bicep version
   ```

## Deployment

### Quick Start (Development)

```bash
# Make deploy script executable
chmod +x infra/azure/deploy.sh

# Deploy everything to dev environment
./infra/azure/deploy.sh dev

# Deploy infrastructure only
./infra/azure/deploy.sh dev --infra-only

# Deploy apps only (after infra exists)
./infra/azure/deploy.sh dev --apps-only
```

### Production Deployment

```bash
# Create Key Vault for secrets first
az keyvault create \
  --name kidpen-prod-kv \
  --resource-group kidpen-prod-rg \
  --location southeastasia

# Store secrets
az keyvault secret set --vault-name kidpen-prod-kv --name postgres-password --value "YOUR_SECURE_PASSWORD"

# Deploy
./infra/azure/deploy.sh prod
```

### Manual Bicep Deployment

```bash
# Create resource group
az group create --name kidpen-prod-rg --location southeastasia

# Deploy infrastructure
az deployment group create \
  --resource-group kidpen-prod-rg \
  --template-file infra/azure/main.bicep \
  --parameters @infra/azure/parameters.prod.json
```

## Custom Domain Setup

1. **Add DNS Records**
   ```
   Type: CNAME
   Name: @  (or www)
   Value: kidpen-prod-frontend.<region>.azurecontainerapps.io
   ```

2. **Configure in Azure**
   ```bash
   az containerapp hostname add \
     -n kidpen-prod-frontend \
     -g kidpen-prod-rg \
     --hostname kidpen.space

   az containerapp hostname bind \
     -n kidpen-prod-frontend \
     -g kidpen-prod-rg \
     --hostname kidpen.space \
     --environment kidpen-prod-env
   ```

3. **Enable Managed SSL**
   ```bash
   az containerapp hostname bind \
     -n kidpen-prod-frontend \
     -g kidpen-prod-rg \
     --hostname kidpen.space \
     --certificate-type ManagedCertificate
   ```

## Environment Variables

### Frontend (Container App)
| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | Backend URL |
| `NEXT_PUBLIC_CDN_URL` | CDN endpoint for static assets |

### Backend (Container App)
| Variable | Description |
|----------|-------------|
| `ENV_MODE` | `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `STORAGE_ACCOUNT_URL` | Blob storage URL |
| `OPENAI_API_KEY` | OpenAI API key (add manually) |
| `ANTHROPIC_API_KEY` | Anthropic API key (add manually) |

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Build and Push Images
        run: |
          az acr login --name kidpencr
          docker build -t kidpencr.azurecr.io/kidpen-frontend:${{ github.sha }} -f apps/frontend/Dockerfile .
          docker push kidpencr.azurecr.io/kidpen-frontend:${{ github.sha }}

      - name: Deploy Container App
        run: |
          az containerapp update \
            -n kidpen-prod-frontend \
            -g kidpen-prod-rg \
            --image kidpencr.azurecr.io/kidpen-frontend:${{ github.sha }}
```

## Monitoring & Alerts

### Enable Application Insights
```bash
az monitor app-insights component create \
  --app kidpen-insights \
  --location southeastasia \
  --resource-group kidpen-prod-rg
```

### Set up Cost Alerts
```bash
az consumption budget create \
  --budget-name kidpen-monthly-budget \
  --resource-group kidpen-prod-rg \
  --amount 200 \
  --time-grain Monthly \
  --category Cost
```

## Scaling Configuration

Current auto-scaling rules:

| App | Min Replicas | Max Replicas | Scale Trigger |
|-----|--------------|--------------|---------------|
| Frontend | 0 | 10 | 100 concurrent requests |
| Backend | 0 | 10 | 50 concurrent requests |

### Adjust Scaling
```bash
# Increase max replicas for high traffic
az containerapp update \
  -n kidpen-prod-frontend \
  -g kidpen-prod-rg \
  --min-replicas 1 \
  --max-replicas 20
```

## Troubleshooting

### View Logs
```bash
# Stream logs
az containerapp logs show \
  -n kidpen-prod-frontend \
  -g kidpen-prod-rg \
  --follow

# View system logs
az containerapp logs show \
  -n kidpen-prod-frontend \
  -g kidpen-prod-rg \
  --type system
```

### Check App Status
```bash
az containerapp show \
  -n kidpen-prod-frontend \
  -g kidpen-prod-rg \
  --query "{name:name, status:properties.runningStatus, url:properties.configuration.ingress.fqdn}"
```

### Restart App
```bash
az containerapp revision restart \
  -n kidpen-prod-frontend \
  -g kidpen-prod-rg \
  --revision <revision-name>
```

## Security Checklist

- [ ] Enable managed identity for Container Apps
- [ ] Configure Key Vault for secrets management
- [ ] Enable Azure Defender for Container Registry
- [ ] Set up network isolation with VNet
- [ ] Configure WAF rules (if using Front Door later)
- [ ] Enable audit logging
- [ ] Set up RBAC for team access

## Files

```
infra/azure/
├── main.bicep           # Main infrastructure template
├── parameters.dev.json   # Development parameters
├── parameters.prod.json  # Production parameters (uses Key Vault)
├── deploy.sh            # Deployment script
└── README.md            # This file
```
