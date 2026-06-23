'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { CloseIcon, SparklesIcon } from '@/shared/components/Icons';


export default function LandingPage() {
  const { t, locale, setLocale, dir } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary selection:text-white" dir={dir}>
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
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
              <a href="#how-it-works" className="hover:text-primary transition-colors">{t('howItWorks')}</a>
              <a href="#why-us" className="hover:text-primary transition-colors">{t('whyUs')}</a>
              <a href="#about-us" className="hover:text-primary transition-colors">{t('aboutUs')}</a>
            </nav>
          </div>

          {/* Desktop Right Actions (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 shrink-0"
            >
              🌐 {locale === 'ar' ? 'English' : 'العربية'}
            </button>

            {/* Auth CTAs */}
            <Link
              href="/login"
              className="text-sm font-bold text-slate-700 hover:text-primary transition-colors px-3 py-2 shrink-0"
            >
              {t('login')}
            </Link>
            <Link
              href="/register"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0"
            >
              {t('register')}
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer (Smooth Slide Bar outside header to avoid stacking/transparency bugs) */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/65 backdrop-blur-sm transition-all duration-300 overscroll-none ${
          isMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`} 
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 bottom-0 w-72 max-w-xs bg-white p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out overscroll-none ${
            dir === 'rtl' ? 'right-0' : 'left-0'
          } ${
            isMenuOpen 
              ? 'translate-x-0' 
              : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')
            }`} 
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
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-5 text-base font-bold text-slate-700">
              <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors pb-2 border-b border-slate-50">{t('howItWorks')}</a>
              <a href="#why-us" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors pb-2 border-b border-slate-50">{t('whyUs')}</a>
              <a href="#about-us" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors pb-2 border-b border-slate-50">{t('aboutUs')}</a>
            </nav>
          </div>
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <button
              onClick={() => { setLocale(locale === 'ar' ? 'en' : 'ar'); setIsMenuOpen(false); }}
              className="w-full py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>
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
              className="block w-full text-center bg-primary hover:bg-primary-hover text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-primary/10 transition-all"
            >
              {t('register')}
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column - Content */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase">
                🚀 {locale === 'ar' ? 'منصة الربح المفضلة في مصر' : 'The Leading Dropshipping Platform'}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 leading-[1.15] tracking-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all text-center"
                >
                  {t('startNow')}
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-bold text-lg px-8 py-4 rounded-2xl transition-all text-center bg-white/50"
                >
                  {t('howItWorks')}
                </a>
              </div>
            </div>

            {/* Right Column - Premium Graphic Visual */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="absolute w-72 h-72 bg-primary/20 rounded-full blur-3xl -top-12 -left-12 -z-10 animate-pulse"></div>
              <div className="absolute w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -bottom-12 -right-12 -z-10"></div>
              
              {/* Glassmorphic Mockup Container */}
              <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary to-indigo-500"></div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">tharwaa.com/dashboard</span>
                </div>

                <div className="space-y-6">
                  {/* Mock Wallet Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                    <span className="text-xs text-slate-400 block mb-1">{locale === 'ar' ? 'الرصيد المتاح للسحب' : 'Available Balance'}</span>
                    <span className="text-3xl font-black block tracking-tight">12,450.80 EGP</span>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-300">
                      <span>🏦 {locale === 'ar' ? 'فودافون كاش / بنك' : 'Vodafone Cash / Bank'}</span>
                      <span className="bg-primary/20 text-primary font-bold px-2 py-0.5 rounded">{locale === 'ar' ? 'نشط' : 'Active'}</span>
                    </div>
                  </div>

                  {/* Mock Order Row */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{locale === 'ar' ? 'آخر العمليات' : 'Recent Operations'}</span>
                    {[
                      { id: '#O-9921', status: 'Delivered', profit: '+120 EGP', color: 'bg-emerald-50 text-emerald-600', textAr: 'تم التوصيل' },
                      { id: '#O-9918', status: 'Shipped', profit: '+180 EGP', color: 'bg-indigo-50 text-indigo-600', textAr: 'قيد الشحن' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-200/60 flex items-center justify-center font-bold text-xs text-slate-600">📦</span>
                          <div>
                            <span className="text-sm font-bold text-slate-700 block">{item.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${item.color}`}>
                              {locale === 'ar' ? item.textAr : item.status}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-primary">{item.profit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Timeline Steps Section */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800">
              {t('stepsTitle')}
            </h2>
            <p className="text-slate-500 font-medium">
              {locale === 'ar' 
                ? 'رحلة سهلة وبسيطة من التسجيل حتى استلام أول ربح لك في حسابك البنكي أو محفظتك الإلكترونية'
                : 'A clean and simple journey from signing up to receiving your first profit in your wallet'}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 relative">
            {/* Step Card 1 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-4 sm:p-8 rounded-2xl sm:rounded-3xl hover:shadow-xl transition-all duration-300 relative group">
              <span className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <h3 className="text-sm sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{t('step1Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{t('step1Desc')}</p>
            </div>

            {/* Step Card 2 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-4 sm:p-8 rounded-2xl sm:rounded-3xl hover:shadow-xl transition-all duration-300 relative group">
              <span className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </span>
              <h3 className="text-sm sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{t('step2Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{t('step2Desc')}</p>
            </div>

            {/* Step Card 3 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-4 sm:p-8 rounded-2xl sm:rounded-3xl hover:shadow-xl transition-all duration-300 relative group">
              <span className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-50 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <h3 className="text-sm sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{t('step3Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{t('step3Desc')}</p>
            </div>

            {/* Step Card 4 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-4 sm:p-8 rounded-2xl sm:rounded-3xl hover:shadow-xl transition-all duration-300 relative group">
              <span className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-sm sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{t('step4Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{t('step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <section id="stats" className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-indigo-500/10 opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <span className="text-4xl sm:text-5xl font-black text-primary block tracking-tight">{t('statsActiveMarketers')}</span>
              <span className="text-sm text-slate-400 font-semibold">{locale === 'ar' ? 'مسوق يربح يومياً معنا' : 'Marketers earning daily with us'}</span>
            </div>
            <div className="space-y-2 border-y md:border-y-0 md:border-x border-white/10 py-8 md:py-0">
              <span className="text-4xl sm:text-5xl font-black text-primary block tracking-tight">{t('statsOrdersDelivered')}</span>
              <span className="text-sm text-slate-400 font-semibold">{locale === 'ar' ? 'طلب تم شحنه وتسليمه بنجاح' : 'Delivered and paid orders'}</span>
            </div>
            <div className="space-y-2">
              <span className="text-4xl sm:text-5xl font-black text-primary block tracking-tight">{t('statsPaidOut')}</span>
              <span className="text-sm text-slate-400 font-semibold">{locale === 'ar' ? 'دفعت بالكامل للمسوقين' : 'Paid out directly to marketers'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="py-20 lg:py-32 bg-white relative overflow-hidden">
        {/* Background blobs for visual premium polish */}
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Description / Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                👥 {t('aboutUs')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 leading-tight">
                {t('aboutUsTitle')}
              </h2>
              <p className="text-lg text-primary font-bold leading-relaxed">
                {t('aboutUsSubtitle')}
              </p>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
                <p>{t('aboutUsDesc1')}</p>
                <p>{t('aboutUsDesc2')}</p>
              </div>

              {/* Vision & Mission Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="p-6 bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200/80 hover:shadow-lg rounded-2xl transition-all duration-300">
                  <span className="text-2xl mb-3 block">🎯</span>
                  <h4 className="text-base font-bold text-slate-800 mb-2">{t('aboutUsVision')}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{t('aboutUsVisionDesc')}</p>
                </div>
                <div className="p-6 bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200/80 hover:shadow-lg rounded-2xl transition-all duration-300">
                  <span className="text-2xl mb-3 block">🤝</span>
                  <h4 className="text-base font-bold text-slate-800 mb-2">{t('aboutUsMission')}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{t('aboutUsMissionDesc')}</p>
                </div>
              </div>
            </div>

            {/* Core Values Column (Glassmorphic Mock Card) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-sm bg-gradient-to-br from-slate-950 to-slate-850 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
                
                <h3 className="text-xl font-black mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                  <span>💡</span> {locale === 'ar' ? 'قيمنا الجوهرية' : 'Our Core Values'}
                </h3>
                
                <ul className="space-y-5">
                  {[
                    { title: locale === 'ar' ? 'الشفافية الكاملة' : 'Full Transparency', desc: locale === 'ar' ? 'حساب دقيق للأرباح دون رسوم خفية.' : 'Accurate profit tracking with no hidden fees.' },
                    { title: locale === 'ar' ? 'الجودة والموثوقية' : 'Quality & Reliability', desc: locale === 'ar' ? 'اختبار دقيق للمنتجات قبل الشحن لعملائك.' : 'Rigorous product testing before shipping to customers.' },
                    { title: locale === 'ar' ? 'تمكين المسوقين' : 'Marketer Empowerment', desc: locale === 'ar' ? 'دعم تدريبي وتقني متكامل ومستمر لمساعدتك على النجاح.' : 'Continuous training and technical support to ensure your success.' }
                  ].map((value, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                      <div>
                        <strong className="text-sm font-bold text-slate-100 block">{value.title}</strong>
                        <span className="text-xs text-slate-400 font-medium mt-0.5 block leading-relaxed">{value.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Us Features Grid */}
      <section id="why-us" className="py-20 lg:py-32 bg-slate-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <SparklesIcon className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'مميزات المنصة' : 'Platform Features'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {t('whyTharwaa')}
            </h2>
            <p className="text-slate-500 font-medium">
              {locale === 'ar' 
                ? 'نوفر لك البنية التحتية المتكاملة لتوفير الجهد والتركيز على التسويق وتحقيق المبيعات فقط'
                : 'We provide you with the full commerce infrastructure so you can focus entirely on marketing and sales'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="12" x="3" y="6" rx="2" />
                    <path d="M3 10h18" />
                    <path d="M7 14h2" />
                  </svg>
                ),
                titleKey: 'featuresNoCapital',
                descKey: 'featuresNoCapitalDesc',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                titleKey: 'featuresFastDelivery',
                descKey: 'featuresFastDeliveryDesc',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                titleKey: 'featuresHighMargins',
                descKey: 'featuresHighMarginsDesc',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                titleKey: 'featuresInstantWithdrawal',
                descKey: 'featuresInstantWithdrawalDesc',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                titleKey: 'featuresReadyContent',
                descKey: 'featuresReadyContentDesc',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M5.636 5.636a9 9 0 000 12.728m0 0l2.829-2.829m-2.829 2.829L3 21M12 12a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                ),
                titleKey: 'featuresSupport',
                descKey: 'featuresSupportDesc',
              },
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white/80 backdrop-blur-sm border border-slate-100 hover:border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden"
              >
                {/* Accent line on hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Background glow decoration */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/5 text-primary flex items-center justify-center text-2xl font-bold mb-5 shadow-sm group-hover:scale-110 group-hover:from-primary group-hover:to-indigo-500 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors">
                  {t(feature.titleKey)}
                </h3>
                
                <p className="text-sm text-slate-500 leading-relaxed font-medium relative z-10">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
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
