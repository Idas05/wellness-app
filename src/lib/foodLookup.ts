// Looks up packaged food by barcode in Open Food Facts, a free, open food database.
// https://openfoodfacts.github.io/openfoodfacts-server/api/

export type ScannedFood = {
  barcode: string;
  name: string;
  /** Calories in one serving, when the package lists a serving. */
  perServing: number | null;
  servingLabel: string | null; // e.g. "1 bar (40 g)"
  /** Calories in 100 g, used when there's no serving info. */
  per100g: number | null;
};

type OffNutriments = Record<string, number | string | undefined>;

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** null when the barcode isn't in the database or has no calorie info. */
export async function lookupBarcode(barcode: string): Promise<ScannedFood | null> {
  const code = barcode.replace(/\D/g, '');
  if (!code) return null;
  const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,nutriments,serving_size,serving_quantity`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Food lookup failed (${res.status}). Try again in a moment.`);
  const data = (await res.json()) as {
    status?: number;
    product?: {
      product_name?: string;
      brands?: string;
      nutriments?: OffNutriments;
      serving_size?: string;
      serving_quantity?: number | string;
    };
  };
  const p = data.product;
  if (data.status !== 1 || !p) return null;

  const n = p.nutriments ?? {};
  // Some products only list energy in kJ.
  const per100g = num(n['energy-kcal_100g']) ?? (num(n['energy_100g']) !== null ? num(n['energy_100g'])! / 4.184 : null);
  const qty = num(p.serving_quantity);
  const perServing = num(n['energy-kcal_serving']) ?? (per100g !== null && qty ? (per100g * qty) / 100 : null);
  if (perServing === null && per100g === null) return null;

  const brand = p.brands?.split(',')[0]?.trim();
  const base = p.product_name?.trim() || 'Scanned food';
  return {
    barcode: code,
    name: brand && !base.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${base}` : base,
    perServing: perServing !== null ? Math.round(perServing) : null,
    servingLabel: perServing !== null ? p.serving_size?.trim() || '1 serving' : null,
    per100g: per100g !== null ? Math.round(per100g) : null,
  };
}
