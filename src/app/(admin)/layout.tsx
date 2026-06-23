'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/shared/context/LocaleContext';
import { CloseIcon } from '@/shared/components/Icons';

import { useAuthStore } from '@/features/auth/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t, dir, locale, setLocale } = useLocale();
  const { user, logout, initialize } = useAuthStore();
  const pathname = usePathname();
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

  const menuItems = [
    { name: 'لوحة التحكم', enName: 'Dashboard', path: '/admin/dashboard', roles: ['Admin', 'Supervisor'] },
    { name: 'إدارة المشرفين', enName: 'Supervisors', path: '/admin/supervisors', roles: ['Admin'] },
    { name: 'إدارة الموردين', enName: 'Suppliers', path: '/admin/suppliers', roles: ['Admin'] },
    { name: 'إدارة المنتجات', enName: 'Products', path: '/admin/products', roles: ['Admin'] },
    { name: 'إدارة الأقسام', enName: 'Categories', path: '/admin/categories', roles: ['Admin'] },
    { name: 'إدارة الخصائص', enName: 'Attributes', path: '/admin/attributes', roles: ['Admin'] },
    { name: 'إدارة الإعلانات البانر', enName: 'Banners', path: '/admin/banners', roles: ['Admin'] },
    { name: 'المسوقين والعملاء', enName: 'Marketers', path: '/admin/marketers', roles: ['Admin'] },
    { name: 'طلبات الشحن', enName: 'Orders', path: '/admin/orders', roles: ['Admin', 'Supervisor'] },
    { name: 'طلبات السحب', enName: 'Withdrawals', path: '/admin/withdrawals', roles: ['Admin'] },
    { name: 'الإعدادات العامة', enName: 'System Settings', path: '/admin/settings', roles: ['Admin'] },
  ];

  const visibleMenuItems = (!mounted || !user)
    ? []
    : menuItems.filter(item => item.roles.includes(user.role as any));

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 animate-fadeIn" dir={dir}>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white border-e border-slate-800 shrink-0 sticky top-0 h-screen">
        {/* Sidebar Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2.5 justify-end">
          <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            {t('navBrand')} <span className="text-[9px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase">إدارة</span>
          </span>
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-lg shadow-primary/20">
            أ
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 text-right">
          {mounted && user ? (
            visibleMenuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all justify-end ${
                    isActive
                      ? 'bg-primary text-white font-black shadow-md shadow-primary/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex-1">{locale === 'ar' ? item.name : item.enName}</span>
                </Link>
              );
            })
          ) : (
            <div className="animate-pulse space-y-3 px-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-10 bg-slate-800/50 rounded-xl w-full"></div>
              ))}
            </div>
          )}
        </nav>

        {/* Sidebar Footer (User details) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          {mounted && user ? (
            <div className="flex items-center gap-3 p-2 rounded-xl justify-end">
              <div className="flex-1 min-w-0 text-right overflow-hidden">
                <h5 className="text-xs font-black text-white truncate">
                  {user.firstName} {user.lastName}
                </h5>
                <p className="text-[9px] text-primary font-black uppercase tracking-wide">
                  {user.role}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-primary font-black text-sm uppercase shrink-0 border border-slate-700">
                {user.firstName?.[0]}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-xl justify-end animate-pulse">
              <div className="flex-1 min-w-0 text-right overflow-hidden space-y-1">
                <div className="h-3 w-20 bg-slate-800 rounded ml-auto"></div>
                <div className="h-2.5 w-12 bg-slate-800/80 rounded ml-auto"></div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 shrink-0 border border-slate-700"></div>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="w-full mt-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-red-950/20 hover:border-red-900/40 hover:text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-slate-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Right/Left Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar Header */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex lg:hidden w-10 h-10 rounded-xl border border-slate-200 items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            {/* Mobile Logo Brand */}
            <Link href="/admin/dashboard" className="flex lg:hidden items-center gap-2 group shrink-0">
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-primary/20">
                أ
              </span>
              <span className="text-base font-black tracking-tight text-slate-800">
                {t('navBrand')}
              </span>
            </Link>

            {/* Desktop Page Title / Breadcrumb Placeholder */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                {pathname.split('/').slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-600 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all shrink-0 cursor-pointer"
            >
              🌐 {locale === 'ar' ? 'English' : 'العربية'}
            </button>

            {/* Top Bar Profile Details (Shortened version) */}
            <div className="hidden sm:flex items-center gap-2 pl-2">
              {mounted && user ? (
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold text-xs uppercase border border-slate-200 shadow-sm animate-fadeIn">
                  {user.firstName?.[0]}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100/50 border border-slate-200/50 shadow-sm animate-pulse"></div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 overscroll-none ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`absolute top-0 bottom-0 w-72 max-w-xs bg-slate-900 p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out overscroll-none overflow-y-auto ${
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
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800 text-slate-400 hover:text-white"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-4 text-base font-bold text-slate-300 text-right">
              {mounted && user ? (
                visibleMenuItems.map((item) => (
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
                ))
              ) : (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-8 bg-slate-800/50 rounded-lg w-full"></div>
                  ))}
                </div>
              )}
            </nav>
          </div>
          
          <div className="space-y-4 border-t border-slate-800 pt-6">
            {mounted && user ? (
              <div className="flex items-center gap-3 p-2 justify-end">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-white">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[10px] text-primary font-semibold tracking-wide uppercase">
                    {user.role}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary font-extrabold text-sm uppercase shrink-0 border border-slate-700">
                  {user.firstName?.[0]}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2 justify-end animate-pulse">
                <div className="flex flex-col items-end space-y-1">
                  <div className="h-3.5 w-24 bg-slate-800 rounded"></div>
                  <div className="h-3 w-16 bg-slate-800/80 rounded"></div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 shrink-0"></div>
              </div>
            )}
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors mb-2 cursor-pointer border border-slate-700"
            >
              🌐 {locale === 'ar' ? 'English' : 'العربية'}
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full py-3 rounded-xl bg-slate-800 text-red-400 hover:bg-slate-700 hover:text-red-300 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
