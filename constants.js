// Payment status lifecycle
export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
  CANCELLED: "cancelled",
};

// Payment provider identifiers
export const PAYMENT_PROVIDER = {
  STRIPE: "stripe",
  SQUARE: "square",
};

// Square Terminal checkout status mapping
export const SQUARE_TERMINAL_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  CANCEL_REQUESTED: "CANCEL_REQUESTED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
};

// Stripe event types we handle
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: "checkout.session.completed",
  PAYMENT_INTENT_SUCCEEDED: "payment_intent.succeeded",
  PAYMENT_INTENT_FAILED: "payment_intent.payment_failed",
  CHARGE_REFUNDED: "charge.refunded",
};

// Square webhook event types we handle
export const SQUARE_WEBHOOK_EVENTS = {
  TERMINAL_CHECKOUT_UPDATED: "terminal.checkout.updated",
  PAYMENT_COMPLETED: "payment.completed",
  PAYMENT_UPDATED: "payment.updated",
  REFUND_COMPLETED: "refund.completed",
  REFUND_UPDATED: "refund.updated",
};
