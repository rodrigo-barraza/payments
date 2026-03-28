import express from "express";
import * as StripeService from "../services/StripeService.js";
import * as SquareService from "../services/SquareService.js";
import { asyncHandler } from "../utilities.js";

const router = express.Router();

// ─── Stripe (Online) ────────────────────────────────────────────────────────

/**
 * POST /payments/stripe/checkout
 * Create a Stripe Checkout Session.
 * Body: { lineItems: [{ name, amount, quantity }], successUrl, cancelUrl, metadata? }
 */
router.post(
  "/stripe/checkout",
  asyncHandler("Stripe", async (req, res) => {
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
  }),
);

/**
 * POST /payments/stripe/intent
 * Create a Stripe Payment Intent.
 * Body: { amount, currency?, metadata? }
 */
router.post(
  "/stripe/intent",
  asyncHandler("Stripe", async (req, res) => {
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
  }),
);

/**
 * GET /payments/stripe/:id
 * Retrieve a Stripe Payment Intent.
 */
router.get(
  "/stripe/:id",
  asyncHandler("Stripe", async (req, res) => {
    const payment = await StripeService.getPayment(req.params.id);
    res.json(payment);
  }),
);

/**
 * POST /payments/stripe/:id/refund
 * Refund a Stripe payment (full or partial).
 * Body: { amount? } — omit for full refund
 */
router.post(
  "/stripe/:id/refund",
  asyncHandler("Stripe", async (req, res) => {
    const refund = await StripeService.refundPayment(req.params.id, {
      amount: req.body.amount,
    });

    res.json({ success: true, refund });
  }),
);

// ─── Square (In-Person POS) ─────────────────────────────────────────────────

/**
 * GET /payments/square/devices
 * List paired Square Terminal devices.
 */
router.get(
  "/square/devices",
  asyncHandler("Square", async (_req, res) => {
    const devices = await SquareService.listDevices();
    res.json(devices);
  }),
);

/**
 * POST /payments/square/terminal
 * Create a Terminal checkout on a POS device.
 * Body: { amount, currency?, deviceId, note? }
 */
router.post(
  "/square/terminal",
  asyncHandler("Square", async (req, res) => {
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
  }),
);

/**
 * GET /payments/square/terminal/:id
 * Get the status of a Terminal checkout.
 */
router.get(
  "/square/terminal/:id",
  asyncHandler("Square", async (req, res) => {
    const checkout = await SquareService.getTerminalCheckout(req.params.id);
    res.json(checkout);
  }),
);

/**
 * POST /payments/square/terminal/:id/cancel
 * Cancel a pending Terminal checkout.
 */
router.post(
  "/square/terminal/:id/cancel",
  asyncHandler("Square", async (req, res) => {
    const checkout = await SquareService.cancelTerminalCheckout(req.params.id);
    res.json({ success: true, checkout });
  }),
);

/**
 * GET /payments/square/:id
 * Retrieve a Square payment.
 */
router.get(
  "/square/:id",
  asyncHandler("Square", async (req, res) => {
    const payment = await SquareService.getPayment(req.params.id);
    res.json(payment);
  }),
);

/**
 * POST /payments/square/:id/refund
 * Refund a Square payment (full or partial).
 * Body: { amount, currency? }
 */
router.post(
  "/square/:id/refund",
  asyncHandler("Square", async (req, res) => {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Missing required field: amount" });
    }

    const refund = await SquareService.refundPayment(req.params.id, {
      amount,
      currency,
    });

    res.json({ success: true, refund });
  }),
);

export default router;
