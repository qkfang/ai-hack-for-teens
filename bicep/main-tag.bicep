@description('Base name used to derive all resource names')
param baseName string = 'aihack26'

@description('Azure region for all resources')
param location string = 'eastus2'

param principals array = []

var commonTags = {
  SecurityControl: 'Ignore'
}
var storageAccountName = '${baseName}st'

module storageAccount 'modules/storage.bicep' = {
  name: 'storageAccountDeployment'
  params: {
    name: storageAccountName
    location: location
    tags: commonTags
    principals: principals
  }
}
