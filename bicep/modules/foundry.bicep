param baseName string
param location string
param tags object = {}

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
    capacity: 1800
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

output accountName string = aiHub.name
output endpoint string = aiHub.properties.endpoint
output deploymentName string = gpt4oDeployment.name
output projectName string = aiProject.name
output location string = location
