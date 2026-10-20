// Pure metrics for the POS backoffice dashboard — shared by the client component
// and the node test suite, so tests exercise the REAL aggregation code.
// Money is INTEGER satang everywhere (never float) — same rule as the Python engine.

export type PosOrderItem = { name: string; unit_satang: number; qty: number };
export type PosPayment = {
  method: "cash" | "promptpay" | "transfer" | "delivery_note";
  amount_satang: number;
  change_satang: number;
  ref: string | null;
};
export type PosOrder = {
  seq: number;
  created_at: string; // UTC ISO from the POS engine; displayed in BKK (+07)
  status: "paid" | "cancelled" | "open";
  total_satang: number;
  items: PosOrderItem[];
  payment: PosPayment | null;
  cancel_reason: string | null;
};
export type RiskEvent = {
  kind: string;
  severity: string;
  payload_json: string;
  created_at: string;
};
export type PosSnapshot = {
  day: string;
  branch: string;
  shift: {
    opened_at: string;
    closed_at: string;
    float_satang: number;
    counted_satang: number;
    expected_satang: number;
    diff_satang: number;
    cash_in_satang: number;
    cash_out_satang: number;
  };
  summary_python: { bills_paid: number; bills_cancelled: number; revenue_satang: number };
  orders: PosOrder[];
  risk_events: RiskEvent[];
};

export const METHOD_TH: Record<string, string> = {
  cash: "เงินสด",
  promptpay: "พร้อมเพย์",
  transfer: "โอนเงิน",
  delivery_note: "ฝากผู้ส่ง",
};
export const RISK_TH: Record<string, string> = {
  shift_opened: "เปิดกะ",
  shift_closed_diff: "ปิดกะ",
  order_cancelled: "ยกเลิกบิล",
  drawer_open_no_sale: "เปิดลิ้นชักไม่มีขาย",
  cash_out_big: "เงินออกก้อนใหญ่",
};
export const BUCKET_TH: Record<string, string> = {
  morning: "เช้า (08–12)",
  afternoon: "บ่าย (12–17)",
  evening: "เย็น (17–21)",
};

export function thb(satang: number): string {
  return `฿${(satang / 100).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function bkkHour(iso: string): number {
  return (Number(iso.slice(11, 13)) + 7) % 24;
}

export function bkkTime(iso: string): string {
  return `${String(bkkHour(iso)).padStart(2, "0")}:${iso.slice(14, 16)}`;
}

export function bucketOf(iso: string): "morning" | "afternoon" | "evening" {
  const h = bkkHour(iso);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export type Bucket = "morning" | "afternoon" | "evening";
export type Method = "cash" | "promptpay" | "transfer" | "delivery_note";
export type PayFilter = "all" | Method;
type BucketTotals = Record<string, { satang: number; bills: number }>;

// NET sale amounts (total_satang), never paid-in — change ≠ revenue (Day-9 lesson).
export function sumByMethod(paid: PosOrder[]): BucketTotals {
  const acc: BucketTotals = {};
  for (const o of paid) {
    if (!o.payment) continue;
    acc[o.payment.method] ??= { satang: 0, bills: 0 };
    acc[o.payment.method].satang += o.total_satang;
    acc[o.payment.method].bills += 1;
  }
  return acc;
}

export function sumByBucket(paid: PosOrder[]): BucketTotals {
  const acc: BucketTotals = {};
  for (const o of paid) {
    const b = bucketOf(o.created_at);
    acc[b] ??= { satang: 0, bills: 0 };
    acc[b].satang += o.total_satang;
    acc[b].bills += 1;
  }
  return acc;
}

export function sumByItems(paid: PosOrder[]): Array<[string, { cups: number; satang: number }]> {
  const acc = new Map<string, { cups: number; satang: number }>();
  for (const o of paid) {
    for (const it of o.items) {
      const cur = acc.get(it.name) ?? { cups: 0, satang: 0 };
      cur.cups += it.qty;
      cur.satang += it.unit_satang * it.qty;
      acc.set(it.name, cur);
    }
  }
  return [...acc.entries()].sort((a, b) => b[1].satang - a[1].satang);
}

export type SnapshotSource = "api" | "bundled";

// Runtime merge policy for the live-API lane (Day 28): accept the /api/pos-day
// payload ONLY if every field the dashboard dereferences is present with the
// right type — otherwise fall back to the bundled snapshot. A 404 body, an HTML
// error page, or a partial/foreign JSON must never blank the page.
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function orderIsSafe(o: unknown): boolean {
  if (typeof o !== "object" || o === null) return false;
  const j = o as {
    status?: unknown;
    total_satang?: unknown;
    items?: unknown;
    payment?: unknown;
  };
  return (
    typeof j.status === "string" &&
    isNum(j.total_satang) &&
    // bkkTime(o.created_at) slices the ISO string on every order row and in
    // sumByBucket -> bucketOf — a missing/non-string created_at crashes render.
    typeof (j as { created_at?: unknown }).created_at === "string" &&
    Array.isArray(j.items) &&
    // sumByItems dereferences item.name/qty/unit_satang during render — an
    // entry like `null` or `{}` passing the guard would crash there.
    j.items.every(
      (it) =>
        typeof it === "object" &&
        it !== null &&
        typeof (it as { name?: unknown }).name === "string" &&
        isNum((it as { qty?: unknown }).qty) &&
        isNum((it as { unit_satang?: unknown }).unit_satang),
    ) &&
    (j.payment === null || typeof j.payment === "object")
  ) &&
  // Render reads are null-safe (`o.payment ? ... : "—"`, `!o.payment && continue`),
  // but a PAID order without a method-bearing payment is semantically wrong —
  // require it so the method table can't silently lose a bill.
  (j.status !== "paid" ||
    (typeof j.payment === "object" &&
      j.payment !== null &&
      typeof (j.payment as { method?: unknown }).method === "string"));
}

function riskEventIsSafe(r: unknown): boolean {
  // Watchlist renders r.kind (RISK_TH lookup w/ ?? fallback) and bkkTime(r.created_at)
  return (
    typeof r === "object" &&
    r !== null &&
    typeof (r as { kind?: unknown }).kind === "string" &&
    typeof (r as { created_at?: unknown }).created_at === "string"
  );
}

export function pickSnapshot(
  bundled: PosSnapshot,
  api: unknown,
): { snapshot: PosSnapshot; source: SnapshotSource } {
  const j = api as Partial<PosSnapshot> | null;
  const sum = j?.summary_python as Partial<PosSnapshot["summary_python"]> | undefined;
  const shift = j?.shift as Partial<PosSnapshot["shift"]> | undefined;
  if (
    typeof j?.day === "string" &&
    j.day.length > 0 &&
    typeof j?.branch === "string" &&
    j.branch.length > 0 &&
    isNum(sum?.revenue_satang) &&
    isNum(sum?.bills_paid) &&
    isNum(sum?.bills_cancelled) &&
    typeof shift === "object" &&
    shift !== null &&
    isNum(shift.float_satang) &&
    isNum(shift.counted_satang) &&
    isNum(shift.expected_satang) &&
    isNum(shift.diff_satang) &&
    isNum(shift.cash_in_satang) &&
    isNum(shift.cash_out_satang) &&
    Array.isArray(j?.risk_events) &&
    j.risk_events.every(riskEventIsSafe) &&
    Array.isArray(j?.orders) &&
    j.orders.every(orderIsSafe)
  ) {
    return { snapshot: j as PosSnapshot, source: "api" };
  }
  return { snapshot: bundled, source: "bundled" };
}

export function drawerTextOf(diffSatang: number): string {
  if (diffSatang === 0) return "ตรงกับระบบ ไม่มีส่วนต่าง";
  return diffSatang > 0
    ? `ขาดมากกว่าระบบ ${thb(diffSatang)}`
    : `นับได้น้อยกว่าระบบ ${thb(-diffSatang)}`;
}
