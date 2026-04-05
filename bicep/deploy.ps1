
az account set --subscription '873a4995-e21b-47e2-953e-f2e88e2fa4f9'

az group create --name 'rg-ai-hack-2026' --location 'eastus2'

az deployment group create --name 'ai-hack-dev' --resource-group 'rg-ai-hack-2026' --template-file './main-sub1.bicep' --parameters './main-sub1.parameters.dev.json'



az account set --subscription 'a19f8264-3632-4ff6-bde9-7d9e139d2520'

az group create --name 'rg-ai-hack-2026b' --location 'eastus2'

az deployment group create --name 'ai-hack-dev' --resource-group 'rg-ai-hack-2026b' --template-file './main-sub2.bicep' --parameters './main-sub2.parameters.dev.json'

