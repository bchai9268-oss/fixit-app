import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "FixIt Online | แจ้งซ่อมและติดตามสถานะออนไลน์";
const description = "แจ้งซ่อมโทรศัพท์และคอมพิวเตอร์ ประเมินอาการ ติดตามสถานะ และจัดการคิวงานซ่อมออนไลน์";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  return { title, description, icons: { icon: "/favicon.svg" }, openGraph: { title, description, type: "website", locale: "th_TH", images: [{ url: image, width: 1732, height: 909, alt: "FixIt Online ระบบจัดการร้านซ่อม" }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
