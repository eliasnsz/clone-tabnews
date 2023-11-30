test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data.updated_at).toBeDefined();

  const parsedDate = new Date(data.updated_at).toISOString();
  expect(parsedDate).toBe(data.updated_at);

  expect(data.dependencies.database.status).toBe("healthy");
  expect(data.dependencies.database.version).toEqual("16.0");
  expect(data.dependencies.database.max_connections).toEqual(100);
  expect(data.dependencies.database.opened_connections).toEqual(1);
  expect(typeof data.dependencies.database.latency.first_query).toBe("number");
  expect(typeof data.dependencies.database.latency.second_query).toBe("number");
  expect(typeof data.dependencies.database.latency.third_query).toBe("number");
});
