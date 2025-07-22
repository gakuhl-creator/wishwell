
const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");
const { relayMessage } = require("../shared/relayMessage");

module.exports = async function (context, req) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const { name, message } = req.body;

  if (!message || message.length > 300) {
    context.res = { status: 400, body: "Message is required and must be under 300 characters." };
    return;
  }

  const tableClient = TableClient.fromConnectionString(connectionString, "WishMessages");
  await tableClient.createEntity({
    partitionKey: "Messages",
    rowKey: uuidv4(),
    name: name?.trim() || "Anonymous",
    message,
    via: "web",
    timestamp: new Date().toISOString()
  });

  try {
    await relayMessage(name, message);
  } catch (err) {
    context.log("Relay failed:", err.message);
  }

  context.res = { status: 200, body: "Message saved from web." };
};
