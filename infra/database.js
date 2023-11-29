import { Client } from "pg";

async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    user: process.env.POSTGRES_USER,
  });

  await client.connect();
  const result = await client.query(queryObject);
  await client.end();

  return result;
}

export default {
  query: query,
};
