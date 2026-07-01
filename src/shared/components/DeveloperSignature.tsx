'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';

export default function DeveloperSignature() {
  const { locale, dir } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Elegant, styled console signature for tech-savvy visitors
    console.log(
      "%c🧑‍💻 Designed & Developed by Mina Magdy %c| Looking for a top-tier Fullstack Developer? Let's build something amazing! Contact: mandymina789@gmail.com | +201211226807", 
      "background: #1e293b; color: #10b981; padding: 8px 12px; font-weight: bold; font-size: 13px; border-radius: 8px 0 0 8px; font-family: sans-serif;",
      "background: #10b981; color: #ffffff; padding: 8px 12px; font-weight: bold; font-size: 11px; border-radius: 0 8px 8px 0; font-family: sans-serif;"
    );

    // Close signature if clicked outside
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const content = {
    ar: {
      name: "مينا مجدي",
      title: "مطور ويب متكامل (Fullstack)",
      description: "أقوم بتصميم وتطوير تطبيقات ويب عالية الأداء وتجربة مستخدم متميزة. إذا نال هذا المشروع إعجابك وترغب في التعاون في مشروعك القادم، فلا تتردد في التواصل معي!",
      email: "البريد الإلكتروني",
      phone: "الهاتف"
    },
    en: {
      name: "Mina Magdy",
      title: "Fullstack Web Developer",
      description: "I design and build high-performance, premium web applications. If you love this platform and want to collaborate on your next project, feel free to reach out!",
      email: "Email",
      phone: "Phone"
    }
  };

  const t = locale === 'ar' ? content.ar : content.en;

  return (
    <div 
      ref={containerRef} 
      className={`fixed bottom-4 z-50 select-none transition-all duration-500 ${
        dir === 'rtl' ? 'right-4' : 'left-4'
      }`}
    >
      {/* Subtle indicator: extremely light opacity so it blends in cleanly */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-7 h-7 rounded-full bg-slate-800/5 hover:bg-slate-800/10 border border-slate-200/20 hover:border-slate-300/50 flex items-center justify-center transition-all cursor-pointer active:scale-95 group shadow-sm"
        title="Developer Info"
      >
        <span className="text-[10px] font-black text-slate-400/40 group-hover:text-slate-500/80 transition-colors">
          ⚡
        </span>
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div 
          className={`absolute bottom-9 w-72 p-4 rounded-2xl bg-white/90 backdrop-blur-lg border border-slate-200 shadow-2xl animate-fadeIn space-y-3 font-sans ${
            dir === 'rtl' ? 'right-0 text-right' : 'left-0 text-left'
          }`}
          dir={dir}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🧑‍💻</span>
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{t.name}</h4>
              <p className="text-[10px] font-bold text-slate-400">{t.title}</p>
            </div>
          </div>
          <p className="text-[11.5px] text-slate-500 font-bold leading-relaxed">
            {t.description}
          </p>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600 font-extrabold">
            <a 
              href="mailto:mandymina789@gmail.com" 
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <span>📧</span>
              <span className="text-slate-400 font-semibold text-[10px] ml-0.5">({t.email}):</span>
              <span dir="ltr">mandymina789@gmail.com</span>
            </a>
            <a 
              href="tel:01211226807" 
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <span>📞</span>
              <span className="text-slate-400 font-semibold text-[10px] ml-0.5">({t.phone}):</span>
              <span dir="ltr">01211226807</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
