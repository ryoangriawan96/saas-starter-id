// Edit these plans to match your product. Prices are integer IDR.
export interface Plan {
  id: string;
  name: string;
  priceIdr: number;
  periodDays: number;
  tagline: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceIdr: 49000,
    periodDays: 30,
    tagline: "Untuk mulai dan mencoba.",
    features: ["1 proyek", "Fitur inti", "Dukungan email"],
  },
  {
    id: "pro",
    name: "Pro",
    priceIdr: 149000,
    periodDays: 30,
    tagline: "Untuk tim yang sedang tumbuh.",
    features: ["Proyek tanpa batas", "Semua fitur", "Dukungan prioritas"],
  },
];

export function getPlan(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}

export function formatIdr(amount: number): string {
  return "Rp" + amount.toLocaleString("id-ID");
}
