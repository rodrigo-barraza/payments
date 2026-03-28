/**
 * Async request handler wrapper to standardize error handling and eliminate
 * repetitive try/catch blocks within Express routes.
 *
 * @param {string} contextName - The logging context (e.g., 'Stripe', 'Square')
 * @param {Function} fn - The asynchronous route handler
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (contextName, fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error(`[${contextName}] ❌ Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
};

import BigNumber from "bignumber.js";

/**
 * Convert BigInt values in responses to safe Number library instances.
 * Useful for SDKs (like Square) that return amounts as BigInt which cannot
 * be natively serialized via JSON.stringify. We use BigNumber to avoid
 * precision loss with large integers.
 *
 * @param {Object} obj — Object to convert
 * @returns {Object} Object with BigInts converted to BigNumber instances
 */
export function convertBigInts(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return new BigNumber(obj.toString()).toNumber();
  if (Array.isArray(obj)) return obj.map(convertBigInts);
  if (typeof obj === "object") {
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigInts(value);
    }
    return converted;
  }
  return obj;
}
