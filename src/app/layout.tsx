import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soul Brews Studio — รับทำเว็บไซต์ · AI Chatbot · Automation",
  description:
    "ทีมพัฒนาเว็บไซต์ React/Next.js, AI Chatbot (LINE/WhatsApp), และระบบ Automation สำหรับธุรกิจไทย มีผลงานจริง 434+ บทความ SEO",
  keywords: [
    "รับทำเว็บไซต์",
    "React Next.js",
    "AI Chatbot",
    "LINE OA",
    "WhatsApp Bot",
    "AI Automation",
    "n8n",
    "SEO Content",
    "Data Dashboard",
  ],
  openGraph: {
    title: "Soul Brews Studio",
    description: "เว็บไซต์ · AI Chatbot · Automation · SEO",
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
