# WishWell Azure Deployment Guide

This document outlines how to provision infrastructure and deploy the WishWell app to Azure using GitHub Actions and OIDC authentication. It also includes updated guidance for working with Azure Communication Services (ACS), Storage, Static Web Apps, and basic rate limiting to control SMS costs.

---

## 🚀 Infrastructure Setup (Manual CLI + Portal)

### ✅ Prerequisites

- Azure CLI installed (`az --version`)
- Logged into Azure via `az login`
- Valid Azure subscription with a resource group (e.g., `wishwell-rg`)
- GitHub repository initialized and pushed

### 🔹 1. Register Resource Providers (one-time)

```bash
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.Communication
az provider register --namespace Microsoft.Storage
```

### 🔹 2. Create Azure Static Web App

```bash
az staticwebapp create \
  --name wishwell-swa \
  --resource-group wishwell-rg \
  --source https://github.com/<your-username>/wishwell \
  --location westus2 \
  --branch main \
  --login-with-github
```

### 🔹 3. Create Azure Communication Services (ACS)

```bash
az communication create \
  --name wishwell-acs \
  --resource-group wishwell-rg \
  --location global \
  --data-location UnitedStates
```

#### 🔹 3a. Get ACS Connection String

```bash
az communication list-key \
  --name wishwell-acs \
  --resource-group wishwell-rg \
  --query "primaryConnectionString" \
  -o tsv
```

#### 🔹 3b. Acquire Phone Number (via Portal)

Azure CLI does not support phone number purchase.

Steps:

1. Go to Azure Portal > wishwell-acs
2. Click "Phone numbers" > "+ Get a phone number"
3. Choose country, type (long code), and region
4. Assign and copy the number

### 🔹 4. Create Storage Account and Table

Note: `--name` must be globally unique

```bash
az storage account create \
  --name wishwellstorage \
  --resource-group wishwell-rg \
  --location westus2 \
  --sku Standard_LRS \
  --kind StorageV2

az storage table create \
  --account-name wishwellstorage \
  --name messages

#### 🔹 4a. Get Storage Connection String

```bash
az storage account show-connection-string \
  --name wishwellstorage \
  --resource-group wishwell-rg \
  --query connectionString \
  -o tsv
```

---

## 🔐 GitHub Secrets Setup

In your repository: **Settings > Secrets and variables > Actions**

Add these:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `ACS_CONNECTION_STRING`
- `ACS_PHONE_NUMBER`
- `AZURE_STORAGE_CONNECTION_STRING`
- `RECIPIENT_PHONE_NUMBER`

---

## 🧱 GitHub Workflows

### `.github/workflows/infra.yml`

> Optional, now replaced by CLI + Portal setup

Use for future automated provisioning (via `workflow_dispatch`) of Infra, initially, in Azure.

### `.github/workflows/deploy.yml`

Used to update the updates to standing Infra in Azure


## ✅ Deployment Verification

Once deployed, verify:

- Static Web App URL loads your frontend
- Backend `/api/saveMessage` and `/api/getMessages` function routes are reachable
- Environment variables are injected via **Azure Portal > wishwell-swa > Configuration**

Let a test message confirm SMS and storage integration.

---

## 📌 Notes

- ACS phone number must be purchased via Azure Portal
- CLI provisioning is cleanest for Storage and ACS
- Static Web Apps automatically host `/api` as Functions — no need for Function App
- Use Table Storage-based rate limiting to guard your budget and service

