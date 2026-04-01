param baseName string
param location string
param modelName string = 'gpt-4o'
param modelFormat string = 'OpenAI'
param modelVersion string = '2024-05-13'
param accountSkuName string = 'S0'
param deploymentName string = 'gpt-4o'
param deploymentSkuName string = 'Standard'
param deploymentCapacity int = 1

var locationTag = toLower(replace(location, ' ', ''))
var uniqueFragment = toLower(substring(uniqueString(resourceGroup().id, location), 0, 6))
var accountName = toLower('${baseName}${locationTag}${uniqueFragment}')

resource openAi 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: accountName
  location: location
  kind: 'OpenAI'
  sku: {
    name: accountSkuName
  }
  properties: {
    customSubDomainName: accountName
    publicNetworkAccess: 'Enabled'
  }
}

resource gptDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  name: deploymentName
  parent: openAi
  sku: {
    name: deploymentSkuName
    capacity: deploymentCapacity
  }
  properties: {
    model: {
      format: modelFormat
      name: modelName
      version: modelVersion
    }
  }
}

output accountName string = openAi.name
output endpoint string = openAi.properties.endpoint
output deploymentName string = gptDeployment.name
output location string = location
