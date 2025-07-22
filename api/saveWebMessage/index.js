
const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");
const { relayMessage } = require("../shared/relayMessage");

const messagesTable = TableClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING, "messages");

module.exports = async function (context, req) {
  const ip = (req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const { name, message } = req.body;

  if (!name || name.length > 100) {
    context.res = {
      status: 400,
      body: "Name is required and must be under 100 characters.",
    };
    return;
  }

  if (!message || message.length > 300) {
    context.res = { status: 400, body: "Message is required and must be under 300 characters." };
    return;
  }

  const messageEntity = {
    partitionKey: "messages",
    rowKey: uuidv4(),
    name,
    message,
    via: "web",
    timestamp: new Date().toISOString()
  };

  try {
    await messagesTable.createEntity(messageEntity);

  } catch (err) {
    context.res = {
      status: 500,
      body: "Failed to save message.",
    };
    return;
  }

  try {
    await relayMessage(name, message);
  } catch (err) {
    context.log("Relay failed:", err.message);
  }

  context.res = {
    status: 200,
    body: "Message saved from web."
  };
};
