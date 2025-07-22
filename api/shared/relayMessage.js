const { AzureCommunicationSmsClient } = require("@azure/communication-sms");

async function relayMessage(name, message) {
  const smsConnectionString = process.env.ACS_CONNECTION_STRING;
  const senderPhoneNumber = process.env.ACS_PHONE_NUMBER;
  const recipientPhoneNumber = process.env.RECIPIENT_PHONE_NUMBER;

  if (!recipientPhoneNumber || !senderPhoneNumber) {
    throw new Error("Missing phone numbers in environment configuration");
  }

  const smsClient = new AzureCommunicationSmsClient(smsConnectionString);
  const body = `💌 Wish from ${name}:\n${message}`;

  await smsClient.send({
    from: senderPhoneNumber,
    to: [recipientPhoneNumber],
    message: body,
  });
}

module.exports = { relayMessage };
