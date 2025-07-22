const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

  try {
    context.log("getMessage triggered");
    context.log("Request body:", req.body);

    context.res = {
      status: 200,
      body: {
        message: "Hello from getMessage!"
      }
    };
  } catch (error) {
    context.log.error("❌ Error in getMessage:", error);

    context.res = {
      status: 500,
      body: {
        error: "Internal Server Error",
        details: error.message
      }
    };
  }




  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const tableClient = TableClient.fromConnectionString(connectionString, "messages");

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
