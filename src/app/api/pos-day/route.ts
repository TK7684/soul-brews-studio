// /api/pos-day — GET-only Route Handler serving the REAL POS-engine day snapshot.
// Under output:"export" this pre-renders at build time (static file);
// in `next dev` / `next start` it is a live handler. In production the CF Pages
// Function (pedpro functions/api/pos-day.js) serves the SAME payload — byte
// equality between the two is enforced by fastwork/training/build/pos-live-api/test_pos_api.mts.
// Relative import (not "@/lib") so plain `node --experimental-strip-types` can
// import this handler directly in tests.
import snapshot from "../../../lib/pos-day.json" with { type: "json" };

// Required by output:"export" in Next 16.3 — GET-only handlers must be force-static.
export const dynamic = "force-static";

export async function GET() {
  // no-store is honored in `next dev`/`next start` (live handler); under
  // output:"export" the response is a static file and the header is moot —
  // production freshness comes from the CF Pages Function + the client's
  // cache:"no-store" fetch.
  return Response.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
}
