
const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");
const { relayMessage } = require("../shared/relayMessage");

module.exports = async function (context, req) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const { from, message } = req.body;

  if (!from || !message) {
    context.res = { status: 400, body: "Missing sender or message." };
    return;
  }

  const name = "User-" + from.slice(-4);

  const tableClient = TableClient.fromConnectionString(connectionString, "WishMessages");
  await tableClient.createEntity({
    partitionKey: "Messages",
    rowKey: uuidv4(),
    name,
    message,
    via: "sms",
    timestamp: new Date().toISOString()
  });

  try {
    await relayMessage(name, message);
  } catch (err) {
    context.log("Relay failed:", err.message);
  }

  context.res = { status: 200, body: "Message saved from SMS." };
};
