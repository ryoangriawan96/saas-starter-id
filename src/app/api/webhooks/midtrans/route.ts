import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import {
  verifyNotificationSignature,
  mapTransactionStatus,
} from "@/lib/midtrans";

// Midtrans notification webhook. Set this URL in the Midtrans dashboard:
// Settings -> Configuration -> Payment Notification URL
//   https://<your-domain>/api/webhooks/midtrans
export async function POST(req: Request) {
  const n = (await req.json().catch(() => null)) as null | {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
    transaction_status: string;
    fraud_status?: string;
    payment_type?: string;
  };

  if (!n || !verifyNotificationSignature(n)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const order = await db.order.findUnique({ where: { id: n.order_id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Amount check: the notified amount must match the order we created.
  const notifiedAmount = Math.round(parseFloat(n.gross_amount));
  if (notifiedAmount !== order.amount) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const status = mapTransactionStatus(n.transaction_status, n.fraud_status);

  await db.order.update({
    where: { id: order.id },
    data: {
      status,
      paymentType: n.payment_type,
      paidAt: status === "PAID" ? new Date() : order.paidAt,
    },
  });

  if (status === "PAID") {
    const plan = getPlan(order.planId);
    const days = plan?.periodDays ?? 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await db.subscription.upsert({
      where: { userId: order.userId },
      create: {
        userId: order.userId,
        planId: order.planId,
        status: "ACTIVE",
        expiresAt,
      },
      update: { planId: order.planId, status: "ACTIVE", expiresAt },
    });
  }

  return NextResponse.json({ ok: true });
}
