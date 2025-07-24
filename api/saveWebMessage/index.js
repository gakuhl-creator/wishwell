const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");
const { relayMessage } = require("../shared/relayMessage");
const sanitizeHtml = require("sanitize-html");

const MAX_RETRIES = 3;
const BASE_DELAY = 500; // ms
const TIMEOUT_MS = 5000;

function withTimeout(promise, ms = TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
  ]);
}

function isTransientError(err) {
  return (
    err.code === "ECONNRESET" ||
    err.code === "ETIMEDOUT" ||
    (err.statusCode && err.statusCode >= 500)
  );
}

function isRateLimitError(err) {
  return err.statusCode === 429;
}

async function retryWithBackoff(fn, maxRetries = MAX_RETRIES, baseDelay = BASE_DELAY) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || (!isTransientError(err) && !isRateLimitError(err))) throw err;

      const jitter = Math.random() * 100;
      const delay =
        isRateLimitError(err)
          ? parseInt(err.response?.headers?.["retry-after"]) * 1000 || baseDelay
          : baseDelay * 2 ** (attempt - 1) + jitter;

      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

function sanitizeInput(input) {
  return sanitizeHtml(input.trim());
}

module.exports = async function (context, req) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    context.res = {
      status: 500,
      body: "Storage connection string is not configured.",
    };
    return;
  }

  const messagesTable = TableClient.fromConnectionString(connectionString, "messages");
  const ip = (req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();

  const rawName = req.body?.name || "";
  const rawMessage = req.body?.message || "";
  const name = sanitizeInput(rawName);
  const message = sanitizeInput(rawMessage);

  if (!name || name.length > 100) {
    context.res = {
      status: 400,
      body: "Name is required and must be under 100 characters.",
    };
    return;
  }

  if (!message || message.length > 300) {
    context.res = {
      status: 400,
      body: "Message is required and must be under 300 characters.",
    };
    return;
  }

  const messageEntity = {
    partitionKey: "messages",
    rowKey: uuidv4(),
    name,
    message,
    via: "web",
    timestamp: new Date().toISOString(),
    ip,
  };

  try {
    await retryWithBackoff(() => withTimeout(messagesTable.createEntity(messageEntity)));
  } catch (err) {
    context.log("Storage error:", err.message || err);
    context.res = {
      status: 500,
      body: "Failed to save message. Please try again shortly.",
    };
    return;
  }

  try {
    await retryWithBackoff(() => withTimeout(relayMessage(name, message)));
  } catch (err) {
    context.log("Relay failed:", err.message || err);
    // Don't fail the request if relay fails—storage succeeded
  }

  context.res = {
    status: 200,
    body: { message: "Message saved from web." },
  };
};
