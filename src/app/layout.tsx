import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Starter ID",
  description:
    "Indonesian SaaS starter: Next.js, Auth.js, Prisma and Midtrans payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <header className="border-b">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <a href="/" className="font-bold">
              SaaS Starter ID
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/pricing" className="hover:underline">
                Harga
              </a>
              <a href="/dashboard" className="hover:underline">
                Dasbor
              </a>
              <a href="/login" className="hover:underline">
                Masuk
              </a>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
