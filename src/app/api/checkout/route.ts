import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { createSnapTransaction } from "@/lib/midtrans";

// POST { planId } -> creates an Order and a Midtrans Snap transaction,
// returns { redirectUrl } for the client to open.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = (await req.json().catch(() => ({}))) as {
    planId?: string;
  };
  const plan = planId ? getPlan(planId) : undefined;
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const order = await db.order.create({
    data: { userId: user.id, planId: plan.id, amount: plan.priceIdr },
  });

  try {
    const snap = await createSnapTransaction({
      orderId: order.id,
      grossAmount: plan.priceIdr,
      customer: { name: user.name, email: user.email },
      itemName: `${plan.name} plan (${plan.periodDays} days)`,
    });

    await db.order.update({
      where: { id: order.id },
      data: { snapToken: snap.token },
    });

    return NextResponse.json({ redirectUrl: snap.redirectUrl });
  } catch {
    await db.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      { error: "Payment could not be started. Please try again." },
      { status: 502 }
    );
  }
}
