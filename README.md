
# 📬 WishWell: Public Well-Wishing Platform

WishWell is a lightweight Azure-based application that enables people to send supportive "get well soon" messages via web.

Future Improvement/ Work In Progress: Relay messages from Azure to receiver's cell phone. Per Azure: 
>Your trial number can only call up to three phone numbers, which have to be verified with two-factor authentication. SMS is unavailable for trial numbers.


---

## 🚀 Features

- ✨ Submit messages via website
- 💾 All messages persist in Azure Table Storage
- 📤 Future work: SMS relays of submitted messages using Azure Communication Services (ACS)
- 🔍 Public UI to browse messages

---

## 🧱 Architecture

| Function Name       | Trigger                         | Purpose                                                  |
|---------------------|----------------------------------|----------------------------------------------------------|
| `saveWebMessage`    | POST `/api/saveWebMessage`      | Save web-submitted message → relay via SMS               |
| `getMessage`        | GET `/api/getMessage`           | Retrieve stored messages for display                     |
| `shared/relayMessage.js` | Internal module              | Handles sending SMS using Azure Communication Services   |

---

## 🌐 Frontend

- `index.html`: Simple form to submit a message
- `wishwell-frontend.js`: Calls API endpoints to submit and retrieve messages

---

## 🔐 Required Azure Resources

- Azure Static Web App
- Azure Communication Services (ACS)
- Azure Storage Account (Table Storage)

---

## 🔑 Environment Variables (GitHub Actions Secrets)

Set these in your GitHub repo's **Settings → Secrets and variables → Actions**:

See wishwell_deployment_guide.md for more info.

| Secret Name                       | Description                                    |
|-----------------------------------|------------------------------------------------|
| `AZURE_STORAGE_CONNECTION_STRING` | Connection string to your Azure Table Storage  |
| `ACS_CONNECTION_STRING`           | Azure Communication Services conn string       |
| `ACS_PHONE_NUMBER`                | Your registered ACS phone number               |
| `AZURE_CLIENT_ID`                 | Azure secret                                   |
| `AZURE_TENANT_ID`                 | Azure secret                                   |
| `AZURE_SUBSCRIPTION_ID`           | Azure secret                                   | 
| `RECIPIENT_PHONE_NUMBER`          | The phone number of the lucky recipient        | 

---

## 🛠 Deployment Steps

1. **Fork this repo** into your GitHub account
2. Add the secrets listed above
3. Create these resources in the Azure portal:
   - [Azure Static Web App](https://portal.azure.com/#create/Microsoft.StaticApp)
   - [Azure Communication Services](https://portal.azure.com/#create/Microsoft.CommunicationServices)
   - [Azure Storage Account](https://portal.azure.com/#create/Microsoft.StorageAccount)

---

## 📁 File Structure

```
wishwell/
├── .github/
│   └── workflows/
│       └── deploy.yml
│       └── infra.yml
├── api/
|   └── saveWebMessage/
│       └── index.js
│       └── function.json
|   └── getMessage/
│       └── index.js
│       └── function.json
|   └── shared/
│       └── relayMessage.js
|   └── host.json
|   └── local.settings.json
|   └── package-lock.json
|   └── package.json
├── dist/
├── node_modules/
├── public/
│   └── staticwebapp.config.json
│   └── index.html
│   └── styles.css
│   └── wishwell-frontend.js
├── README.md                     # You are here
├── wishwell_deployment_guide.md  # Important instructions here
```

---

## 🧪 Local Development

Install [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local):
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

Run the API locally:
```bash
cd api
func start
```
Test /saveWebMessage (assuming 7071 port)

```bash
curl -X POST http://localhost:7071/api/saveWebMessage \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "message": "Get well soon!"}'
```

---

## 📄 License

MIT
