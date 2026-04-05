@description('Base name used to derive all resource names')
param baseName string = 'aihack26b'

@description('Azure region for all resources')
param location string = 'eastus2'

param foundryLocations array = [
  { region: 'eastus2', suffix: 'eus2', gpt4oQuota: 10 }
  { region: 'polandcentral', suffix: 'plc', gpt4oQuota: 10 }
  { region: 'swedencentral', suffix: 'swc', gpt4oQuota: 10 }
  { region: 'uaenorth', suffix: 'uaen', gpt4oQuota: 10 }
  { region: 'westus3', suffix: 'wus3', gpt4oQuota: 10 }
]

param webAppPrincipalId string = ''
param principals array = []

var commonTags = {
  SecurityControl: 'Ignore'
}

module azureFoundry 'modules/foundry.bicep' = [for foundryLocation in foundryLocations: {
  name: 'foundry-${foundryLocation.suffix}'
  params: {
    baseName: '${baseName}-${foundryLocation.suffix}'
    location: foundryLocation.region
    tags: commonTags
    deployImage: true
    gpt4oQuota: foundryLocation.gpt4oQuota
    webAppPrincipalId: webAppPrincipalId
    principals: principals
  }
}]
