import type { Metadata } from "next";
import { Cairo, Outfit } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/shared/context/LocaleContext";
import WhatsAppSupport from "@/shared/components/WhatsAppSupport";

import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.85)',
                color: '#1e293b',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
                borderRadius: '20px',
                padding: '12px 20px',
                fontFamily: 'var(--font-cairo), var(--font-outfit), sans-serif',
                fontSize: '13px',
                fontWeight: '700',
              },
              success: {
                style: {
                  background: 'rgba(240, 253, 244, 0.9)',
                  border: '1px solid rgba(74, 222, 128, 0.4)',
                  color: '#166534',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f0fdf4',
                },
              },
              error: {
                style: {
                  background: 'rgba(254, 242, 242, 0.9)',
                  border: '1px solid rgba(248, 113, 113, 0.4)',
                  color: '#991b1b',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
            }}
          />
          {children}
          <WhatsAppSupport />
          <Analytics />
          <SpeedInsights />
        </LocaleProvider>
      </body>
    </html>
  );
}

