import express from "express";
import CONFIG from "./config.js";
import { PAYMENT_PROVIDER } from "./constants.js";
import paymentsRouter from "./routes/payments.js";
import webhooksRouter from "./routes/webhooks.js";

const app = express();

// --- Middleware ---

// Webhook routes need raw body for signature verification.
// Must be registered BEFORE express.json().
app.use("/webhooks", express.raw({ type: "application/json" }), webhooksRouter);

// JSON body parser for all other routes
app.use(express.json());

// --- Routes ---

app.use("/payments", paymentsRouter);

// --- Health checks ---

const ENDPOINTS = {
  payments: {
    stripe: [
      "POST /payments/stripe/checkout",
      "POST /payments/stripe/intent",
      "GET  /payments/stripe/:id",
      "POST /payments/stripe/:id/refund",
    ],
    square: [
      "GET  /payments/square/devices",
      "POST /payments/square/terminal",
      "GET  /payments/square/terminal/:id",
      "POST /payments/square/terminal/:id/cancel",
      "GET  /payments/square/:id",
      "POST /payments/square/:id/refund",
    ],
  },
  webhooks: ["POST /webhooks/stripe", "POST /webhooks/square"],
};

// GET / — Quick health check
app.get("/", (_req, res) => {
  res.json({
    name: "Gold Payments API",
    version: "0.1.0",
    providers: {
      [PAYMENT_PROVIDER.STRIPE]: {
        enabled: CONFIG.STRIPE_ENABLED,
        mode: "online",
      },
      [PAYMENT_PROVIDER.SQUARE]: {
        enabled: CONFIG.SQUARE_ENABLED,
        mode: "in-person (POS)",
      },
    },
    endpoints: ENDPOINTS,
  });
});

// GET /health — Detailed service health
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    environment: CONFIG.ENVIRONMENT,
    currency: CONFIG.CURRENCY,
    providers: {
      stripe: CONFIG.STRIPE_ENABLED ? "configured" : "not configured",
      square: CONFIG.SQUARE_ENABLED ? "configured" : "not configured",
    },
  });
});

// --- Start ---

const port = CONFIG.GOLD_PORT;
app.listen(port, () => {
  console.log(`💰 Gold Payments API running on port ${port}`);
  console.log(`   Environment: ${CONFIG.ENVIRONMENT}`);
  console.log(`   Currency: ${CONFIG.CURRENCY.toUpperCase()}`);
  console.log(
    `   Stripe: ${CONFIG.STRIPE_ENABLED ? "✅ enabled" : "⚠️  not configured"}`,
  );
  console.log(
    `   Square: ${CONFIG.SQUARE_ENABLED ? "✅ enabled" : "⚠️  not configured"}`,
  );
});
