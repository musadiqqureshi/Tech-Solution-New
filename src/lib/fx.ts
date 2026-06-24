// Live USD→PKR exchange rate with a server-side in-memory cache.
// Used to price SaaS invoices in PKR from the USD plan price.

const FALLBACK_USD_PKR = 278; // sane default if the FX API is unreachable
const CACHE_MS = 1000 * 60 * 60 * 6; // 6 hours

let cache: { rate: number; fetchedAt: number } | null = null;

interface FxResult {
  rate: number;
  fetchedAt: string;
  source: "live" | "cache" | "fallback";
}

/** Returns the current USD→PKR rate, caching for 6h. Never throws. */
export async function getUsdToPkr(): Promise<FxResult> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return { rate: cache.rate, fetchedAt: new Date(cache.fetchedAt).toISOString(), source: "cache" };
  }
  try {
    // Free, no-key FX endpoint.
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 21600 },
    });
    const json = await res.json();
    const rate = json?.rates?.PKR;
    if (typeof rate === "number" && rate > 0) {
      cache = { rate, fetchedAt: Date.now() };
      return { rate, fetchedAt: new Date(cache.fetchedAt).toISOString(), source: "live" };
    }
  } catch {
    /* fall through to fallback */
  }
  const rate = cache?.rate ?? FALLBACK_USD_PKR;
  return { rate, fetchedAt: new Date().toISOString(), source: "fallback" };
}
