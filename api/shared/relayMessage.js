const { AzureCommunicationSmsClient } = require("@azure/communication-sms");

module.exports = async function (context, req) {
  const connectionString = process.env.ACS_CONNECTION_STRING;
  const fromPhoneNumber = process.env.ACS_PHONE_NUMBER;
  const toPhoneNumber = process.env.RECIPIENT_PHONE_NUMBER;

  const { name = "", message = "" } = req.body || {};

  try {
    const smsClient = new AzureCommunicationSmsClient(connectionString);

    const sendResults = await smsClient.send({
      from: fromPhoneNumber,
      to: [toPhoneNumber],
      message: `${name} says: ${message}`,
    });

    context.log("SMS send result:", JSON.stringify(sendResults[0]));

    context.res = {
      status: 200,
      body: { success: true, sendResults: sendResults[0] },
    };
  } catch (err) {
    context.log.error("Failed to send SMS:", err);

    context.res = {
      status: 500,
      body: { error: "SMS send failed", details: err.message },
    };
  }
};
