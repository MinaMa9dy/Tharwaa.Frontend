'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocale } from '@/shared/context/LocaleContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toast } from 'react-hot-toast';
import { WarningIcon, EyeIcon, EyeOffIcon } from '@/shared/components/Icons';

const registerSchema = (t: (k: string) => string) => z.object({
  firstName: z.string().min(1, { message: 'الاسم الأول مطلوب' }),
  lastName: z.string().min(1, { message: 'الاسم الاخير مطلوب' }),
  email: z.string().min(1, { message: 'البريد الإلكتروني مطلوب' }).email({ message: 'بريد إلكتروني غير صالح' }),
  phone: z.string().min(10, { message: 'رقم الهاتف غير صالح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل' }),
  confirmPassword: z.string().min(1, { message: 'يرجى تأكيد كلمة المرور' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<ReturnType<typeof registerSchema>>;

export default function RegisterPage() {
  const { t, locale } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register: registerUser, googleLogin } = useAuthStore();

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await googleLogin(response.credential);
      const user = useAuthStore.getState().user;
      if (user) {
        if (user.role === 'Admin' || user.role === 'Supervisor' || user.role === 'Supplier') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/marketer/products';
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || (locale === 'ar' ? 'فشل تسجيل الدخول بواسطة جوجل' : 'Google sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: "467156922862-srgsh1afb86909m31najgpi080j0ff0u.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signup-button"),
          { 
            theme: "outline", 
            size: "large", 
            width: "100%",
            locale: locale === 'ar' ? 'ar' : 'en'
          }
        );
      }
    };

    if ((window as any).google) {
      initGoogle();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initGoogle);
      }
    }
  }, [locale]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema(t)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await registerUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: 'Marketer'
      });
      toast.success(locale === 'ar' ? 'تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني ثم تسجيل الدخول.' : 'Registration successful! Please confirm your email and log in.', { duration: 3000 });
      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);
    } catch (err: any) {
      const errMsg = err.message || (locale === 'ar' ? 'حدث خطأ ما أثناء إنشاء الحساب' : 'An error occurred during registration');
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).google) {
            (window as any).google.accounts.id.initialize({
              client_id: "467156922862-srgsh1afb86909m31najgpi080j0ff0u.apps.googleusercontent.com",
              callback: handleGoogleCredentialResponse,
            });
            (window as any).google.accounts.id.renderButton(
              document.getElementById("google-signup-button"),
              { 
                theme: "outline", 
                size: "large", 
                width: "100%",
                locale: locale === 'ar' ? 'ar' : 'en'
              }
            );
          }
        }}
      />

      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          {t('register')}
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          {locale === 'ar' ? 'انضم إلى آلاف المسوقين وابدأ في تحقيق الأرباح' : 'Join thousands of marketers and start earning profits'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-semibold flex items-center gap-2">
          <WarningIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('firstName')}
            </label>
            <input
              type="text"
              {...register('firstName')}
              className={`w-full px-3 py-2.5 rounded-lg border ${
                errors.firstName ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
              } focus:border-primary focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
            />
            {errors.firstName && (
              <p className="mt-1 text-[10px] font-bold text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('lastName')}
            </label>
            <input
              type="text"
              {...register('lastName')}
              className={`w-full px-3 py-2.5 rounded-lg border ${
                errors.lastName ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
              } focus:border-primary focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
            />
            {errors.lastName && (
              <p className="mt-1 text-[10px] font-bold text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t('email')}
          </label>
          <input
            type="email"
            {...register('email')}
            className={`w-full px-3 py-2.5 rounded-lg border ${
              errors.email ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
            } focus:border-primary focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-[10px] font-bold text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t('phone')}
          </label>
          <input
            type="text"
            {...register('phone')}
            className={`w-full px-3 py-2.5 rounded-lg border ${
              errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
            } focus:border-primary focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
            placeholder="01xxxxxxxxx"
          />
          {errors.phone && (
            <p className="mt-1 text-[10px] font-bold text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t('password')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`w-full ${locale === 'ar' ? 'pl-10 pr-3' : 'pr-10 pl-3'} py-2.5 rounded-lg border ${
                errors.password ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
              } focus:border-primary focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-slate-400 hover:text-slate-600 focus:outline-none`}
            >
              {showPassword ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-[10px] font-bold text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t('confirmPassword')}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={`w-full ${locale === 'ar' ? 'pl-10 pr-3' : 'pr-10 pl-3'} py-2.5 rounded-lg border ${
                errors.confirmPassword ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
              } focus:border-primary focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-slate-400 hover:text-slate-600 focus:outline-none`}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-[10px] font-bold text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-lg shadow-md shadow-primary/10 hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            t('register')
          )}
        </button>
      </form>

      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold">
          {locale === 'ar' ? 'أو سجل بواسطة' : 'Or sign up with'}
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <div className="w-full flex justify-center">
        <div id="google-signup-button" className="w-full min-h-[44px]"></div>
      </div>

      <div className="text-center text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
        <span>{t('haveAccountQ')}{' '}</span>
        <Link href="/login" className="text-primary hover:text-primary-hover transition-colors">
          {t('login')}
        </Link>
      </div>
    </div>
  );
}
