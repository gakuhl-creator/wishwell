const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  try {
    context.log("getMessage triggered");

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined");
    }

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

    context.res = {
      status: 200,
      body: messages
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
};
