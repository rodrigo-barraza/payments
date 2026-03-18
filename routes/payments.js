import express from "express";
import * as StripeService from "../services/StripeService.js";
import * as SquareService from "../services/SquareService.js";

const router = express.Router();

// ─── Stripe (Online) ────────────────────────────────────────────────────────

/**
 * POST /payments/stripe/checkout
 * Create a Stripe Checkout Session.
 * Body: { lineItems: [{ name, amount, quantity }], successUrl, cancelUrl, metadata? }
 */
router.post("/stripe/checkout", async (req, res) => {
  try {
    const { lineItems, successUrl, cancelUrl, metadata } = req.body;

    if (!lineItems?.length || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: "Missing required fields: lineItems, successUrl, cancelUrl",
      });
    }

    const session = await StripeService.createCheckoutSession({
      lineItems,
      successUrl,
      cancelUrl,
      metadata,
    });

    res.json({ success: true, session });
  } catch (error) {
    console.error("[Stripe] ❌ Checkout error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payments/stripe/intent
 * Create a Stripe Payment Intent.
 * Body: { amount, currency?, metadata? }
 */
router.post("/stripe/intent", async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Missing required field: amount" });
    }

    const paymentIntent = await StripeService.createPaymentIntent({
      amount,
      currency,
      metadata,
    });

    res.json({ success: true, paymentIntent });
  } catch (error) {
    console.error("[Stripe] ❌ Payment intent error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /payments/stripe/:id
 * Retrieve a Stripe Payment Intent.
 */
router.get("/stripe/:id", async (req, res) => {
  try {
    const payment = await StripeService.getPayment(req.params.id);
    res.json(payment);
  } catch (error) {
    console.error("[Stripe] ❌ Get payment error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payments/stripe/:id/refund
 * Refund a Stripe payment (full or partial).
 * Body: { amount? } — omit for full refund
 */
router.post("/stripe/:id/refund", async (req, res) => {
  try {
    const refund = await StripeService.refundPayment(req.params.id, {
      amount: req.body.amount,
    });

    res.json({ success: true, refund });
  } catch (error) {
    console.error("[Stripe] ❌ Refund error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Square (In-Person POS) ─────────────────────────────────────────────────

/**
 * GET /payments/square/devices
 * List paired Square Terminal devices.
 */
router.get("/square/devices", async (_req, res) => {
  try {
    const devices = await SquareService.listDevices();
    res.json(devices);
  } catch (error) {
    console.error("[Square] ❌ List devices error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payments/square/terminal
 * Create a Terminal checkout on a POS device.
 * Body: { amount, currency?, deviceId, note? }
 */
router.post("/square/terminal", async (req, res) => {
  try {
    const { amount, currency, deviceId, note } = req.body;

    if (!amount || !deviceId) {
      return res.status(400).json({
        error: "Missing required fields: amount, deviceId",
      });
    }

    const checkout = await SquareService.createTerminalCheckout({
      amount,
      currency,
      deviceId,
      note,
    });

    res.json({ success: true, checkout });
  } catch (error) {
    console.error("[Square] ❌ Terminal checkout error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /payments/square/terminal/:id
 * Get the status of a Terminal checkout.
 */
router.get("/square/terminal/:id", async (req, res) => {
  try {
    const checkout = await SquareService.getTerminalCheckout(req.params.id);
    res.json(checkout);
  } catch (error) {
    console.error("[Square] ❌ Get terminal checkout error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payments/square/terminal/:id/cancel
 * Cancel a pending Terminal checkout.
 */
router.post("/square/terminal/:id/cancel", async (req, res) => {
  try {
    const checkout = await SquareService.cancelTerminalCheckout(req.params.id);
    res.json({ success: true, checkout });
  } catch (error) {
    console.error("[Square] ❌ Cancel terminal checkout error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /payments/square/:id
 * Retrieve a Square payment.
 */
router.get("/square/:id", async (req, res) => {
  try {
    const payment = await SquareService.getPayment(req.params.id);
    res.json(payment);
  } catch (error) {
    console.error("[Square] ❌ Get payment error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payments/square/:id/refund
 * Refund a Square payment (full or partial).
 * Body: { amount, currency? }
 */
router.post("/square/:id/refund", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Missing required field: amount" });
    }

    const refund = await SquareService.refundPayment(req.params.id, {
      amount,
      currency,
    });

    res.json({ success: true, refund });
  } catch (error) {
    console.error("[Square] ❌ Refund error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
