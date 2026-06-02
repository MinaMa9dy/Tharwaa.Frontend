'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useLocale } from '@/shared/context/LocaleContext';

const forgotPasswordSchema = (t: (k: string) => string) => z.object({
  email: z.string()
    .min(1, { message: t('emailRequired') })
    .email({ message: t('invalidEmail') }),
});

type ForgotPasswordValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;

export default function ForgotPasswordPage() {
  const { t, locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema(t)),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Direct call via BFF proxy to backend Auth/ForgotPassword
      const response = await axios.post('/api/proxy/Auth/ForgotPassword', {
        email: data.email,
      });

      if (response.data.success || response.status === 200) {
        setSuccessMsg(t('forgotPasswordSuccess'));
      } else {
        setErrorMsg(response.data.message || (locale === 'ar' ? 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.'));
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
          {t('forgotPasswordTitle')}
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          {t('forgotPasswordDesc')}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-semibold">
          ✅ {successMsg}
        </div>
      )}

      {!successMsg ? (
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              t('sendResetLink')
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
