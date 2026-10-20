"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BUCKET_TH,
  METHOD_TH,
  RISK_TH,
  bkkTime,
  drawerTextOf,
  pickSnapshot,
  sumByBucket,
  sumByItems,
  sumByMethod,
  thb,
  type PayFilter,
  type PosSnapshot,
  type SnapshotSource,
} from "@/lib/pos-metrics";

export default function DashboardClient({ snapshot: bundled }: { snapshot: PosSnapshot }) {
  // Live-API lane (Day 28): the page ships with the bundled snapshot so it always
  // renders (static export + SSR safe), then upgrades itself from /api/pos-day.
  const [snapshot, setSnapshot] = useState<PosSnapshot>(bundled);
  const [source, setSource] = useState<SnapshotSource | "pending">("pending");

  useEffect(() => {
    let alive = true;
    // Manual AbortController+timer (not AbortSignal.timeout) — older Safari/Chromium
    // throw on AbortSignal.timeout before the .catch lane exists (gate finding #3).
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    fetch("/api/pos-day", { cache: "no-store", signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: unknown) => {
        if (!alive) return;
        const picked = pickSnapshot(bundled, j);
        setSnapshot(picked.snapshot);
        setSource(picked.source);
      })
      .catch(() => {
        if (alive) setSource("bundled");
      })
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [bundled]);

  const [payFilter, setPayFilter] = useState<PayFilter>("all");
  const [showCancelled, setShowCancelled] = useState(true);

  const paidOrders = useMemo(
    () => snapshot.orders.filter((o) => o.status === "paid"),
    [snapshot],
  );
  const byMethod = useMemo(() => sumByMethod(paidOrders), [paidOrders]);
  const byBucket = useMemo(() => sumByBucket(paidOrders), [paidOrders]);
  const byItem = useMemo(() => sumByItems(paidOrders), [paidOrders]);

  const filtered = snapshot.orders.filter((o) => {
    if (!showCancelled && o.status === "cancelled") return false;
    if (payFilter !== "all" && o.payment?.method !== payFilter) return false;
    return true;
  });

  const revenue = snapshot.summary_python.revenue_satang;
  const avgBill = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0;
  const topMethod = Object.entries(byMethod).sort((a, b) => b[1].satang - a[1].satang)[0];
  const maxBucket = Math.max(...Object.values(byBucket).map((v) => v.satang), 1);

  return (
    <div className="space-y-6">
      {/* ---- live-API source badge (Day 28) */}
      <p
        data-testid="data-source"
        className={
          source === "api"
            ? "text-xs font-medium text-emerald-400"
            : "text-xs text-gray-400"
        }
      >
        {source === "api"
          ? `ข้อมูลสดจาก /api/pos-day (วันที่ ${snapshot.day})`
          : source === "pending"
            ? "กำลังดึงข้อมูลจาก /api/pos-day"
            : "ดึงข้อมูลจาก API ไม่สำเร็จ แสดงข้อมูลแนบหน้าชั่วคราว"}
      </p>

      {/* ---- KPI row */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "ยอดขายวันนี้", value: thb(revenue) },
          { label: "จำนวนบิลที่ขายได้", value: `${snapshot.summary_python.bills_paid} บิล` },
          { label: "ยอดเฉลี่ยต่อบิล", value: thb(avgBill) },
          {
            label: "ยอดสูงสุดตามวิธีชำระ",
            value: topMethod ? `${METHOD_TH[topMethod[0]]} ${thb(topMethod[1].satang)}` : "—",
          },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-400">{k.label}</p>
            <p className="mt-1 text-xl font-bold text-amber-300">{k.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- by payment method */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-base font-bold text-gray-100">ยอดขายตามวิธีชำระเงิน</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pb-2">วิธีชำระ</th>
                <th className="pb-2 text-right">ยอด</th>
                <th className="pb-2 text-right">จำนวนบิล</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byMethod).map(([m, v]) => (
                <tr key={m} className="border-t border-white/10">
                  <td className="py-1.5">{METHOD_TH[m]}</td>
                  <td className="py-1.5 text-right tabular-nums">{thb(v.satang)}</td>
                  <td className="py-1.5 text-right tabular-nums">{v.bills}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ---- by hour bucket (Thai wall-clock = UTC+7) */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-base font-bold text-gray-100">ยอดขายตามช่วงเวลา (เวลาไทย)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(["morning", "afternoon", "evening"] as const).map((b) => {
              const v = byBucket[b] ?? { satang: 0, bills: 0 };
              return (
                <li key={b}>
                  <div className="flex justify-between">
                    <span>{BUCKET_TH[b]}</span>
                    <span className="tabular-nums text-gray-300">
                      {thb(v.satang)} · {v.bills} บิล
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded bg-white/10">
                    <div
                      className="h-2 rounded bg-amber-400"
                      style={{ width: `${Math.round((v.satang / maxBucket) * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* ---- top sellers */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-base font-bold text-gray-100">เมนูขายดีวันนี้</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="pb-2">เมนู</th>
              <th className="pb-2 text-right">แก้ว</th>
              <th className="pb-2 text-right">ยอด</th>
            </tr>
          </thead>
          <tbody>
            {byItem.map(([name, v]) => (
              <tr key={name} className="border-t border-white/10">
                <td className="py-1.5">{name}</td>
                <td className="py-1.5 text-right tabular-nums">{v.cups}</td>
                <td className="py-1.5 text-right tabular-nums">{thb(v.satang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ---- drawer reconciliation */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-base font-bold text-gray-100">ยอดเงินสดในลิ้นชัก (ปิดกะ)</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-gray-400">เงินยกเปิดกะ</p>
            <p className="mt-0.5 font-bold tabular-nums">{thb(snapshot.shift.float_satang)}</p>
          </div>
          <div>
            <p className="text-gray-400">เงินเข้า − เงินออก</p>
            <p className="mt-0.5 font-bold tabular-nums">
              +{thb(snapshot.shift.cash_in_satang)} / −{thb(snapshot.shift.cash_out_satang)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">นับได้จริงตอนปิดกะ</p>
            <p className="mt-0.5 font-bold tabular-nums">{thb(snapshot.shift.counted_satang)}</p>
          </div>
          <div>
            <p className="text-gray-400">ผลต่าง</p>
            <p
              className={
                snapshot.shift.diff_satang === 0
                  ? "mt-0.5 font-bold text-emerald-300"
                  : "mt-0.5 font-bold text-red-300"
            }
            >
              {thb(snapshot.shift.diff_satang)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          ระบบคำนวณเงินที่ควรมี {thb(snapshot.shift.expected_satang)} —{" "}
          {drawerTextOf(snapshot.shift.diff_satang)}
        </p>
      </section>

      {/* ---- watchlist */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-base font-bold text-gray-100">สิ่งที่ควรจับตา</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {snapshot.risk_events.map((r, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>{RISK_TH[r.kind] ?? r.kind}</span>
              <span className="tabular-nums text-gray-400">{bkkTime(r.created_at)} น.</span>
            </li>
          ))}
          <li className="flex justify-between gap-3">
            <span>บิลที่ถูกยกเลิก</span>
            <span className="tabular-nums text-gray-400">
              {snapshot.summary_python.bills_cancelled} บิล
            </span>
          </li>
        </ul>
      </section>

      {/* ---- bill browser */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-gray-100">รายการบิล</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {(["all", "cash", "promptpay", "transfer", "delivery_note"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPayFilter(f)}
                className={`rounded-full border px-3 py-1 ${
                  payFilter === f
                    ? "border-amber-400 bg-amber-400/20 text-amber-200"
                    : "border-white/15 text-gray-300 hover:border-white/40"
                }`}
              >
                {f === "all" ? "ทั้งหมด" : METHOD_TH[f]}
              </button>
            ))}
            <label className="ml-2 flex items-center gap-1 text-gray-300">
              <input
                type="checkbox"
                checked={showCancelled}
                onChange={(e) => setShowCancelled(e.target.checked)}
              />
              แสดงบิลที่ยกเลิก
            </label>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pb-2">เลขบิล</th>
                <th className="pb-2">เวลา (ไทย)</th>
                <th className="pb-2">รายการ</th>
                <th className="pb-2">ชำระ</th>
                <th className="pb-2 text-right">ยอด</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.seq}
                  className={`border-t border-white/10 ${o.status === "cancelled" ? "opacity-50" : ""}`}
                >
                  <td className="py-1.5 tabular-nums">#{o.seq}</td>
                  <td className="py-1.5 tabular-nums">{bkkTime(o.created_at)}</td>
                  <td className="py-1.5">
                    {o.items.map((it) => `${it.name} x${it.qty}`).join(", ")}
                    {o.status === "cancelled" && o.cancel_reason ? (
                      <span className="block text-xs text-red-300">ยกเลิก: {o.cancel_reason}</span>
                    ) : null}
                  </td>
                  <td className="py-1.5">
                    {o.payment ? METHOD_TH[o.payment.method] : "—"}
                    {o.payment && o.payment.change_satang > 0
                      ? ` (ทอน ${thb(o.payment.change_satang)})`
                      : ""}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">{thb(o.total_satang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
