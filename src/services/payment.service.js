/**
 * Payment Service
 * Handles Midtrans payment transactions
 */

import { post } from "./api";

/**
 * Create new Midtrans payment transaction
 *
 * @param {Object} transactionData - Transaction details
 * @param {string} transactionData.order_id - Unique order ID
 * @param {number} transactionData.gross_amount - Total amount
 * @param {Array} transactionData.items - Order items
 * @param {Object} transactionData.customer - Customer details
 * @returns {Promise<{success: boolean, token: string, redirect_url: string, order_id: string}>}
 */
export async function createTransaction(transactionData) {
  try {
    const response = await post("/create-transaction", transactionData);
    return response;
  } catch (error) {
    console.error("Payment service error:", error);
    throw error;
  }
}

export default {
  createTransaction,
};
