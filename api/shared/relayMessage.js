
const { AzureCommunicationSmsClient } = require("@azure/communication-sms");

async function relayMessage(name, message) {
  const smsConnectionString = process.env.ACS_CONNECTION_STRING;
  const smsRecipient = process.env.ACS_PHONE_NUMBER;

  const smsClient = new AzureCommunicationSmsClient(smsConnectionString);
  const body = `💌 Wish from ${name}:\n${message}`;

  await smsClient.send({
    from: smsRecipient,
    to: [smsRecipient],
    message: body
  });
}

module.exports = { relayMessage };
