'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { CloseIcon } from '@/shared/components/Icons';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, dir, t } = useLocale();
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans" dir={dir}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform shrink-0">
                ث
              </span>
              <span className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">
                {t('navBrand')}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/products" className="hover:text-primary transition-colors font-bold">
                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </Link>
              <Link href="/#how-it-works" className="hover:text-primary transition-colors">
                {t('howItWorks')}
              </Link>
              <Link href="/#why-us" className="hover:text-primary transition-colors">
                {t('whyUs')}
              </Link>
            </nav>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              🌐 {locale === 'ar' ? 'English' : 'العربية'}
            </button>

            {mounted && user ? (
              <Link
                href={user.role === 'Admin' || user.role === 'Supervisor' || user.role === 'Supplier'
                  ? '/admin/dashboard'
                  : '/marketer/products'}
                className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/10 hover:-translate-y-0.5 transition-all"
              >
                {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-700 hover:text-primary transition-colors px-3 py-2"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/10 hover:-translate-y-0.5 transition-all"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex md:hidden w-10 h-10 rounded-lg border border-slate-200 items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/65 backdrop-blur-sm transition-all duration-300 overscroll-none ${
          isMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`absolute top-0 bottom-0 w-72 max-w-xs bg-white p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out overscroll-none ${
            dir === 'rtl' ? 'right-0' : 'left-0'
          } ${isMenuOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm shadow-md">ث</span>
                <span className="text-lg font-black text-slate-800">{t('navBrand')}</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-5 text-base font-bold text-slate-700">
              <Link href="/products" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors pb-2 border-b border-slate-100">
                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </Link>
              <Link href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors pb-2 border-b border-slate-100">
                {t('howItWorks')}
              </Link>
              <Link href="/#why-us" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors pb-2 border-b border-slate-100">
                {t('whyUs')}
              </Link>
            </nav>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <button
              onClick={() => { setLocale(locale === 'ar' ? 'en' : 'ar'); setIsMenuOpen(false); }}
              className="w-full py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              🌐 {locale === 'ar' ? 'English' : 'العربية'}
            </button>
            {mounted && user ? (
              <Link
                href={user.role === 'Admin' || user.role === 'Supervisor' || user.role === 'Supplier'
                  ? '/admin/dashboard'
                  : '/marketer/products'}
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center bg-primary hover:bg-primary/90 text-white text-sm font-bold py-3 rounded-xl shadow transition-all"
              >
                {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center text-sm font-bold text-slate-700 hover:text-primary transition-colors py-2"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-primary hover:bg-primary/90 text-white text-sm font-bold py-3 rounded-xl shadow transition-all"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm shadow-md">ث</span>
            <span className="text-lg font-black text-white">{t('navBrand')}</span>
          </div>
          <span className="text-xs font-semibold">
            &copy; {new Date().getFullYear()} {t('navBrand')}. {locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}
          </span>
        </div>
      </footer>
    </div>
  );
}
