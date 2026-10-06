import type { Metadata } from "next";
import DashboardClient from "./dashboard-client";
import snapshot from "@/lib/pos-day.json";
import type { PosSnapshot } from "@/lib/pos-metrics";

export const metadata: Metadata = {
  title: "เดโม่หลังบ้าน POS รายวัน | Soul Brews Studio",
  description:
    "ตัวอย่างแดชบอร์ดหลังบ้านสำหรับร้านค้า สรุปยอดขายรายวัน ยอดต่อวิธีชำระเงิน ชั่วโมงการขาย และกิจกรรมที่ควรจับตา ดึงข้อมูลจริงจากตาราง POS (SQLite) ทำด้วย Next.js",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "เดโม่หลังบ้าน POS รายวัน",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "th",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "THB",
    description: "ตัวอย่างงานสำหรับประกอบการขายบริการทำเว็บไซต์และระบบหลังบ้าน",
  },
  author: {
    "@type": "Organization",
    name: "Soul Brews Studio",
    url: "https://pedpro.online",
  },
};

export default function PosDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mb-8">
        <p className="text-sm text-amber-500">ตัวอย่างงาน เดโม่ระบบหลังบ้าน</p>
        <h1 className="mt-1 text-3xl font-bold">
          หลังบ้าน POS รายวัน เห็นยอดขาย วิธีชำระเงิน และเงินในลิ้นชักในหน้าเดียว
        </h1>
        <p className="mt-3 max-w-2xl text-gray-300">
          ตัวเลขทั้งหมดมาจากตาราง POS จริง (SQLite) ที่ระบบขายบันทึกทุกบิล เจ้าของร้านเปิดดูได้ทันที
          โดยไม่ต้องขุดฐานข้อมูลเอง เหมาะกับร้านกาแฟ ร้านชงดื่ม ร้านอาหารเล็ก ที่อยากรู้ยอดวันนี้และเงินสดในลิ้นชักตอนปิดกะ
        </p>
        <p className="mt-2 text-sm text-gray-400">
          เดโม่นี้ทำด้วย Next.js 16 อ่านข้อมูลจากไฟล์ส่งออกของเอนจิน POS จริง
          ลองกดสลับช่วงเวลาและกรองวิธีชำระเงินดูได้เลย
        </p>
        <p className="mt-4 text-sm">
          <a href="/" className="text-amber-500 underline hover:text-amber-400">
            กลับหน้าหลัก
          </a>
        </p>
      </header>
      <DashboardClient snapshot={snapshot as unknown as PosSnapshot} />
      <section className="mt-10 text-sm text-gray-400">
        <h2 className="text-base font-bold text-gray-200">ข้อมูลในเดโม่นี้</h2>
        <p className="mt-2 max-w-2xl">
          สแนปช็อตวันขาย {snapshot.day} จาก {snapshot.branch} — ระบบจริงดึงตรงจากตาราง POS
          ผ่าน API ของเครื่องร้าน ตัวอย่างนี้ใช้ไฟล์ส่งออกแทนเพื่อให้ลองกดเล่นได้ทุกที่
        </p>
      </section>
    </main>
  );
}
