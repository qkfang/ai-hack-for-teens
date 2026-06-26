
az account set --subscription '873a4995-e21b-47e2-953e-f2e88e2fa4f9'

az group create --name 'rg-ai-hack-2026' --location 'eastus2'

az deployment group create --name 'ai-hack-dev' --resource-group 'rg-ai-hack-2026' --template-file './main-sub1.bicep' --parameters './main-sub1.parameters.dev.json'

