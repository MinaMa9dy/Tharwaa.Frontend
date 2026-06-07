'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/shared/context/LocaleContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import { marketerService } from '@/features/marketers/api/marketerService';

export default function MarketerLayout({ children }: { children: React.ReactNode }) {
  const { t, dir, locale, setLocale } = useLocale();
  const { user, logout, initialize } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const pathname = usePathname();
  const [balance, setBalance] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user?.id) {
      // Fetch cart items count
      fetchCart();
      // Fetch marketer balance
      marketerService.getBalance(user.id).then((res) => {
        if (res.success && res.data) {
          setBalance(res.data.balance);
        }
      });
    }
  }, [user, fetchCart]);

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const menuItems = [
    { name: 'المنتجات', enName: 'Products', path: '/marketer/products' },
    { name: 'طلباتي', enName: 'My Orders', path: '/marketer/orders' },
    { name: 'الأرباح والسحوبات', enName: 'Withdrawals', path: '/marketer/withdrawals' },
    { name: 'الإحصائيات', enName: 'Dashboard', path: '/marketer/dashboard' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900" dir={dir}>
      {/* Marketer Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/marketer/products" className="flex items-center gap-2 group shrink-0">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-primary/20">
                ث
              </span>
              <span className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">
                {t('navBrand')}
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-bold text-slate-600">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`transition-colors py-1 border-b-2 ${
                    pathname === item.path
                      ? 'text-primary border-primary'
                      : 'text-slate-600 border-transparent hover:text-primary'
                  }`}
                >
                  {locale === 'ar' ? item.name : item.enName}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Language Switcher */}
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-all shrink-0"
            >
              🌐 {locale === 'ar' ? 'English' : 'العربية'}
            </button>

            {/* Marketer Balance Display */}
            {balance !== null && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs sm:text-sm font-extrabold">
                <span>💸 {locale === 'ar' ? 'رصيدك المعلق:' : 'Balance:'}</span>
                <span>{balance.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
            )}

            {/* Cart Icon Button */}
            <Link
              href="/marketer/cart"
              className="relative p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center shrink-0"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown / User Details */}
            <div className="hidden sm:flex items-center gap-3 border-r border-slate-200 pr-3 sm:pr-4">
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-slate-800">
                  {mounted && user ? `${user.firstName} ${user.lastName}` : 'مسوق ثروة'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {locale === 'ar' ? 'مسوق' : 'Marketer'}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title={locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
            </div>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex md:hidden w-10 h-10 rounded-lg border border-slate-200 items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

      </header>

      <div
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 overscroll-none ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`absolute top-0 bottom-0 w-72 max-w-xs bg-white p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out overscroll-none ${
            dir === 'rtl' ? 'right-0' : 'left-0'
          } ${isMobileMenuOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm">ث</span>
                <span className="text-lg font-black text-slate-800">{t('navBrand')}</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-4 text-base font-bold text-slate-700">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`pb-2 border-b border-slate-100 hover:text-primary ${
                    pathname === item.path ? 'text-primary' : 'text-slate-700'
                  }`}
                >
                  {locale === 'ar' ? item.name : item.enName}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="space-y-4 border-t border-slate-100 pt-6">
            {balance !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-extrabold">
                <span>💸 {locale === 'ar' ? 'الرصيد المعلق:' : 'Pending Balance:'}</span>
                <span>{balance.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
            )}
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold text-sm uppercase">
                {mounted && user?.firstName?.[0] || 'M'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-800">
                  {mounted && user ? `${user.firstName} ${user.lastName}` : 'مسوق ثروة'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {locale === 'ar' ? 'حساب مسوق' : 'Marketer Account'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 transition-colors mb-2"
            >
              🌐 {locale === 'ar' ? 'English' : 'العربية'}
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"></path>
              </svg>
              {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
