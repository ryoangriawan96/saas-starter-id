"use client";

import { useState } from "react";

export default function CheckoutButton({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.redirectUrl) {
      setError("Pembayaran gagal dimulai. Coba lagi.");
      setLoading(false);
      return;
    }
    window.location.href = data.redirectUrl;
  }

  return (
    <div>
      <button
        onClick={checkout}
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Berlangganan"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
