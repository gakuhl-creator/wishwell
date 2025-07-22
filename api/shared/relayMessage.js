const { AzureCommunicationSmsClient } = require("@azure/communication-sms");

async function relayMessage(name, message) {
  const smsConnectionString = process.env.ACS_CONNECTION_STRING;
  const senderPhoneNumber = process.env.ACS_PHONE_NUMBER;
  const recipientPhoneNumber = process.env.RECIPIENT_PHONE_NUMBER;

  if (!smsConnectionString) {
    throw new Error("Missing ACS_CONNECTION_STRING in environment configuration");
  }

  if (!recipientPhoneNumber || !senderPhoneNumber) {
    throw new Error("Missing phone numbers in environment configuration");
  }

  const smsClient = new AzureCommunicationSmsClient(smsConnectionString);
  const body = `💌 Wish from ${name}:\n${message}`;

  console.log("relay message from: ", senderPhoneNumber);
  console.log("relay message to: ", recipientPhoneNumber);
  console.log("relay message body: ", body);

  const result = await smsClient.send({
    from: senderPhoneNumber,
    to: [recipientPhoneNumber],
    message: body,
  });

  console.log("SMS send result:", result);
}

module.exports = { relayMessage };
