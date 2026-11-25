export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold leading-tight">
        Mulai SaaS-mu di Indonesia, tanpa mengulang pekerjaan dasar.
      </h1>
      <p className="max-w-2xl text-lg text-slate-600">
        Starter ini sudah memasang autentikasi (email + Google), database,
        halaman harga, dan pembayaran <strong>Midtrans</strong> (QRIS,
        e-wallet, transfer bank, kartu) lengkap dengan webhook notifikasi
        terverifikasi. Kamu tinggal membangun fitur produkmu.
      </p>
      <div className="flex gap-3">
        <a
          href="/pricing"
          className="rounded-lg bg-slate-900 px-5 py-3 text-white"
        >
          Lihat harga
        </a>
        <a
          href="/login"
          className="rounded-lg border px-5 py-3"
        >
          Masuk / Daftar
        </a>
      </div>
    </section>
  );
}
