import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatIdr } from "@/lib/plans";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscription: true,
      orders: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!user) redirect("/login");

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dasbor</h1>
        <form action={logout}>
          <button className="rounded-lg border px-4 py-2 text-sm">
            Keluar
          </button>
        </form>
      </div>

      <p className="text-slate-600">
        Masuk sebagai <strong>{user.email}</strong>
      </p>

      <div className="rounded-2xl border p-6">
        <h2 className="mb-2 font-semibold">Langganan</h2>
        {user.subscription && user.subscription.status === "ACTIVE" ? (
          <p>
            Paket <strong>{user.subscription.planId}</strong> aktif sampai{" "}
            {user.subscription.expiresAt.toLocaleDateString("id-ID")}.
          </p>
        ) : (
          <p>
            Belum ada langganan aktif.{" "}
            <a href="/pricing" className="underline">
              Lihat harga
            </a>
          </p>
        )}
      </div>

      <div className="rounded-2xl border p-6">
        <h2 className="mb-3 font-semibold">Pesanan terakhir</h2>
        {user.orders.length === 0 ? (
          <p className="text-slate-600">Belum ada pesanan.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {user.orders.map((o) => (
              <li key={o.id} className="flex justify-between">
                <span>
                  {o.planId} — {formatIdr(o.amount)}
                </span>
                <span>{o.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
