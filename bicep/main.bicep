@description('Base name used to derive all resource names')
param baseName string = 'aihack26'

@description('Azure region for all resources')
param location string = 'eastus2'

param azureAIFoundryEndpoint string = 'https://fsi-foundry.openai.azure.com'
param azureAIFoundryDeployment string = 'gpt-4o'
param azureAIFoundryDalleDeployment string = 'gpt-image-1'
param azureAIFoundryTenantId string = '9d2116ce-afe6-4ce8-8bc3-c7c7b69856c2'
param foundryLocations array = [
  { region: 'francecentral', suffix: 'frc', image: false, gpt4oQuota: 1800 }
  { region: 'japaneast', suffix: 'jpe', image: false, gpt4oQuota: 1800 }
  { region: 'southafricanorth', suffix: 'san', image: false, gpt4oQuota: 1800 }
  { region: 'southcentralus', suffix: 'scus', image: false, gpt4oQuota: 1800 }
  { region: 'southindia', suffix: 'sin', image: false, gpt4oQuota: 1800 }
  { region: 'spaincentral', suffix: 'spc', image: false, gpt4oQuota: 1800 }
  { region: 'switzerlandnorth', suffix: 'swzn', image: false, gpt4oQuota: 1800 }
  { region: 'switzerlandwest', suffix: 'swzw', image: false, gpt4oQuota: 1800 }
  { region: 'uksouth', suffix: 'uks', image: false, gpt4oQuota: 1800 }
  { region: 'westeurope', suffix: 'we', image: false, gpt4oQuota: 1800 }
  { region: 'westus', suffix: 'wus', image: false, gpt4oQuota: 800 }
  
  { region: 'eastus2', suffix: 'eus2', image: true, gpt4oQuota: 800 }
  { region: 'polandcentral', suffix: 'plc', image: true, gpt4oQuota: 1800 }
  { region: 'swedencentral', suffix: 'swc', image: true, gpt4oQuota: 1800 }
  { region: 'uaenorth', suffix: 'uaen', image: true, gpt4oQuota: 1800 }
  { region: 'westus3', suffix: 'wus3', image: true, gpt4oQuota: 1800 }
]

@description('Azure AD admin login name (UPN) for SQL Server')
param sqlAadAdminLogin string

@description('Azure AD admin object ID for SQL Server')
param sqlAadAdminObjectId string
param principals array = []

var uniqueSuffix = uniqueString(resourceGroup().id)
var commonTags = {
  SecurityControl: 'Ignore'
}
var keyVaultName = '${baseName}-kv'
var storageAccountName = '${baseName}st'
var appInsightsName = '${baseName}-appi'
var logAnalyticsWorkspaceName = '${baseName}-log'
var webAppHackName = '${baseName}-app'
var webAppHackPlanName = '${baseName}-asp'
var webAppBuilderName = '${baseName}-builder'
var webAppBuilderPlanName = '${baseName}-builder-asp'
var staticWebAppName = '${baseName}-swa'
var sqlServerName = '${baseName}-sql'

module azureFoundry 'modules/foundry.bicep' = [for foundryLocation in foundryLocations: {
  name: 'foundry-${foundryLocation.suffix}'
  params: {
    baseName: '${baseName}-${foundryLocation.suffix}'
    location: foundryLocation.region
    tags: commonTags
    deployImage: foundryLocation.image
    gpt4oQuota: foundryLocation.gpt4oQuota
    webAppPrincipalId: webAppHack.outputs.principalId
    principals: principals
  }
}]

module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVaultDeployment'
  params: {
    name: keyVaultName
    location: location
  }
}

module storageAccount 'modules/storage.bicep' = {
  name: 'storageAccountDeployment'
  params: {
    name: storageAccountName
    location: location
    tags: commonTags
    webAppPrincipalId: webAppHack.outputs.principalId
    webAppBuilderPrincipalId: webAppBuilder.outputs.principalId
    principals: principals
  }
}

module appInsights 'modules/appinsights.bicep' = {
  name: 'appInsightsDeployment'
  params: {
    name: appInsightsName
    location: location
    workspaceName: logAnalyticsWorkspaceName
  }
}

module sqlServer 'modules/sqlserver.bicep' = {
  name: 'sqlServerDeployment'
  params: {
    name: sqlServerName
    location: location
    aadAdminLogin: sqlAadAdminLogin
    aadAdminObjectId: sqlAadAdminObjectId
    tags: commonTags
  }
}

module webAppHack 'modules/webapp-hack.bicep' = {
  name: 'webAppHackDeployment'
  params: {
    name: webAppHackName
    location: location
    appServicePlanName: webAppHackPlanName
    appInsightsConnectionString: appInsights.outputs.connectionString
    azureAIFoundryEndpoint: azureAIFoundryEndpoint
    azureAIFoundryDeployment: azureAIFoundryDeployment
    azureAIFoundryDalleDeployment: azureAIFoundryDalleDeployment
    azureAIFoundryTenantId: azureAIFoundryTenantId
    sqlConnectionString: sqlServer.outputs.connectionString
    storageAccountName: storageAccountName
  }
}

module webAppBuilder 'modules/webapp-builder.bicep' = {
  name: 'webAppBuilderDeployment'
  params: {
    name: webAppBuilderName
    location: location
    appServicePlanName: webAppBuilderPlanName
    appInsightsConnectionString: appInsights.outputs.connectionString
    storageAccountName: storageAccountName
    sqlServerFqdn: sqlServer.outputs.serverFqdn
    sqlDatabase: sqlServer.outputs.databaseName
  }
}

module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'staticWebAppDeployment'
  params: {
    name: staticWebAppName
    location: location
  }
}
