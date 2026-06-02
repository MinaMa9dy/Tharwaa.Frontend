'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useLocale } from '@/shared/context/LocaleContext';

const resetPasswordSchema = (t: (k: string) => string) => z.object({
  newPassword: z.string().min(6, { message: t('passwordMin') }),
  confirmNewPassword: z.string().min(6, { message: t('passwordMin') }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: t('passwordsMustMatch'),
  path: ['confirmNewPassword'],
});

type ResetPasswordValues = z.infer<ReturnType<typeof resetPasswordSchema>>;

function ResetPasswordForm() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema(t)),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  if (!userId || !token) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-semibold">
          ⚠️ {locale === 'ar' ? 'رابط إعادة التعيين غير صالح أو مفقود.' : 'Invalid or missing password reset link.'}
        </div>
        <div className="pt-4 border-t border-slate-100">
          <Link href="/login" className="text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5 font-semibold text-sm">
            {locale === 'ar' ? '←' : '→'} {t('backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordValues) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Direct call via BFF proxy to backend Auth/ResetPassword
      const response = await axios.post('/api/proxy/Auth/ResetPassword', {
        userId,
        token,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });

      if (response.data.success || response.status === 200) {
        setSuccessMsg(t('resetPasswordSuccess'));
      } else {
        setErrorMsg(response.data.message || (locale === 'ar' ? 'فشل إعادة تعيين كلمة المرور.' : 'Failed to reset password.'));
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل إرسال الطلب. يرجى المحاولة لاحقاً.' : 'Failed to send request. Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          {t('resetPasswordTitle')}
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          {t('resetPasswordDesc')}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-semibold animate-fade-in">
          ✅ {successMsg}
        </div>
      )}

      {!successMsg ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {t('newPassword')}
            </label>
            <input
              type="password"
              {...register('newPassword')}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.newPassword ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
              } focus:border-primary focus:outline-none focus:ring-4 transition-all text-sm font-semibold`}
              placeholder="••••••••"
            />
            {errors.newPassword && (
              <p className="mt-1.5 text-xs font-bold text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {t('confirmNewPassword')}
            </label>
            <input
              type="password"
              {...register('confirmNewPassword')}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.confirmNewPassword ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
              } focus:border-primary focus:outline-none focus:ring-4 transition-all text-sm font-semibold`}
              placeholder="••••••••"
            />
            {errors.confirmNewPassword && (
              <p className="mt-1.5 text-xs font-bold text-red-500">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              t('resetPasswordTitle')
            )}
          </button>
        </form>
      ) : null}

      <div className="text-center text-sm font-semibold text-slate-500 pt-4 border-t border-slate-100">
        <Link href="/login" className="text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5">
          {locale === 'ar' ? '←' : '→'} {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { locale } = useLocale();
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        <p className="text-sm font-bold text-slate-500">
          {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
