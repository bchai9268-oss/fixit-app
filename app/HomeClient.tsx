"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is unstable for these routes. */

import { FormEvent, useState } from "react";
import { useLanguage } from "./useLanguage";

const categories = [
  { id: "phone", icon: "📱", th: { title: "โทรศัพท์มือถือ", detail: "หน้าจอ แบตเตอรี่ กล้อง" }, en: { title: "Mobile phone", detail: "Screen, battery, camera" } },
  { id: "laptop", icon: "💻", th: { title: "โน้ตบุ๊ก", detail: "คีย์บอร์ด บอร์ด จอ" }, en: { title: "Laptop", detail: "Keyboard, mainboard, display" } },
  { id: "desktop", icon: "🖥️", th: { title: "คอมพิวเตอร์ประกอบ", detail: "อัปเกรด จัดสเปก ซ่อมบอร์ด" }, en: { title: "Desktop computer", detail: "Upgrade, custom build, board repair" } },
  { id: "other", icon: "⌚", th: { title: "อุปกรณ์อื่นๆ", detail: "แท็บเล็ต Apple Watch หูฟัง" }, en: { title: "Other devices", detail: "Tablet, Apple Watch, headphones" } },
];

const copy = {
  th: {
    homeLabel: "FixIt Online หน้าหลัก", adminLabel: "เข้าสู่ระบบแอดมิน", languageLabel: "เปลี่ยนภาษาเป็นอังกฤษ",
    kicker: "บริการแจ้งซ่อมออนไลน์", subtitle: "ซ่อมไว รู้ราคาประเมินทันที", expert: "ด้วยช่างมืออาชีพ",
    searchLabel: "⌕ เช็กสถานะงานซ่อมของคุณ", searchPlaceholder: "กรอกเบอร์โทร หรือ รหัสใบส่งซ่อม", searching: "กำลังค้นหา", search: "ค้นหา", notFound: "ไม่พบงานซ่อม",
    categoryLabel: "เลือกอุปกรณ์", categoryTitle: "เลือกประเภทอุปกรณ์ที่ต้องการซ่อม", repairNow: "แจ้งซ่อมทันที →", assess: "เริ่มประเมินอาการ →",
    benefits: [
      ["ประเมินอาการง่าย", "เลือกอาการเบื้องต้นได้ภายในไม่กี่ขั้นตอน"],
      ["ติดตามได้ตลอด", "รู้ความคืบหน้าของเครื่องโดยใช้รหัสงานซ่อม"],
      ["ข้อมูลโปร่งใส", "แสดงสถานะและช่วงราคาประเมินอย่างชัดเจน"],
    ],
    lineLabel: "แชตกับร้านทางไลน์", chat: "แชตกับเรา",
  },
  en: {
    homeLabel: "FixIt Online home", adminLabel: "Admin sign in", languageLabel: "Switch language to Thai",
    kicker: "Online repair service", subtitle: "Fast repairs with an instant estimate", expert: "by professional technicians",
    searchLabel: "⌕ Check your repair status", searchPlaceholder: "Enter phone number or repair ID", searching: "Searching", search: "Search", notFound: "Repair job not found",
    categoryLabel: "Choose a device", categoryTitle: "What type of device needs repair?", repairNow: "Request a repair →", assess: "Start assessment →",
    benefits: [
      ["Simple assessment", "Select the initial symptoms in just a few steps"],
      ["Track every step", "Use your repair ID to follow the latest progress"],
      ["Clear information", "See repair status and estimated price range clearly"],
    ],
    lineLabel: "Chat with the shop on LINE", chat: "Chat with us",
  },
} as const;

export default function HomeClient() {
  const { language, toggleLanguage } = useLanguage();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const text = copy[language];

  async function search(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setMessage("");
    try {
      const response = await fetch(`/api/repairs/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json() as { repair?: { id: string }; error?: string };
      if (!response.ok || !data.repair) throw new Error(language === "en" ? text.notFound : (data.error || text.notFound));
      window.location.href = `/repair/status/${encodeURIComponent(data.repair.id)}`;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.notFound);
      setSearching(false);
    }
  }

  return (
    <main className="customer-home">
      <header className="customer-header">
        <a className="online-brand" href="/" aria-label={text.homeLabel}><span className="online-logo" aria-hidden="true">🔧</span><strong>FixIt Online</strong></a>
        <div className="customer-header-actions"><button className="language-toggle" type="button" onClick={() => { toggleLanguage(); setMessage(""); }} aria-label={text.languageLabel}>{language === "th" ? "EN" : "TH"}</button><a href="/admin" aria-label={text.adminLabel}>◎</a></div>
      </header>
      <section className="customer-hero">
        <p className="customer-kicker">{text.kicker}</p>
        <h1>FixIt Online</h1>
        <h2>{text.subtitle} <em>{text.expert}</em></h2>
        <form className="repair-search-card" onSubmit={search}>
          <label htmlFor="repair-search">{text.searchLabel}</label>
          <div><input id="repair-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} /><button disabled={searching}>{searching ? text.searching : text.search}</button></div>
          {message && <p role="alert">{message}</p>}
        </form>
        <section className="device-section" aria-labelledby="device-title">
          <div className="section-heading"><div><span>{text.categoryLabel}</span><h2 id="device-title">{text.categoryTitle}</h2></div><a href="/repair/new">{text.repairNow}</a></div>
          <div className="device-grid">
            {categories.map((category) => { const categoryText = category[language]; return <a className="device-card" href={`/repair/new?device=${category.id}`} key={category.id}><span>{category.icon}</span><h3>{categoryText.title}</h3><p>{categoryText.detail}</p><b>{text.assess}</b></a>; })}
          </div>
        </section>
      </section>
      <section className="home-benefits">
        {text.benefits.map((benefit, index) => <article key={benefit[0]}><span>{String(index + 1).padStart(2, "0")}</span><strong>{benefit[0]}</strong><p>{benefit[1]}</p></article>)}
      </section>
      <a className="line-float" href="/api/line/chat" target="_blank" rel="noreferrer" aria-label={text.lineLabel}><span className="line-icon">LINE</span><span>{text.chat}</span></a>
    </main>
  );
}
