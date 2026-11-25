import { createHash } from "node:crypto";

// Minimal Midtrans Snap client (no SDK dependency): creates a Snap
// transaction via the Snap API and verifies notification signatures.

const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

const SNAP_BASE = isProduction
  ? "https://app.midtrans.com/snap/v1"
  : "https://app.sandbox.midtrans.com/snap/v1";

const CORE_BASE = isProduction
  ? "https://api.midtrans.com/v2"
  : "https://api.sandbox.midtrans.com/v2";

function authHeader(): string {
  return "Basic " + Buffer.from(serverKey + ":").toString("base64");
}

export interface SnapResult {
  token: string;
  redirectUrl: string;
}

export async function createSnapTransaction(params: {
  orderId: string;
  grossAmount: number;
  customer: { name?: string | null; email: string };
  itemName: string;
}): Promise<SnapResult> {
  const res = await fetch(`${SNAP_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      item_details: [
        {
          id: params.orderId,
          price: params.grossAmount,
          quantity: 1,
          name: params.itemName.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: params.customer.name ?? undefined,
        email: params.customer.email,
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    // Never leak the server key or raw upstream body to the client.
    throw new Error(`Midtrans Snap request failed (HTTP ${res.status})`);
  }

  const data = (await res.json()) as { token: string; redirect_url: string };
  return { token: data.token, redirectUrl: data.redirect_url };
}

/// Midtrans notification signature:
/// sha512(order_id + status_code + gross_amount + serverKey)
export function verifyNotificationSignature(n: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const expected = createHash("sha512")
    .update(n.order_id + n.status_code + n.gross_amount + serverKey)
    .digest("hex");
  // Constant-time-ish comparison; both are hex strings of equal length.
  if (expected.length !== n.signature_key.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ n.signature_key.charCodeAt(i);
  }
  return diff === 0;
}

/// Map a Midtrans transaction_status to our order status.
export function mapTransactionStatus(
  transactionStatus: string,
  fraudStatus?: string
): "PAID" | "PENDING" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED" {
  switch (transactionStatus) {
    case "settlement":
      return "PAID";
    case "capture":
      return fraudStatus === "challenge" ? "PENDING" : "PAID";
    case "pending":
      return "PENDING";
    case "expire":
      return "EXPIRED";
    case "cancel":
      return "CANCELLED";
    case "refund":
    case "partial_refund":
      return "REFUNDED";
    default:
      return "FAILED"; // deny, failure, etc.
  }
}

export { CORE_BASE };
