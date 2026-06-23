'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useLocale } from '@/shared/context/LocaleContext';
import { WarningIcon } from '@/shared/components/Icons';

const resendSchema = (t: (k: string) => string) => z.object({
  email: z.string()
    .min(1, { message: t('emailRequired') })
    .email({ message: t('invalidEmail') }),
});

type ResendValues = z.infer<ReturnType<typeof resendSchema>>;

function ConfirmEmailForm() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'confirming' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Resend state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  // Prevent multiple executions in StrictMode
  const verifiedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendValues>({
    resolver: zodResolver(resendSchema(t)),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    if (!userId || !token) {
      setStatus('idle');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verifyEmail = async () => {
      setStatus('confirming');
      setErrorMsg(null);
      try {
        const response = await axios.get('/api/proxy/Auth/ConfirmEmail', {
          params: { userId, token }
        });

        if (response.data.success || response.status === 200) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(response.data.message || t('confirmEmailError'));
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || err.message || t('confirmEmailError'));
      }
    };

    verifyEmail();
  }, [userId, token, t]);

  const onResendSubmit = async (data: ResendValues) => {
    setResendLoading(true);
    setResendError(null);
    setResendSuccess(null);
    try {
      const response = await axios.post('/api/proxy/Auth/ResendEmailConfirmation', {
        email: data.email
      });

      if (response.data.success || response.status === 200) {
        setResendSuccess(t('resendConfirmationSuccess'));
      } else {
        setResendError(response.data.message || (locale === 'ar' ? 'فشل إرسال رابط التأكيد.' : 'Failed to send confirmation link.'));
      }
    } catch (err: any) {
      setResendError(err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل إرسال الطلب. يرجى المحاولة لاحقاً.' : 'Failed to send request. Please try again later.'));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          {t('confirmEmailTitle')}
        </h2>
      </div>

      {status === 'confirming' && (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <span className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></span>
          <p className="text-sm font-bold text-slate-600 animate-pulse">
            {t('confirmingEmail')}
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-bold flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{t('confirmEmailSuccess')}</span>
          </div>
          <div className="pt-2">
            <Link href="/login" className="w-full inline-flex justify-center bg-primary hover:bg-primary-hover text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/25 transition-all">
              {t('login')}
            </Link>
          </div>
        </div>
      )}

      {(status === 'error' || status === 'idle') && (
        <div className="space-y-6">
          {status === 'error' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-semibold flex items-center gap-2">
              <WarningIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!userId || !token ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-semibold text-center flex items-center justify-center gap-2">
              <WarningIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{locale === 'ar' ? 'رابط تأكيد الحساب غير صالح أو مفقود.' : 'Account confirmation link is invalid or missing.'}</span>
            </div>
          ) : null}

          {/* Resend Confirmation Form */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-800">
              {t('resendConfirmationTitle')}
            </h3>

            {resendError && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-100 text-xs font-bold text-red-600">
                {resendError}
              </div>
            )}

            {resendSuccess && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600">
                {resendSuccess}
              </div>
            )}

            {!resendSuccess && (
              <form onSubmit={handleSubmit(onResendSubmit)} className="space-y-3">
                <div>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.email ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-primary/20'
                    } focus:border-primary focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
                    placeholder="name@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-2xs font-bold text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  {resendLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    t('resendConfirmationButton')
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="text-center text-sm font-semibold text-slate-500 pt-4 border-t border-slate-100">
            <Link href="/login" className="text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5">
              {locale === 'ar' ? '←' : '→'} {t('backToLogin')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConfirmEmailPage() {
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
      <ConfirmEmailForm />
    </Suspense>
  );
}
