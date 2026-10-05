// cafe-data.ts — shared data + pure order math for the cafe demo.
// Plain Thai spoken register per thai-natural-copy skill (no em-dash in Thai copy,
// ranges spelled out, no stiff formality). Prices in THB; totals computed in floats
// with toFixed(2) at render (single-currency demo, no cross-currency math).

export type MenuItem = {
  id: string;
  name: string;
  priceThb: number;
};

export type CartLine = {
  item: MenuItem;
  qty: number;
};

export const MENU: MenuItem[] = [
  { id: "americano", name: "อเมริกาโน่เย็น", priceThb: 45 },
  { id: "latte", name: "ลาเต้ร้อน", priceThb: 50 },
  { id: "kokotea", name: "ชาไทย", priceThb: 35 },
  { id: "greentea", name: "กรีนทีเย็น", priceThb: 40 },
  { id: "cocoa", name: "โกโก้เย็น", priceThb: 45 },
  { id: "lemonada", name: "มะนาวโซดา", priceThb: 35 },
];

export const PROMPTPAY_TARGET = "0812345678"; // demo target — swap to the real shop number per client

export function formatThb(n: number): string {
  return `฿${n.toFixed(2).replace(/\.00$/, "")}`;
}

export function orderTotalThb(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.item.priceThb * l.qty, 0);
}

export function newOrderId(): string {
  // CF Pages static demo: timestamp-based id is fine for display purposes
  return `C-${Date.now().toString(36).toUpperCase()}`;
}
