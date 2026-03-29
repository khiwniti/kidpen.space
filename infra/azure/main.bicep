// Kidpen.space Azure Infrastructure
// Azure Container Apps with scale-to-zero for cost optimization
// Target: 5M+ requests/day, $2,000/year nonprofit budget

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'prod'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Container registry name')
param containerRegistryName string = 'kidpencr${uniqueString(resourceGroup().id)}'

@description('PostgreSQL admin password')
@secure()
param postgresPassword string

@description('Redis connection password')
@secure()
param redisPassword string

// Variables
var prefix = 'kidpen-${environment}'
var tags = {
  project: 'kidpen'
  environment: environment
  managedBy: 'bicep'
}

// ============================================================================
// Container Apps Environment (Consumption Plan - scale-to-zero)
// ============================================================================
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-11-02-preview' = {
  name: '${prefix}-env'
  location: location
  tags: tags
  properties: {
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
    zoneRedundant: false  // Cost optimization
  }
}

// ============================================================================
// Azure Container Registry (Basic SKU for cost optimization)
// ============================================================================
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: containerRegistryName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// ============================================================================
// Azure PostgreSQL Flexible Server (Burstable B1ms - $13/month)
// ============================================================================
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: '${prefix}-postgres'
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: 'kidpenadmin'
    administratorLoginPassword: postgresPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'  // Cost optimization
    }
    highAvailability: {
      mode: 'Disabled'  // Cost optimization for dev/staging
    }
  }
}

// PostgreSQL Firewall - Allow Azure Services
resource postgresFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// PostgreSQL Database
resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-06-01-preview' = {
  parent: postgresServer
  name: 'kidpen'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// PostgreSQL Extensions (pgvector for AI features)
resource postgresExtensions 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2023-06-01-preview' = {
  parent: postgresServer
  name: 'azure.extensions'
  properties: {
    value: 'vector,uuid-ossp,pgcrypto'
    source: 'user-override'
  }
}

// ============================================================================
// Azure Cache for Redis (Basic C0 - ~$16/month)
// ============================================================================
resource redisCache 'Microsoft.Cache/redis@2023-08-01' = {
  name: '${prefix}-redis'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    redisConfiguration: {
      'maxmemory-policy': 'volatile-lru'
    }
  }
}

// ============================================================================
// Azure Blob Storage (Standard LRS)
// ============================================================================
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'kidpen${uniqueString(resourceGroup().id)}'
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: true  // For static assets
  }
}

// Storage Container for uploads
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/uploads'
  properties: {
    publicAccess: 'None'
  }
}

// Static website hosting for assets
resource staticWebsite 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/$web'
  properties: {
    publicAccess: 'Blob'
  }
}

// ============================================================================
// Azure Front Door (Standard SKU - replaces deprecated CDN)
// ============================================================================
resource frontDoorProfile 'Microsoft.Cdn/profiles@2024-02-01' = {
  name: '${prefix}-afd'
  location: 'global'
  tags: tags
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
}

// Front Door Endpoint
resource frontDoorEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2024-02-01' = {
  parent: frontDoorProfile
  name: '${prefix}-endpoint'
  location: 'global'
  tags: tags
  properties: {
    enabledState: 'Enabled'
  }
}

// Origin Group for Storage
resource storageOriginGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = {
  parent: frontDoorProfile
  name: 'storage-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 100
    }
  }
}

// Storage Origin
resource storageOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = {
  parent: storageOriginGroup
  name: 'storage-origin'
  properties: {
    hostName: '${storageAccount.name}.blob.${az.environment().suffixes.storage}'
    httpPort: 80
    httpsPort: 443
    originHostHeader: '${storageAccount.name}.blob.${az.environment().suffixes.storage}'
    priority: 1
    weight: 1000
  }
}

// Route for static assets
resource staticRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  parent: frontDoorEndpoint
  name: 'static-route'
  properties: {
    originGroup: {
      id: storageOriginGroup.id
    }
    supportedProtocols: ['Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    cacheConfiguration: {
      queryStringCachingBehavior: 'IgnoreQueryString'
      compressionSettings: {
        isCompressionEnabled: true
        contentTypesToCompress: [
          'text/html'
          'text/css'
          'text/javascript'
          'application/javascript'
          'application/json'
          'image/svg+xml'
        ]
      }
    }
  }
  dependsOn: [
    storageOrigin
  ]
}

// ============================================================================
// Container App - Frontend (Next.js)
// ============================================================================
resource frontendApp 'Microsoft.App/containerApps@2023-11-02-preview' = {
  name: '${prefix}-frontend'
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        corsPolicy: {
          allowedOrigins: ['https://kidpen.space', 'https://*.kidpen.space']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          maxAge: 86400
        }
      }
      registries: [
        {
          server: '${containerRegistry.name}.azurecr.io'
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${containerRegistry.name}.azurecr.io/kidpen-frontend:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'NEXT_PUBLIC_API_URL', value: 'https://${prefix}-backend.${containerAppsEnvironment.properties.defaultDomain}' }
            { name: 'NEXT_PUBLIC_CDN_URL', value: 'https://${frontDoorEndpoint.properties.hostName}' }
          ]
        }
      ]
      scale: {
        minReplicas: 0  // Scale to zero!
        maxReplicas: 10
        rules: [
          {
            name: 'http-scale'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// ============================================================================
// Container App - Backend (FastAPI)
// ============================================================================
resource backendApp 'Microsoft.App/containerApps@2023-11-02-preview' = {
  name: '${prefix}-backend'
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8000
        transport: 'http'
        corsPolicy: {
          allowedOrigins: ['https://kidpen.space', 'https://*.kidpen.space']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          maxAge: 86400
        }
      }
      registries: [
        {
          server: '${containerRegistry.name}.azurecr.io'
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'postgres-password'
          value: postgresPassword
        }
        {
          name: 'redis-connection'
          value: 'rediss://:${redisCache.listKeys().primaryKey}@${redisCache.properties.hostName}:6380/0'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: '${containerRegistry.name}.azurecr.io/kidpen-backend:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'ENV_MODE', value: 'production' }
            { name: 'WORKERS', value: '2' }
            { name: 'TIMEOUT', value: '75' }
            { name: 'DATABASE_URL', value: 'postgresql://kidpenadmin:${postgresPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/kidpen?sslmode=require' }
            { name: 'REDIS_URL', secretRef: 'redis-connection' }
            { name: 'STORAGE_ACCOUNT_URL', value: 'https://${storageAccount.name}.${az.environment().suffixes.storage}' }
          ]
        }
      ]
      scale: {
        minReplicas: 0  // Scale to zero!
        maxReplicas: 10
        rules: [
          {
            name: 'http-scale'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// ============================================================================
// Outputs
// ============================================================================
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output frontendUrl string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'
output backendUrl string = 'https://${backendApp.properties.configuration.ingress.fqdn}'
output cdnEndpoint string = 'https://${frontDoorEndpoint.properties.hostName}'
output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output redisHost string = redisCache.properties.hostName
output storageAccountName string = storageAccount.name
