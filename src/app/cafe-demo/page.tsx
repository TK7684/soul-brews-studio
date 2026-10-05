import type { Metadata } from "next";
import OrderClient from "./order-client";
import { MENU, PROMPTPAY_TARGET, formatThb } from "@/lib/cafe-data";

export const metadata: Metadata = {
  title: "เดโม่ร้านกาแฟสั่งเองจ่ายเอง | Soul Brews Studio",
  description:
    "ตัวอย่างหน้าเว็บสั่งเครื่องดื่มหน้าร้าน ลูกค้ากดเลือกเมนู เห็นยอดรวมทันที จ่ายผ่านคิวอาร์พร้อมเพย์ที่คำนวณยอดจากตะกร้าจริง ทำด้วย Next.js",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "เดโม่ร้านกาแฟสั่งเองจ่ายเอง",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "th",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "THB",
    description: "ตัวอย่างงานสำหรับประกอบการขายบริการทำเว็บไซต์",
  },
  author: {
    "@type": "Organization",
    name: "Soul Brews Studio",
    url: "https://pedpro.online",
  },
};

export default function CafeDemoPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mb-8">
        <p className="text-sm text-amber-500">ตัวอย่างงาน เดโม่ระบบหน้าร้าน</p>
        <h1 className="mt-1 text-3xl font-bold">
          ร้านกาแฟสั่งเองจ่ายเอง ลูกค้ากดเองจ่ายเอง ไม่ต้องคอยแคชเชียร์
        </h1>
        <p className="mt-3 max-w-2xl text-gray-300">
          ลูกค้ากดเลือกเมนู ยอดรวมเด้งทันที กดจ่ายแล้วขึ้นคิวอาร์พร้อมเพย์ที่ใส่ยอดเงินมาให้
          สแกนจบในจอเดียว เหมาะกับร้านกาแฟ ร้านชา ร้านขนม ที่หน้าร้านคนเยอะและมีเมนูไม่เยอะ
        </p>
        <p className="mt-2 text-sm text-gray-400">
          เดโม่นี้ทำด้วย Next.js 16 ตัวเลขคิวอาร์คิดจากตะกร้าจริงทุกครั้งที่กด ลองกดเล่นได้เลย
          จ่ายจริงไม่ได้เพราะเบอร์พร้อมเพย์เป็นเบอร์ตัวอย่าง ({PROMPTPAY_TARGET})
        </p>
        <p className="mt-4 text-sm">
          <a href="/" className="text-amber-500 underline hover:text-amber-400">
            กลับหน้าหลัก
          </a>
        </p>
      </header>
      <OrderClient />
      <section className="mt-10 text-sm text-gray-400">
        <h2 className="text-base font-bold text-gray-200">เมนูในเดโม่</h2>
        <ul className="mt-2 grid max-w-md list-disc grid-cols-1 gap-1 pl-5 sm:grid-cols-2">
          {MENU.map((m) => (
            <li key={m.id}>
              {m.name} {formatThb(m.priceThb)}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
