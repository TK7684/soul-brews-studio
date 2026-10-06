// Golden-vector tests for the POS backoffice dashboard metrics (Day 14).
// Run: node --experimental-strip-types src/lib/test_pos_dashboard.mts
// (plain `node` works on Node >=22.6 with strip-types; mirrors the Day-13 .mts lane)
// The suite cross-checks the TS aggregation against golden totals produced by the
// REAL Python POS engine (training/build/pos-dashboard/export_day.py → pos-day.json).
import assert from "node:assert/strict";
import snapshot from "./pos-day.json" with { type: "json" };
import {
  BUCKET_TH,
  METHOD_TH,
  RISK_TH,
  bkkHour,
  bkkTime,
  bucketOf,
  drawerTextOf,
  sumByBucket,
  sumByItems,
  sumByMethod,
  thb,
  type PosOrder,
} from "./pos-metrics.ts";

const snap = snapshot as unknown as import("./pos-metrics.ts").PosSnapshot;
const paid = snap.orders.filter((o: PosOrder) => o.status === "paid");
let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n += 1;
};

// ---- 1. golden: 12 paid + 1 cancelled, revenue ฿1,335.00 (engine's own summary)
t("golden bills + revenue match python summary", () => {
  assert.equal(snap.summary_python.bills_paid, 12);
  assert.equal(snap.summary_python.bills_cancelled, 1);
  assert.equal(snap.summary_python.revenue_satang, 133_500);
  assert.equal(paid.length, 12);
  assert.equal(paid.reduce((a, o) => a + o.total_satang, 0), 133_500);
});

// ---- 2. golden: per-method NET totals (change excluded — cash NET is ฿720, paid-in ฿835)
t("golden per-method totals", () => {
  const m = sumByMethod(paid);
  assert.deepEqual(
    Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v.satang])),
    { cash: 72_000, promptpay: 49_000, transfer: 6_000, delivery_note: 6_500 },
  );
  assert.equal(m.cash.bills, 5);  // b1+b3+b6+b8+b11 = ฿720
  assert.equal(m.promptpay.bills, 5); // b2+b4+b7+b10+b12 = ฿490
  // change is NOT revenue: cash paid-in = 72,000 + change given... paid-in amounts sum higher
  const cashPaidIn = snap.orders
    .filter((o) => o.payment?.method === "cash")
    .reduce((a, o) => a + (o.payment?.amount_satang ?? 0), 0);
  assert.equal(cashPaidIn, 83_500);
  assert.equal(cashPaidIn - m.cash.satang, 11_500); // ทอน total ฿115 back to customers
});

// ---- 3. golden: BKK hour buckets (UTC+7 wall clock on UTC-stored timestamps)
t("golden bucket totals (BKK hours)", () => {
  const b = sumByBucket(paid);
  assert.deepEqual(
    Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.satang])),
    { morning: 54_000, afternoon: 44_000, evening: 35_500 },
  );
  assert.equal(b.morning.bills, 5);   // 08:05–11:30 BKK
  assert.equal(b.afternoon.bills, 4); // 12:20–16:05 BKK
  assert.equal(b.evening.bills, 3);   // 17:25–19:55 BKK
});

// ---- 4. golden: item totals; sum-of-items == revenue (no leakage between views)
t("golden item totals close to revenue", () => {
  const items = sumByItems(paid);
  assert.deepEqual(
    Object.fromEntries(items.map(([k, v]) => [k, [v.cups, v.satang]])),
    {
      อเมริกาโน่: [8, 40_000],
      ลาเต้: [7, 42_500],
      ชาไทย: [5, 26_000],
      โกโก้: [4, 25_000],
    },
  );
  assert.equal(items.reduce((a, [, v]) => a + v.satang, 0), 133_500);
});

// ---- 5. money formatting: satang → Thai baht string, integer-safe
t("thb() formatting", () => {
  assert.equal(thb(133_500), "฿1,335.00");
  assert.equal(thb(0), "฿0.00");
  assert.equal(thb(5), "฿0.05"); // no float drift
  assert.equal(thb(11), "฿0.11");
});

// ---- 6. BKK time conversion: stored UTC 01:05 → 08:05 BKK; 17:00 UTC → 00:00 next day
t("bkk hour conversion + day rollover", () => {
  assert.equal(bkkHour("2026-10-06T01:05:00"), 8);
  assert.equal(bkkTime("2026-10-06T01:05:00"), "08:05");
  assert.equal(bkkHour("2026-10-06T17:00:00"), 0);
  assert.equal(bucketOf("2026-10-06T17:30:00"), "morning"); // 00:30 BKK = เช้า bucket
  assert.equal(bucketOf("2026-10-06T01:05:00"), "morning");
  assert.equal(bucketOf("2026-10-06T06:00:00"), "afternoon"); // 13:00 BKK
  assert.equal(bucketOf("2026-10-06T12:55:00"), "evening"); // 19:55 BKK
});

// ---- 7. drawer reconciliation math (engine close-out: expected == counted, diff 0)
t("drawer golden + drawerTextOf", () => {
  assert.equal(snap.shift.expected_satang, 203_500);
  assert.equal(snap.shift.counted_satang, 203_500);
  assert.equal(snap.shift.diff_satang, 0);
  assert.equal(drawerTextOf(0), "ตรงกับระบบ ไม่มีส่วนต่าง");
  assert.equal(drawerTextOf(5_000), "ขาดมากกว่าระบบ ฿50.00");
  assert.equal(drawerTextOf(-250), "นับได้น้อยกว่าระบบ ฿2.50");
});

// ---- 8. risk events from the real engine: 3 kinds present, cancelled order in log
t("risk events + cancel kept (never deleted)", () => {
  const kinds = snap.risk_events.map((r) => r.kind);
  assert.deepEqual(kinds, ["shift_opened", "order_cancelled", "shift_closed_diff"]);
  const cx = snap.orders.find((o) => o.status === "cancelled");
  assert.ok(cx, "cancelled bill must remain in the day's log");
  assert.equal(cx?.total_satang, 5_500);
  assert.match(cx?.cancel_reason ?? "", /สั่งผิด/);
});

// ---- 9. Thai labels cover every enum value that can appear (no raw keys in UI)
t("label maps cover all enums", () => {
  for (const m of ["cash", "promptpay", "transfer", "delivery_note"]) {
    assert.ok(METHOD_TH[m]);
  }
  for (const r of ["shift_opened", "shift_closed_diff", "order_cancelled", "drawer_open_no_sale", "cash_out_big"]) {
    assert.ok(RISK_TH[r]);
  }
  for (const b of ["morning", "afternoon", "evening"]) {
    assert.ok(BUCKET_TH[b]);
  }
});

// ---- 10. avg bill + top method derivations (KPI row values)
t("KPI derivations", () => {
  const revenue = snap.summary_python.revenue_satang;
  assert.equal(Math.round(revenue / paid.length), 11_125); // ฿111.25
  const top = Object.entries(sumByMethod(paid)).sort((a, b) => b[1].satang - a[1].satang)[0];
  assert.equal(top[0], "cash");
  assert.equal(top[1].satang, 72_000);
});

console.log(`POS dashboard metrics: ${n}/${n} tests pass`);
