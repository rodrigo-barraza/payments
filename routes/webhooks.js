import express from "express";
import { constructWebhookEvent } from "../services/StripeService.js";
import { verifyWebhookSignature } from "../services/SquareService.js";
import { STRIPE_WEBHOOK_EVENTS, SQUARE_WEBHOOK_EVENTS } from "../constants.js";

const router = express.Router();

// ─── Stripe Webhook ─────────────────────────────────────────────────────────

/**
 * POST /webhooks/stripe
 * Stripe sends events here. Uses raw body for signature verification.
 * NOTE: This route needs express.raw() middleware (applied in server.js).
 */
router.post("/stripe", (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    const event = constructWebhookEvent(req.body, signature);

    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
        console.log(
          `[Stripe Webhook] ✅ Checkout completed: ${event.data.object.id}`,
        );
        break;

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        console.log(
          `[Stripe Webhook] ✅ Payment succeeded: ${event.data.object.id}`,
        );
        break;

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_FAILED:
        console.error(
          `[Stripe Webhook] ❌ Payment failed: ${event.data.object.id}`,
        );
        break;

      case STRIPE_WEBHOOK_EVENTS.CHARGE_REFUNDED:
        console.log(
          `[Stripe Webhook] 🔄 Charge refunded: ${event.data.object.id}`,
        );
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] ❌ Verification failed:", error.message);
    res.status(400).json({ error: "Webhook verification failed" });
  }
});

// ─── Square Webhook ─────────────────────────────────────────────────────────

/**
 * POST /webhooks/square
 * Square sends events here. Uses raw body for HMAC signature verification.
 * NOTE: This route needs express.raw() middleware (applied in server.js).
 */
router.post("/square", (req, res) => {
  try {
    const signature = req.headers["x-square-hmacsha256-signature"];
    if (!signature) {
      return res
        .status(400)
        .json({ error: "Missing x-square-hmacsha256-signature header" });
    }

    // Square needs the full webhook URL for signature verification
    const webhookUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const rawBody =
      typeof req.body === "string" ? req.body : req.body.toString("utf8");

    const isValid = verifyWebhookSignature(rawBody, signature, webhookUrl);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type;

    switch (eventType) {
      case SQUARE_WEBHOOK_EVENTS.TERMINAL_CHECKOUT_UPDATED:
        console.log(
          `[Square Webhook] 🖥️ Terminal checkout updated: ${event.data?.id}`,
        );
        break;

      case SQUARE_WEBHOOK_EVENTS.PAYMENT_COMPLETED:
        console.log(`[Square Webhook] ✅ Payment completed: ${event.data?.id}`);
        break;

      case SQUARE_WEBHOOK_EVENTS.PAYMENT_UPDATED:
        console.log(`[Square Webhook] 🔄 Payment updated: ${event.data?.id}`);
        break;

      case SQUARE_WEBHOOK_EVENTS.REFUND_COMPLETED:
        console.log(`[Square Webhook] 💸 Refund completed: ${event.data?.id}`);
        break;

      case SQUARE_WEBHOOK_EVENTS.REFUND_UPDATED:
        console.log(`[Square Webhook] 🔄 Refund updated: ${event.data?.id}`);
        break;

      default:
        console.log(`[Square Webhook] Unhandled event: ${eventType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Square Webhook] ❌ Error:", error.message);
    res.status(400).json({ error: "Webhook processing failed" });
  }
});

export default router;
