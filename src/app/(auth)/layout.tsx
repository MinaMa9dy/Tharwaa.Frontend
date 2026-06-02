'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t, dir, locale, setLocale } = useLocale();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans" dir={dir}>
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
              ث
            </span>
            <span className="text-xl font-black text-slate-800">
              {t('navBrand')}
            </span>
          </Link>
          <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="px-2.5 py-1 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            🌐 {locale === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute w-80 h-80 bg-primary/10 rounded-full blur-3xl -top-20 -left-20 -z-10"></div>
        <div className="absolute w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -bottom-20 -right-20 -z-10"></div>

        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-indigo-500 rounded-t-3xl"></div>
          {children}
        </div>
      </div>
    </div>
  );
}
