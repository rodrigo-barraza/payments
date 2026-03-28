import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";
import {
  SQUARE_ACCESS_TOKEN,
  SQUARE_LOCATION_ID,
  SQUARE_WEBHOOK_SIGNATURE_KEY,
} from "../secrets.js";
import CONFIG from "../config.js";
import { convertBigInts } from "../utilities.js";

const squareClient = SQUARE_ACCESS_TOKEN
  ? new SquareClient({
      token: SQUARE_ACCESS_TOKEN,
      environment:
        CONFIG.ENVIRONMENT === "production"
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    })
  : null;

/**
 * Asserts Square is configured before any operation.
 */
function assertConfigured() {
  if (!squareClient) {
    throw new Error(
      "Square is not configured — set SQUARE_ACCESS_TOKEN in secrets.js",
    );
  }
}

/**
 * List paired Terminal devices at the configured location.
 * @returns {Promise<Array>} Device list
 */
export async function listDevices() {
  assertConfigured();

  const response = await squareClient.devices.list({
    locationId: SQUARE_LOCATION_ID,
  });

  const devices = [];
  for await (const device of response) {
    devices.push(device);
  }

  return convertBigInts(devices);
}

/**
 * Create a Terminal checkout on a POS device.
 * @param {Object} params
 * @param {number} params.amount — Amount in cents
 * @param {string} [params.currency]
 * @param {string} params.deviceId — Target device ID
 * @param {string} [params.note] — Order note displayed on terminal
 * @returns {Promise<Object>} Terminal checkout
 */
export async function createTerminalCheckout({
  amount,
  currency = CONFIG.CURRENCY,
  deviceId,
  note = "",
}) {
  assertConfigured();

  const result = await squareClient.terminal.checkouts.create({
    idempotencyKey: crypto.randomUUID(),
    checkout: {
      amountMoney: {
        amount: BigInt(amount),
        currency: currency.toUpperCase(),
      },
      deviceOptions: {
        deviceId,
      },
      note,
    },
  });

  return convertBigInts(result.checkout);
}

/**
 * Get the status of a Terminal checkout.
 * @param {string} checkoutId
 * @returns {Promise<Object>} Terminal checkout
 */
export async function getTerminalCheckout(checkoutId) {
  assertConfigured();

  const result = await squareClient.terminal.checkouts.get({
    checkoutId,
  });

  return convertBigInts(result.checkout);
}

/**
 * Cancel a pending Terminal checkout.
 * @param {string} checkoutId
 * @returns {Promise<Object>} Cancelled checkout
 */
export async function cancelTerminalCheckout(checkoutId) {
  assertConfigured();

  const result = await squareClient.terminal.checkouts.cancel({
    checkoutId,
  });

  return convertBigInts(result.checkout);
}

/**
 * Retrieve a payment by ID.
 * @param {string} paymentId
 * @returns {Promise<Object>}
 */
export async function getPayment(paymentId) {
  assertConfigured();

  const result = await squareClient.payments.get({ paymentId });
  return convertBigInts(result.payment);
}

/**
 * Refund a Square payment (full or partial).
 * @param {string} paymentId
 * @param {Object} params
 * @param {number} params.amount — Refund amount in cents
 * @param {string} [params.currency]
 * @returns {Promise<Object>} Refund object
 */
export async function refundPayment(
  paymentId,
  { amount, currency = CONFIG.CURRENCY },
) {
  assertConfigured();

  const result = await squareClient.refunds.refundPayment({
    idempotencyKey: crypto.randomUUID(),
    paymentId,
    amountMoney: {
      amount: BigInt(amount),
      currency: currency.toUpperCase(),
    },
  });

  return convertBigInts(result.refund);
}

/**
 * Verify a Square webhook signature.
 * @param {string} rawBody — Raw request body string
 * @param {string} signature — Square signature header
 * @param {string} webhookUrl — The notification URL registered in Square
 * @returns {boolean} Whether signature is valid
 */
export function verifyWebhookSignature(rawBody, signature, webhookUrl) {
  if (!SQUARE_WEBHOOK_SIGNATURE_KEY) {
    throw new Error(
      "Square webhook signature key not configured — set SQUARE_WEBHOOK_SIGNATURE_KEY in secrets.js",
    );
  }

  const hmac = crypto.createHmac("sha256", SQUARE_WEBHOOK_SIGNATURE_KEY);
  hmac.update(webhookUrl + rawBody);
  const expectedSignature = hmac.digest("base64");

  return signature === expectedSignature;
}
