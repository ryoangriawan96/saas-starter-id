import { PLANS, formatIdr } from "@/lib/plans";
import CheckoutButton from "@/components/CheckoutButton";

export default function PricingPage() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold">Harga</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div key={plan.id} className="space-y-4 rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-slate-600">{plan.tagline}</p>
            <p className="text-3xl font-bold">
              {formatIdr(plan.priceIdr)}
              <span className="text-base font-normal text-slate-500">
                {" "}
                / {plan.periodDays} hari
              </span>
            </p>
            <ul className="list-inside list-disc text-slate-700">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <CheckoutButton planId={plan.id} />
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500">
        Pembayaran diproses oleh Midtrans: QRIS, GoPay, OVO, DANA, transfer
        bank, dan kartu kredit/debit.
      </p>
    </section>
  );
}
