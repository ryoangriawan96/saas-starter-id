import { signIn } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Minimal combined sign-in / register page (email + password).
// Registering creates the account, then signs the user in.
export default function LoginPage() {
  async function register(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!email || password.length < 8) return;

    const existing = await db.user.findUnique({ where: { email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 12);
      await db.user.create({
        data: { email, passwordHash, name: name || undefined },
      });
    }
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  }

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const password = String(formData.get("password") ?? "");
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  }

  async function loginGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
  );

  return (
    <section className="mx-auto max-w-md space-y-8">
      <h1 className="text-2xl font-bold">Masuk / Daftar</h1>

      <form action={login} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="email@contoh.id"
          className="w-full rounded-lg border px-4 py-3"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Kata sandi"
          className="w-full rounded-lg border px-4 py-3"
        />
        <button className="w-full rounded-lg bg-slate-900 px-5 py-3 text-white">
          Masuk
        </button>
      </form>

      <div className="border-t pt-6">
        <p className="mb-3 text-sm text-slate-600">
          Belum punya akun? Daftar dengan formulir yang sama (kata sandi
          minimal 8 karakter):
        </p>
        <form action={register} className="space-y-3">
          <input
            name="name"
            type="text"
            placeholder="Nama"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="email@contoh.id"
            className="w-full rounded-lg border px-4 py-3"
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Kata sandi baru"
            className="w-full rounded-lg border px-4 py-3"
          />
          <button className="w-full rounded-lg border px-5 py-3">Daftar</button>
        </form>
      </div>

      {googleEnabled && (
        <form action={loginGoogle}>
          <button className="w-full rounded-lg border px-5 py-3">
            Lanjutkan dengan Google
          </button>
        </form>
      )}
    </section>
  );
}
