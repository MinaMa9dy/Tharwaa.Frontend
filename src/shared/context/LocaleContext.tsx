'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'ar' | 'en';

type Translations = Record<string, Record<Locale, string>>;

const translations: Translations = {
  // Common Layout & Navbar
  navBrand: { ar: 'ثروة', en: 'Tharwaa' },
  howItWorks: { ar: 'كيف نعمل؟', en: 'How it works?' },
  aboutUs: { ar: 'من نحن؟', en: 'About us' },
  contactUs: { ar: 'اتصل بنا', en: 'Contact us' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب', en: 'Register' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  products: { ar: 'المنتجات', en: 'Products' },
  cart: { ar: 'عربة التسوق', en: 'Shopping Cart' },
  wishlist: { ar: 'المفضلة', en: 'Wishlist' },
  myOrders: { ar: 'طلباتي', en: 'My Orders' },
  withdrawals: { ar: 'الطلبات المالية', en: 'Withdrawals' },
  profile: { ar: 'الملف الشخصي', en: 'Profile' },
  arabic: { ar: 'العربية', en: 'Arabic' },
  english: { ar: 'الإنجليزية', en: 'English' },

  // Landing Page
  heroTitle: { ar: 'ابدأ تجارتك الإلكترونية اليوم بدون رأس مال', en: 'Start your E-Commerce business today with zero capital' },
  heroSubtitle: { ar: 'ثروة توفر لك المنتجات، التخزين، الشحن والتحصيل. كل ما عليك فعله هو التسويق وجني الأرباح بكل سهولة.', en: 'Tharwaa provides you with products, inventory, shipping, and collection. All you have to do is market and earn profits.' },
  startNow: { ar: 'ابدأ الآن مجاناً', en: 'Start Now for Free' },
  stepsTitle: { ar: 'خطوات العمل مع ثروة', en: 'How to work with Tharwaa' },
  step1Title: { ar: '١. سجل حسابك مجاناً', en: '1. Register for Free' },
  step1Desc: { ar: 'أنشئ حساب مسوق في ثوانٍ وابدأ فوراً بدون أي رسوم اشتراك.', en: 'Create a marketer account in seconds and start immediately without any fees.' },
  step2Title: { ar: '٢. اختر المنتجات وسوق لها', en: '2. Pick Products & Market' },
  step2Desc: { ar: 'تصفح آلاف المنتجات المميزة، حمل الصور والتفاصيل، وسوقها على منصات التواصل.', en: 'Browse thousands of winning products, download assets, and market them on social media.' },
  step3Title: { ar: '٣. اطلب لعملائك', en: '3. Place Customer Orders' },
  step3Desc: { ar: 'عند حصولك على طلب، أدخل بيانات العميل وسعر البيع الذي تحدده.', en: 'Once you get an order, input the customer details and your custom selling price.' },
  step4Title: { ar: '٤. استلم أرباحك', en: '4. Withdraw Your Profits' },
  step4Desc: { ar: 'نقوم بشحن الطلب وتحصيل الأموال، ثم تضاف أرباحك فوراً إلى محفظتك لسحبها.', en: 'We ship the order and collect payment, then your profits are instantly added to your wallet for withdrawal.' },
  whyTharwaa: { ar: 'لماذا تختار منصة ثروة؟', en: 'Why Choose Tharwaa?' },
  featuresFastDelivery: { ar: 'شحن سريع وموثوق', en: 'Fast & Reliable Shipping' },
  featuresFastDeliveryDesc: { ar: 'شحن لجميع المحافظات مع نسب تسليم مرتفعة وتتبع مباشر.', en: 'Shipping to all governorates with high delivery rates and live tracking.' },
  featuresNoCapital: { ar: 'بدون رأس مال أو مخزون', en: 'Zero Capital or Inventory' },
  featuresNoCapitalDesc: { ar: 'لا تحتاج لشراء بضائع مسبقاً، نحن نتحمل عبء المخزون والمخاطر.', en: 'No need to purchase inventory upfront. We handle stock management and risks.' },
  featuresSupport: { ar: 'دعم فني متكامل', en: 'Dedicated Marketer Support' },
  featuresSupportDesc: { ar: 'فريق دعم متواجد على مدار الساعة لمساعدتك في حل أي مشكلة تواجهك وتوفير صور وفيديوهات حصرية للمنتجات.', en: 'A round-the-clock support team to help you succeed and provide exclusive product media.' },
  statsActiveMarketers: { ar: '+٥٠,٠٠٠ مسوق نشط', en: '50k+ Active Marketers' },
  statsOrdersDelivered: { ar: '+١ مليون طلب تم تسليمه', en: '1M+ Delivered Orders' },
  statsPaidOut: { ar: '+٥٠ مليون جنيه أرباح مدفوعة', en: '50M+ EGP Paid Profits' },

  // Auth pages
  email: { ar: 'البريد الإلكتروني', en: 'Email Address' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  firstName: { ar: 'الاسم الأول', en: 'First Name' },
  lastName: { ar: 'اسم العائلة', en: 'Last Name' },
  phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
  confirmPassword: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  forgotPasswordQ: { ar: 'هل نسيت كلمة المرور؟', en: 'Forgot password?' },
  noAccountQ: { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  haveAccountQ: { ar: 'لديك حساب بالفعل؟', en: 'Already have an account?' },
  registerAsMarketer: { ar: 'سجل كمسوق الآن', en: 'Register as Marketer' },
  backToLogin: { ar: 'العودة لتسجيل الدخول', en: 'Back to Login' },

  // Forgot Password, Reset Password, Confirm Email
  forgotPasswordTitle: { ar: 'استعادة كلمة المرور', en: 'Recover Password' },
  forgotPasswordDesc: { ar: 'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور', en: 'Enter your email to receive a password reset link' },
  sendResetLink: { ar: 'إرسال رابط تعيين كلمة المرور', en: 'Send Reset Link' },
  forgotPasswordSuccess: { ar: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فقد تم إرسال رابط لإعادة تعيين كلمة المرور. يرجى التحقق من بريدك الوارد.', en: 'If the email exists in our system, a password reset link has been sent. Please check your inbox.' },
  resetPasswordTitle: { ar: 'تعيين كلمة مرور جديدة', en: 'Reset Password' },
  resetPasswordDesc: { ar: 'يرجى إدخال كلمة المرور الجديدة وتأكيدها', en: 'Please enter and confirm your new password' },
  newPassword: { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  confirmNewPassword: { ar: 'تأكيد كلمة المرور الجديدة', en: 'Confirm New Password' },
  resetPasswordSuccess: { ar: 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.', en: 'Password reset successfully! You can now log in with your new password.' },
  confirmEmailTitle: { ar: 'تأكيد البريد الإلكتروني', en: 'Confirm Email' },
  confirmEmailSuccess: { ar: 'تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.', en: 'Your email has been confirmed successfully! You can now log in.' },
  confirmEmailError: { ar: 'فشل تأكيد البريد الإلكتروني. قد يكون الرابط منتهي الصلاحية أو غير صالح.', en: 'Email confirmation failed. The link may have expired or is invalid.' },
  confirmingEmail: { ar: 'جاري تأكيد بريدك الإلكتروني، يرجى الانتظار...', en: 'Confirming your email, please wait...' },
  resendConfirmationTitle: { ar: 'إعادة إرسال رابط التأكيد', en: 'Resend Confirmation Link' },
  resendConfirmationSuccess: { ar: 'تم إرسال رابط تأكيد جديد إلى بريدك الإلكتروني.', en: 'A new confirmation link has been sent to your email.' },
  resendConfirmationButton: { ar: 'إعادة إرسال رابط التأكيد', en: 'Resend Confirmation Email' },
  emailRequired: { ar: 'البريد الإلكتروني مطلوب', en: 'Email is required' },
  invalidEmail: { ar: 'بريد إلكتروني غير صالح', en: 'Invalid email address' },
  passwordMin: { ar: 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل', en: 'Password must be at least 6 characters' },
  passwordsMustMatch: { ar: 'كلمتا المرور غير متطابقتين', en: 'Passwords must match' },
};

interface LocaleContextProps {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale === 'ar' || savedLocale === 'en') {
        setLocaleState(savedLocale);
      }
    } catch (e) {
      console.warn('Failed to access localStorage:', e);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    try {
      localStorage.setItem('locale', locale);
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[locale] || key;
  };

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
