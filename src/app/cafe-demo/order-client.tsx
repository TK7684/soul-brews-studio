"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildPayload } from "@/lib/promptpay";
import {
  MENU,
  PROMPTPAY_TARGET,
  type CartLine,
  formatThb,
  newOrderId,
  orderTotalThb,
} from "@/lib/cafe-data";

type Cart = Record<string, number>; // menu item id -> quantity

export default function OrderClient() {
  const [cart, setCart] = useState<Cart>({});
  const [orderState, setOrderState] = useState<"cart" | "paid">("cart");

  const lines: CartLine[] = Object.entries(cart)
    .map(([id, qty]) => ({ item: MENU.find((m) => m.id === id)!, qty }))
    .filter((l) => l.item);

  const totalThb = orderTotalThb(lines);
  const qrPayload = buildPayload(PROMPTPAY_TARGET, totalThb);

  function add(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }
  function removeOne(id: string) {
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return next;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }
  function clearCart() {
    setCart({});
    setOrderState("cart");
  }

  if (orderState === "paid") {
    return (
      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/40 p-6 text-center">
        <div className="text-4xl">🧾</div>
        <h2 className="mt-3 text-2xl font-bold text-emerald-300">
          ได้รับออเดอร์แล้ว
        </h2>
        <p className="mt-1 text-sm text-gray-300">
          พนักงานกำลังทำเครื่องดื่มของคุณ เลขออเดอร์ {newOrderId()}
        </p>
        <ul className="mx-auto mt-4 max-w-xs text-left text-sm text-gray-200">
          {lines.map((l) => (
            <li key={l.item.id} className="flex justify-between py-0.5">
              <span>
                {l.item.name} x{l.qty}
              </span>
              <span>{formatThb(l.item.priceThb * l.qty)}</span>
            </li>
          ))}
          <li className="mt-1 flex justify-between border-t border-emerald-800 pt-1 font-bold">
            <span>รวม</span>
            <span>{formatThb(totalThb)}</span>
          </li>
        </ul>
        <button
          onClick={clearCart}
          className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-500"
        >
          เริ่มออเดอร์ใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      {/* menu */}
      <div className="grid gap-3 sm:grid-cols-2">
        {MENU.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 p-4"
          >
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-400">{formatThb(item.priceThb)}</div>
            </div>
            <div className="flex items-center gap-2">
              {cart[item.id] ? (
                <>
                  <button
                    onClick={() => removeOne(item.id)}
                    aria-label={`ลด ${item.name}`}
                    className="h-8 w-8 rounded-lg border border-gray-700 text-lg hover:bg-gray-800"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-semibold">{cart[item.id]}</span>
                </>
              ) : null}
              <button
                onClick={() => add(item.id)}
                aria-label={`เพิ่ม ${item.name}`}
                className="h-8 w-8 rounded-lg bg-amber-600 font-bold text-white hover:bg-amber-500"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* cart + QR */}
      <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-lg font-bold">ตะกร้า</h2>
        {lines.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">
            ยังไม่มีรายการ กดเครื่องดื่มด้านซ้ายเพื่อเพิ่ม
          </p>
        ) : (
          <>
            <ul className="mt-3 text-sm">
              {lines.map((l) => (
                <li key={l.item.id} className="flex justify-between py-0.5">
                  <span>
                    {l.item.name} x{l.qty}
                  </span>
                  <span>{formatThb(l.item.priceThb * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-gray-800 pt-2 font-bold">
              <span>ยอดรวม</span>
              <span>{formatThb(totalThb)}</span>
            </div>
            <div className="mt-4 rounded-xl bg-white p-3">
              <QRCodeSVG value={qrPayload} size={200} level="M" className="mx-auto block" />
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">
              สแกนจ่ายพร้อมเพย์ ยอด {formatThb(totalThb)} จ่ายได้ทันทีไม่ต้องแคชเชียร์
            </p>
            <button
              onClick={() => setOrderState("paid")}
              className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
            >
              ยืนยันว่าจ่ายแล้ว
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
