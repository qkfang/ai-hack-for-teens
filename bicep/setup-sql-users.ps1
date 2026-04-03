$token = (az account get-access-token --resource https://database.windows.net/ --query accessToken -o tsv)

Invoke-Sqlcmd -ServerInstance "aihack26-sql.database.windows.net" -Database "ai-hack-db-dev" -AccessToken $token -Query @"
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'sp-demo-01')
    CREATE USER [sp-demo-01] FROM EXTERNAL PROVIDER;
ALTER ROLE db_owner ADD MEMBER [sp-demo-01];
"@

Invoke-Sqlcmd -ServerInstance "aihack26-sql.database.windows.net" -Database "ai-hack-db-dev" -AccessToken $token -Query @"
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'aihack26-app')
    CREATE USER [aihack26-app] FROM EXTERNAL PROVIDER;
ALTER ROLE db_owner ADD MEMBER [aihack26-app];
"@
