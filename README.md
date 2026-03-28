# Gold — Payments API

A unified payments service that handles both online checkout flows and in-person point-of-sale terminal transactions. Supports creating payment intents, processing refunds, managing POS devices, and receiving real-time payment status webhooks via Stripe and Square. Designed so other Sun projects can seamlessly charge for things without worrying about direct payment provider integrations.

## ✨ Features

- **Unified Checkout** — Seamlessly create payment intents for online checkouts via Stripe.
- **In-person POS Terminal** — Processing refunds and managing physical POS devices (Square/Stripe terminals).
- **Webhooks & Status** — Receives real-time payment statuses to keep other Sun services up-to-date.
- **Provider Agnostic** — Designed so other apps don't need direct integration with multiple payment providers.

## ⚙️ Prerequisites

- **Node.js** v20+ (ES Modules)
- **Stripe API Keys** (Secret & Publishable)
- **Square API Keys** 

## 🛠️ Tech Stack

| Dependency | Purpose |
| --- | --- |
| Node.js | Runtime |
| Express | HTTP framework |
| Stripe | Online checkout integration |
| Square | POS terminal integration |

## 🚀 Setup

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Configure secrets

```bash
cp secrets.example.js secrets.js
```

Edit `secrets.js` with your Stripe, Square, and webhook secrets.

### 3️⃣ Start the server

```bash
npm run dev        # Development (auto-reload with nodemon)
npm start          # Production
```

## 📜 Scripts

```bash
npm start            # Start server
npm run dev          # Start with auto-reload (nodemon)
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
npm run format:check # Check formatting
```

## ☀️ Part of [Sun](https://github.com/rodrigo-barraza)

Gold (payments) is one service in the Sun ecosystem — a collection of composable backend services and frontends designed to be mixed and matched.
