import type { Metadata } from "next";
import { Cairo, Outfit } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/shared/context/LocaleContext";

import { Toaster } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ثروة | منصة البيع بالعمولة والدروب شيبنج الأولى",
  description: "منصة ثروة تمكنك من بدء تجارتك الإلكترونية بدون رأس مال أو مخزون مع خدمات تخزين وشحن ممتازة وسريعة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${outfit.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden" suppressHydrationWarning>
        <LocaleProvider>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
