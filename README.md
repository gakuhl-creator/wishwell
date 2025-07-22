
# 📬 WishWell: Public Well-Wishing Platform

WishWell is a lightweight Azure-based application that enables people to send supportive "get well soon" messages via web or SMS.

---

## 🚀 Features

- ✨ Submit messages via website
- 📩 Submit messages via SMS (inbound to ACS)
- 💾 All messages persist in Azure Table Storage
- 📤 SMS relays of submitted messages using Azure Communication Services (ACS)
- 🔍 Public UI to browse messages

---

## 🧱 Architecture

| Function Name       | Trigger                         | Purpose                                                  |
|---------------------|----------------------------------|----------------------------------------------------------|
| `saveWebMessage`    | POST `/api/saveWebMessage`      | Save web-submitted message → relay via SMS               |
| `saveCellMessage`   | POST `/api/saveCellMessage`     | Save inbound SMS → relay via SMS                         |
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

| Secret Name                    | Description                          |
|--------------------------------|--------------------------------------|
| `AZURE_STORAGE_CONNECTION_STRING` | Connection string to your Azure Table Storage |
| `ACS_CONNECTION_STRING`          | Azure Communication Services conn string      |
| `ACS_PHONE_NUMBER`               | Your registered ACS phone number              |

---

## 🛠 Deployment Steps

1. **Fork this repo** into your GitHub account
2. Add the secrets listed above
3. Create these resources in the Azure portal:
   - [Azure Static Web App](https://portal.azure.com/#create/Microsoft.StaticApp)
   - [Azure Communication Services](https://portal.azure.com/#create/Microsoft.CommunicationServices)
   - [Azure Storage Account](https://portal.azure.com/#create/Microsoft.StorageAccount)
4. [Configure SMS Webhook in ACS](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/sms/handle-sms-events)
   - Webhook URL:  
     ```
     https://<your-site>.azurestaticapps.net/api/saveCellMessage
     ```

---

## 📁 File Structure

```
wishwell_api/
├── saveWebMessage/
│   └── index.js
├── saveCellMessage/
│   └── index.js
├── getMessage/
│   └── index.js
├── shared/
│   └── relayMessage.js
```

---

## 🧪 Local Development

Install [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local):
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

Run the API locally:
```bash
cd wishwell_api
func start
```

---

## 🧭 ACS Setup Instructions

### 🔐 Step 1: Get Your `ACS_CONNECTION_STRING`

1. Go to the [Azure Portal](https://portal.azure.com/#create/Microsoft.CommunicationServices) and search for **"Communication Services"**
2. Click **Create** and fill out:
   - **Subscription**: your Azure subscription
   - **Resource Group**: create or select one
   - **Name**: e.g., `wishwell-acs`
   - **Region**: e.g., `East US` or `West US 2`
3. After deployment, go to the **resource overview**
4. In the left menu, click **"Keys and Endpoint"**
5. Copy the **Connection String** and add it as a GitHub Secret:
   - Name: `ACS_CONNECTION_STRING`

---

### ☎️ Step 2: Get Your `ACS_PHONE_NUMBER`

1. In your Communication Services resource, click **"Phone Numbers"** in the left sidebar
2. Click **“Get a phone number”**
3. Choose the following:
   - **Region**: United States
   - **Type**: Long code
   - **Capabilities**: Ensure **SMS (send/receive)** is enabled
4. Click **"Search"**, then select and provision the number
5. Once provisioned, copy it in E.164 format (e.g., `+15551234567`)
6. Add this to your GitHub secrets as:
   - Name: `ACS_PHONE_NUMBER`

> 💡 Azure charges ~$1/month for long code numbers, and ~$0.0075 per SMS.

📥 [Click here to view screenshots that walk through the above steps.](https://wishwell-assets.s3.us-west-2.amazonaws.com/azure-acs-screenshots.zip)

---

## 📄 License

MIT
