import { DefaultAzureCredential } from "@azure/identity";
import sql from "mssql";

const server = process.env.SQL_SERVER;
const database = process.env.SQL_DATABASE;

let pool: sql.ConnectionPool | null = null;

async function getPool(): Promise<sql.ConnectionPool | null> {
  if (!server || !database) return null;
  if (pool?.connected) return pool;

  const credential = new DefaultAzureCredential();
  const tokenResponse = await credential.getToken("https://database.windows.net/.default");

  const config: sql.config = {
    server,
    database,
    options: { encrypt: true, trustServerCertificate: false },
    authentication: {
      type: "azure-active-directory-access-token",
      options: { token: tokenResponse.token },
    },
  };

  pool = await sql.connect(config);
  return pool;
}

export async function markHasWebBuilder(ideaId: string): Promise<void> {
  const db = await getPool();
  if (!db) return;
  await db
    .request()
    .input("ideaId", sql.Int, parseInt(ideaId, 10))
    .query("UPDATE StartupIdeas SET HasWebBuilder = 1, UpdatedAt = GETUTCDATE() WHERE Id = @ideaId AND HasWebBuilder = 0");
}
