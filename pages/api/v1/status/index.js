import database from "infra/database";

export default async function status(request, response) {
  const updatedAt = new Date().toISOString();

  async function checkDatabaseHealth() {
    let health;

    try {
      const firstTimerInit = performance.now();
      const [maxConnectionsResult, superuserReservedConnectionsResult] =
        await database.query(
          "SHOW max_connections; SHOW superuser_reserved_connections",
        );
      const maxConnectionsValue = maxConnectionsResult.rows[0].max_connections;
      const superuserReservedConnectionsValue =
        superuserReservedConnectionsResult.rows[0]
          .superuser_reserved_connections;
      const firstQueryDuration = performance.now() - firstTimerInit;

      const secondTimerInit = performance.now();

      const databaseName = process.env.POSTGRES_DB;
      const query =
        "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;";

      const openedConnectionsResult = await database.query({
        text: query,
        values: [databaseName],
      });

      const openedConnectionsValue = openedConnectionsResult.rows[0].count;
      const secondQueryDuration = performance.now() - secondTimerInit;

      const thirdTimerInit = performance.now();
      const versionResult = await database.query("SHOW server_version");
      const versionValue = versionResult.rows[0].server_version;
      const thirdQueryDuration = performance.now() - thirdTimerInit;

      health = {
        status: "healthy",
        version: versionValue,
        max_connections: parseInt(maxConnectionsValue),
        opened_connections: openedConnectionsValue,
        latency: {
          first_query: firstQueryDuration,
          second_query: secondQueryDuration,
          third_query: thirdQueryDuration,
        },
      };
    } catch (error) {
      console.log(error);
      health = {
        status: "unhealthy",
      };
    }

    return health;
  }

  const result = {
    updated_at: updatedAt,
    dependencies: {
      database: await checkDatabaseHealth(),
    },
  };

  response.status(200).json(result);
}
