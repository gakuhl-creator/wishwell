const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");
const { relayMessage } = require("../shared/relayMessage");

module.exports = async function (context, req) {
  // 🧩 Handle Event Grid subscription validation handshake
  if (req.headers && req.headers.aeg_event_type === "SubscriptionValidation") {
    const validationCode = req.body?.data?.validationCode;
    context.log("Event Grid subscription validation event received:", validationCode);

    context.res = {
      status: 200,
      body: {
        validationResponse: validationCode,
      },
    };
    return;
  }
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    context.res = {
      status: 500,
      body: "Storage connection string not configured.",
    };
    return;
  }

  const ratelimitTable = TableClient.fromConnectionString(connectionString, "ratelimits");
  const messagesTable = TableClient.fromConnectionString(connectionString, "messages");
  const ip = (req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now();
  // 1 text per minute per person. Bills bills bills am I right?
  const windowMs = 60000;
  const limit = 1;

  // Rate Limiting
  try {
    const entity = await ratelimitTable.getEntity("rate", ip);
    const timestamps = JSON.parse(entity.timestamps);
    const recent = timestamps.filter((ts) => now - ts < windowMs);

    if (recent.length >= limit) {
      context.res = {
        status: 429,
        body: "Rate limit exceeded. Please try again later.",
      };
      return;
    }

    recent.push(now);
    await ratelimitTable.updateEntity(
      {
        partitionKey: "rate",
        rowKey: ip,
        timestamps: JSON.stringify(recent),
      },
      "Replace"
    );
  } catch (e) {
    if (e.statusCode === 404) {
      // Entity not found — first request from this IP
      await ratelimitTable.createEntity({
        partitionKey: "rate",
        rowKey: ip,
        timestamps: JSON.stringify([now]),
      });
    } else {
      // Unexpected error — bubble it up or return a 500
      context.res = {
        status: 500,
        body: "Internal server error during rate limit check.",
      };
      return;
    }
  }



  // Validate and save message
  const { name, message } = req.body || {};
  if (!name || !message) {
    context.res = {
      status: 400,
      body: "Missing 'name' or 'message' in request body.",
    };
    return;
  }

  const messageEntity = {
    partitionKey: "messages",
    rowKey: uuidv4(),
    name,
    message,
    via: "cell",
    timestamp: new Date().toISOString(),
    ip,
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
    body: { message: "Message saved from cell." }
  };
};
