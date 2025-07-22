const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const tableClient = TableClient.fromConnectionString(connectionString, "WishMessages");

  const messages = [];
  const entities = tableClient.listEntities();

  for await (const entity of entities) {
    messages.push({
      name: entity.name,
      message: entity.message,
      via: entity.via,
      timestamp: entity.timestamp
    });
  }

  context.res = { status: 200, body: messages };
};
