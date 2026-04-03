param baseName string
param location string
param tags object = {}
param deployImage bool = true
param gpt4oQuota int = 1800
param webAppPrincipalId string = ''
param userObjectId string = ''

var resourcePrefix = toLower(baseName)

resource aiHub 'Microsoft.CognitiveServices/accounts@2025-10-01-preview' = {
  name: 'foundry-${resourcePrefix}'
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  sku: {
    name: 'S0'
  }
  kind: 'AIServices'
  properties: {
    allowProjectManagement: true
    customSubDomainName: 'foundry-${resourcePrefix}'
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: true
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

resource aiProject 'Microsoft.CognitiveServices/accounts/projects@2025-06-01' = {
  parent: aiHub
  name: '${resourcePrefix}-project'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {}
}

resource gpt4oDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01' = {
  parent: aiHub
  name: 'gpt-4o'
  sku: {
    name: 'GlobalStandard'
    capacity: gpt4oQuota
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: '2024-11-20'
    }
    versionUpgradeOption: 'OnceNewDefaultVersionAvailable'
    raiPolicyName: 'Microsoft.DefaultV2'
  }
}

resource gptImage1Deployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01' = if (deployImage) {
  parent: aiHub
  name: 'gpt-image-1'
  dependsOn: [gpt4oDeployment]
  sku: {
    name: 'GlobalStandard'
    capacity: 6
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-image-1'
    }
    raiPolicyName: 'Microsoft.DefaultV2'
  }
}

var cognitiveServicesOpenAIUserRoleId = '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
var cognitiveServicesUserRoleId = 'a97b65f3-24c7-4388-baec-2e87135dc908'

resource webAppRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(webAppPrincipalId)) {
  name: guid(aiHub.id, webAppPrincipalId, cognitiveServicesOpenAIUserRoleId)
  scope: aiHub
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesOpenAIUserRoleId)
    principalId: webAppPrincipalId
    principalType: 'ServicePrincipal'
  }
}

resource userRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(userObjectId)) {
  name: guid(aiHub.id, userObjectId, cognitiveServicesOpenAIUserRoleId)
  scope: aiHub
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesOpenAIUserRoleId)
    principalId: userObjectId
    principalType: 'User'
  }
}

resource webAppCogServicesUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(webAppPrincipalId)) {
  name: guid(aiHub.id, webAppPrincipalId, cognitiveServicesUserRoleId)
  scope: aiHub
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesUserRoleId)
    principalId: webAppPrincipalId
    principalType: 'ServicePrincipal'
  }
}

resource userCogServicesUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(userObjectId)) {
  name: guid(aiHub.id, userObjectId, cognitiveServicesUserRoleId)
  scope: aiHub
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesUserRoleId)
    principalId: userObjectId
    principalType: 'User'
  }
}

output accountName string = aiHub.name
output endpoint string = aiHub.properties.endpoint
output deploymentName string = gpt4oDeployment.name
output projectName string = aiProject.name
output location string = location
