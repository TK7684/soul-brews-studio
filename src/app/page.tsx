import Link from "next/link";

const services = [
  {
    title: "รับทำเว็บไซต์ React/Next.js",
    desc: "เว็บไซต์เร็ว, SEO-friendly, รองรับมือถือ พร้อม Core Web Vitals ที่ผ่านเกณฑ์ Google",
    price: "฿3,000+",
    features: ["Next.js 16 + TypeScript", "Tailwind CSS", "SEO + Schema", "Deploy Vercel/Docker"],
    badge: "Web Dev",
  },
  {
    title: "AI Chatbot (LINE OA + WhatsApp)",
    desc: "ระบบตอบลูกค้าอัตโนมัติ AI ตอบ FAQ, รับออเดอร์, นัดหมาย ทำงาน 24/7",
    price: "฿2,000+",
    features: ["LINE OA Flex Messages", "WhatsApp Cloud API", "AI (Gemini/GPT)", "เชื่อม Database"],
    badge: "Chatbot",
  },
  {
    title: "AI Automation (n8n)",
    desc: "ลดงานซ้ำด้วยระบบอัตโนมัติ เชื่อม Google Sheets, LINE Notify, AI จัดการเอกสาร",
    price: "฿3,000+",
    features: ["n8n Workflow", "AI Classification", "Error Handling", "Production Ready"],
    badge: "Automation",
  },
  {
    title: "เขียนบทความ SEO + AI Overview",
    desc: "บทความที่ติดอันดับ Google และ AI Overview พร้อม FAQ Schema และการวิเคราะห์ keyword",
    price: "฿400+",
    features: ["434+ บทความจริง", "AI Overview / AEO", "FAQ Schema", "WordPress Auto"],
    badge: "SEO Content",
  },
  {
    title: "Data Analysis + Dashboard",
    desc: "วิเคราะห์ข้อมูลและสร้าง Dashboard แบบโต้ตอบได้ พร้อมรายงาน PDF",
    price: "฿1,500+",
    features: ["Python/Pandas", "Streamlit Dashboard", "Plotly Charts", "Export Excel/PDF"],
    badge: "Data",
  },
];

const portfolio = [
  {
    name: "Bangkok Ride",
    url: "https://bangkokride.com",
    desc: "ระบบจองรถแต่งงาน + WhatsApp Bot ตอบลูกค้าอัตโนมัติ",
    tech: ["Flask", "WhatsApp Cloud API", "SQLite", "Fly.io"],
  },
  {
    name: "Auto-Blogger (434+ articles)",
    url: "https://github.com/TK7684",
    desc: "ระบบเขียนบทความ SEO อัตโนมัติด้วย Gemini AI → WordPress + Yoast",
    tech: ["Python", "Gemini AI", "WordPress REST", "Schema"],
  },
  {
    name: "Soul Brews Studio",
    url: "#",
    desc: "เว็บไซต์ Portfolio นี้ — Next.js 16 + TypeScript + Tailwind",
    tech: ["Next.js 16", "TypeScript", "Tailwind", "Vercel"],
  },
];

const stats = [
  { value: "434+", label: "บทความ SEO จริง" },
  { value: "1,126", label: "บรรทัดโค้ด Chatbot" },
  { value: "5", label: "บริการ" },
  { value: "24/7", label: "Auto Monitoring" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm border border-indigo-500/30">
            🚀 Fastwork Verified · พร้อมรับงาน
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Soul Brews Studio
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            เว็บไซต์ · AI Chatbot · Automation · SEO · Data Dashboard
          </p>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            ทีมพัฒนาที่มีผลงานจริง ไม่ใช่แค่คำพูด — 434+ บทความที่ติดอันดับ,
            WhatsApp Bot ที่ใช้งานจริง, ระบบที่ Deploy แล้ว
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://fastwork.co/user/bugtap"
              className="px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition font-semibold"
            >
              ว่าจ้างผ่าน Fastwork →
            </a>
            <a
              href="#services"
              className="px-8 py-3 rounded-lg border border-gray-600 hover:border-gray-400 transition font-semibold"
            >
              ดูบริการทั้งหมด
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-indigo-400">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">บริการของเรา</h2>
          <p className="text-center text-gray-400 mb-12">
            5 บริการครอบคลุมทุกความต้องการทางเทคโนโลยี
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div
                key={s.title}
                className="group relative p-6 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition bg-gray-900/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">
                    {s.badge}
                  </span>
                  <span className="text-lg font-bold text-green-400">{s.price}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{s.desc}</p>
                <ul className="space-y-1">
                  {s.features.map((f) => (
                    <li key={f} className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="text-indigo-400">▸</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-24 px-6 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">ผลงานจริง</h2>
          <p className="text-center text-gray-400 mb-12">
            ไม่ใช่ Mockup — ทุกชิ้นคือระบบที่ Deploy แล้ว
          </p>
          <div className="space-y-4">
            {portfolio.map((p) => (
              <div
                key={p.name}
                className="p-6 rounded-xl border border-gray-800 hover:border-gray-600 transition flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-indigo-300">{p.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{p.desc}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {p.tech.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {p.url !== "#" && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:text-indigo-300 whitespace-nowrap"
                  >
                    เยี่ยมชม →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">พร้อมเริ่มโปรเจกต์ของคุณ</h2>
          <p className="text-gray-400 mb-8">
            ทักแชทได้ทันที ตอบกลับภายใน 5 นาที ⚡
          </p>
          <a
            href="https://fastwork.co/user/bugtap"
            className="inline-block px-10 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition font-bold text-lg"
          >
            ว่าจ้างบน Fastwork
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-sm text-gray-600">
        Soul Brews Studio · Fastwork Seller · Bangkok, Thailand
      </footer>
    </main>
  );
}
