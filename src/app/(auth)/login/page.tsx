'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocale } from '@/shared/context/LocaleContext';
import { useAuthStore } from '@/features/auth/store/authStore';

const loginSchema = (t: (k: string) => string) => z.object({
  email: z.string().min(1, { message: t('emailRequired') || 'البريد الإلكتروني مطلوب' }).email({ message: t('invalidEmail') || 'بريد إلكتروني غير صالح' }),
  password: z.string().min(6, { message: t('passwordMin') || 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل' }),
});

type LoginFormValues = z.infer<ReturnType<typeof loginSchema>>;

export default function LoginPage() {
  const { t, locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login, googleLogin } = useAuthStore();

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
          document.getElementById("google-signin-button"),
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(data);
      const user = useAuthStore.getState().user;
      if (user) {
        if (user.role === 'Admin' || user.role === 'Supervisor' || user.role === 'Supplier') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/marketer/products';
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || (locale === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid email or password'));
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
              document.getElementById("google-signin-button"),
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
          {t('login')}
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          {locale === 'ar' ? 'سجل دخولك لمتابعة أرباحك وإدارة منتجاتك' : 'Sign in to track your profits and manage products'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            {t('email')}
          </label>
          <input
            type="email"
            {...register('email')}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.email ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
            } focus:border-primary focus:outline-none focus:ring-4 transition-all text-sm font-semibold`}
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs font-bold text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-bold text-slate-700">
              {t('password')}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
            >
              {t('forgotPasswordQ')}
            </Link>
          </div>
          <input
            type="password"
            {...register('password')}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.password ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
            } focus:border-primary focus:outline-none focus:ring-4 transition-all text-sm font-semibold`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1.5 text-xs font-bold text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            t('login')
          )}
        </button>
      </form>

      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold">
          {locale === 'ar' ? 'أو سجل بواسطة' : 'Or sign in with'}
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <div className="w-full flex justify-center">
        <div id="google-signin-button" className="w-full min-h-[44px]"></div>
      </div>

      <div className="text-center text-sm font-semibold text-slate-500 pt-2 border-t border-slate-100">
        <span>{t('noAccountQ')}{' '}</span>
        <Link href="/register" className="text-primary hover:text-primary-hover transition-colors">
          {locale === 'ar' ? 'سجل حساب جديد الآن' : 'Create new account'}
        </Link>
      </div>
    </div>
  );
}
