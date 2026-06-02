'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/shared/context/LocaleContext';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t, dir, locale, setLocale } = useLocale();
  const { user, logout, initialize } = useAuthStore();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const menuItems = [
    { name: 'لوحة التحكم', enName: 'Dashboard', path: '/admin/dashboard', roles: ['Admin', 'Supervisor'] },
    { name: 'إدارة المنتجات', enName: 'Products', path: '/admin/products', roles: ['Admin'] },
    { name: 'إدارة الأقسام', enName: 'Categories', path: '/admin/categories', roles: ['Admin'] },
    { name: 'المسوقين والعملاء', enName: 'Marketers', path: '/admin/marketers', roles: ['Admin', 'Supervisor'] },
    { name: 'طلبات الشحن', enName: 'Orders', path: '/admin/orders', roles: ['Admin', 'Supervisor'] },
    { name: 'طلبات السحب', enName: 'Withdrawals', path: '/admin/withdrawals', roles: ['Admin', 'Supervisor'] },
    { name: 'الإعدادات العامة', enName: 'System Settings', path: '/admin/settings', roles: ['Admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    !user || item.roles.includes(user.role as any)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900" dir={dir}>
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group shrink-0">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-primary/20 animate-pulse">
                أ
              </span>
              <span className="text-lg sm:text-2xl font-black tracking-tight text-white">
                {t('navBrand')} <span className="text-xs font-black text-primary uppercase ml-1">إدارة</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 lg:gap-8 text-sm font-bold text-slate-300">
              {visibleMenuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`transition-colors py-1 border-b-2 ${
                    pathname === item.path
                      ? 'text-primary border-primary font-black'
                      : 'text-slate-300 border-transparent hover:text-primary'
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
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-black text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all shrink-0"
            >
              🌐 {locale === 'ar' ? 'English' : 'العربية'}
            </button>

            {/* Profile Dropdown / User Details */}
            <div className="hidden sm:flex items-center gap-3 pr-3 sm:pr-4">
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-white">
                  {user ? `${user.firstName} ${user.lastName}` : 'المدير العام'}
                </span>
                <span className="text-[9px] text-primary font-extrabold uppercase tracking-wide">
                  {user?.role || 'Admin'}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-800 transition-colors"
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
              className="flex lg:hidden w-10 h-10 rounded-lg border border-slate-700 items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 overscroll-none ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={`absolute top-0 bottom-0 w-72 max-w-xs bg-slate-900 p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out overscroll-none ${
              dir === 'rtl' ? 'right-0' : 'left-0'
            } ${isMobileMenuOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm">أ</span>
                  <span className="text-lg font-black text-white">{t('navBrand')}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <nav className="flex flex-col gap-4 text-base font-bold text-slate-300">
                {visibleMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`pb-2 border-b border-slate-800 hover:text-primary ${
                      pathname === item.path ? 'text-primary' : 'text-slate-300'
                    }`}
                  >
                    {locale === 'ar' ? item.name : item.enName}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary font-extrabold text-sm uppercase">
                  {user?.firstName?.[0] || 'A'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-white">
                    {user ? `${user.firstName} ${user.lastName}` : 'المدير العام'}
                  </span>
                  <span className="text-[10px] text-primary font-semibold tracking-wide uppercase">
                    {user?.role || 'Admin'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors mb-2"
              >
                🌐 {locale === 'ar' ? 'English' : 'العربية'}
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-3 rounded-xl bg-slate-800 text-red-400 hover:bg-slate-700 hover:text-red-300 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
