import Stripe from "stripe";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../secrets.js";
import CONFIG from "../config.js";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

/**
 * Asserts Stripe is configured before any operation.
 */
function assertConfigured() {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured — set STRIPE_SECRET_KEY in secrets.js",
    );
  }
}

/**
 * Create a Stripe Checkout Session.
 * @param {Object} params
 * @param {Array} params.lineItems — Array of { name, amount, quantity }
 * @param {string} params.successUrl — Redirect URL on success
 * @param {string} params.cancelUrl — Redirect URL on cancel
 * @param {Object} [params.metadata] — Arbitrary key-value metadata
 * @returns {Promise<Object>} Checkout session
 */
export async function createCheckoutSession({
  lineItems,
  successUrl,
  cancelUrl,
  metadata = {},
}) {
  assertConfigured();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems.map((item) => ({
      price_data: {
        currency: CONFIG.CURRENCY,
        product_data: { name: item.name },
        unit_amount: item.amount, // in cents
      },
      quantity: item.quantity || 1,
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });

  return session;
}

/**
 * Create a Payment Intent for direct charge.
 * @param {Object} params
 * @param {number} params.amount — Amount in cents
 * @param {string} [params.currency]
 * @param {Object} [params.metadata]
 * @returns {Promise<Object>} Payment intent
 */
export async function createPaymentIntent({
  amount,
  currency = CONFIG.CURRENCY,
  metadata = {},
}) {
  assertConfigured();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
  });

  return paymentIntent;
}

/**
 * Retrieve a payment intent by ID.
 * @param {string} paymentIntentId
 * @returns {Promise<Object>}
 */
export async function getPayment(paymentIntentId) {
  assertConfigured();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Refund a payment (full or partial).
 * @param {string} paymentIntentId
 * @param {Object} [options]
 * @param {number} [options.amount] — Partial refund in cents (omit for full)
 * @returns {Promise<Object>} Refund object
 */
export async function refundPayment(paymentIntentId, { amount } = {}) {
  assertConfigured();

  const params = { payment_intent: paymentIntentId };
  if (amount) {
    params.amount = amount;
  }

  return stripe.refunds.create(params);
}

/**
 * Construct and verify a Stripe webhook event.
 * @param {Buffer} rawBody — Raw request body
 * @param {string} signature — Stripe-Signature header
 * @returns {Object} Verified event
 */
export function constructWebhookEvent(rawBody, signature) {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      "Stripe webhook secret not configured — set STRIPE_WEBHOOK_SECRET in secrets.js",
    );
  }

  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    STRIPE_WEBHOOK_SECRET,
  );
}
