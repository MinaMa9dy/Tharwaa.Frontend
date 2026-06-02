'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { settingsService } from '@/features/settings/api/settingsService';

export default function SystemSettingsPage() {
  const { locale, dir } = useLocale();
  const [minimumWithdrawalAmount, setMinimumWithdrawalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const res = await settingsService.get();
        if (res.success && res.data) {
          setMinimumWithdrawalAmount(res.data.minimumWithdrawalAmount);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await settingsService.update({ minimumWithdrawalAmount });
      if (res.success) {
        setMessage({
          type: 'success',
          text: locale === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!',
        });
      } else {
        setMessage({
          type: 'error',
          text: res.message || (locale === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings'),
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || (locale === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم' : 'An error occurred while connecting to server'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          {locale === 'ar' ? 'الإعدادات العامة للنظام' : 'Global System Settings'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {locale === 'ar' ? 'تعديل المعايير العامة، والحدود الدنيا لعمليات السحب للمسوقين.' : 'Manage platform thresholds, commissions, and limits.'}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 animate-pulse">
            <div className="h-6 bg-slate-100 rounded w-1/4 mx-auto" />
            <div className="h-10 bg-slate-100 rounded w-full" />
            <div className="h-10 bg-slate-100 rounded w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 text-right shadow-sm">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">
              {locale === 'ar' ? 'المعاملات المالية والسحب' : 'Financial & Payout Thresholds'}
            </h3>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-black border text-center ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-600">
                {locale === 'ar' ? 'الحد الأدنى لطلب السحب للمسوقين (ج.م):' : 'Minimum Withdrawal Limit for Marketers (EGP):'}
              </label>
              <input
                type="number"
                min={0}
                required
                value={minimumWithdrawalAmount}
                onChange={(e) => setMinimumWithdrawalAmount(parseFloat(e.target.value) || 0)}
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm font-bold bg-slate-50 focus:bg-white transition-colors"
                placeholder="مثال: 50"
              />
              <p className="text-slate-400 text-[10px] font-bold mt-1">
                {locale === 'ar' 
                  ? 'لن يتمكن المسوقون من تقديم أي طلبات سحب أرباح إذا كانت أرباحهم المتاحة تقل عن هذه القيمة.' 
                  : 'Marketers will be blocked from requesting payouts if their available balance is below this threshold.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{locale === 'ar' ? 'جاري حفظ التغييرات...' : 'Saving Changes...'}</span>
                </>
              ) : (
                <span>💾 {locale === 'ar' ? 'حفظ إعدادات النظام' : 'Save System Settings'}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
