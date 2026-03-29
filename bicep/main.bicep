@description('Base name used to derive all resource names')
param baseName string = 'aihack26'

@description('Azure region for all resources')
param location string = 'eastus2'

param azureAIFoundryEndpoint string = 'https://fsi-foundry.openai.azure.com'
param azureAIFoundryDeployment string = 'gpt-4o'
param azureAIFoundryDalleDeployment string = 'gpt-image-1'
param azureAIFoundryTenantId string = '9d2116ce-afe6-4ce8-8bc3-c7c7b69856c2'

@description('Azure AD admin login name (UPN) for SQL Server')
param sqlAadAdminLogin string

@description('Azure AD admin object ID for SQL Server')
param sqlAadAdminObjectId string

var uniqueSuffix = uniqueString(resourceGroup().id)
var keyVaultName = '${baseName}-kv'
var storageAccountName = '${baseName}st'
var appInsightsName = '${baseName}-appi'
var logAnalyticsWorkspaceName = '${baseName}-log'
var webAppName = '${baseName}-app'
var appServicePlanName = '${baseName}-asp'
var staticWebAppName = '${baseName}-swa'
var sqlServerName = '${baseName}-sql'

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
  }
}

module webApp 'modules/webapp.bicep' = {
  name: 'webAppDeployment'
  params: {
    name: webAppName
    location: location
    appServicePlanName: appServicePlanName
    appInsightsConnectionString: appInsights.outputs.connectionString
    azureAIFoundryEndpoint: azureAIFoundryEndpoint
    azureAIFoundryDeployment: azureAIFoundryDeployment
    azureAIFoundryDalleDeployment: azureAIFoundryDalleDeployment
    azureAIFoundryTenantId: azureAIFoundryTenantId
    sqlConnectionString: sqlServer.outputs.connectionString
  }
}

module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'staticWebAppDeployment'
  params: {
    name: staticWebAppName
    location: location
  }
}

output keyVaultName string = keyVault.outputs.name
output keyVaultUri string = keyVault.outputs.uri
output storageAccountName string = storageAccount.outputs.name
output appInsightsName string = appInsights.outputs.name
output appInsightsConnectionString string = appInsights.outputs.connectionString
output webAppName string = webApp.outputs.name
output webAppHostName string = webApp.outputs.defaultHostName
output staticWebAppName string = staticWebApp.outputs.name
output staticWebAppHostName string = staticWebApp.outputs.defaultHostName
output sqlServerName string = sqlServer.outputs.serverName
output sqlServerFqdn string = sqlServer.outputs.serverFqdn
