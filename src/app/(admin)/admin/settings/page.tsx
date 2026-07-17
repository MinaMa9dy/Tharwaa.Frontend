'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { settingsService } from '@/features/settings/api/settingsService';
import { SaveIcon } from '@/shared/components/Icons';

export default function SystemSettingsPage() {
  const { locale, dir } = useLocale();
  const [minimumWithdrawalAmount, setMinimumWithdrawalAmount] = useState<number>(0);
  const [marketerPenaltyAmount, setMarketerPenaltyAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetSystem = async () => {
    const confirmation = window.confirm(
      locale === 'ar'
        ? 'هل أنت متأكد من رغبتك في حذف جميع الطلبات والمسحوبات وتصفير رصيد جميع المسوقين؟ هذا الإجراء لا يمكن التراجع عنه!'
        : 'Are you sure you want to delete all orders, withdrawals, and reset all marketer balances to 0? This action cannot be undone!'
    );
    if (!confirmation) return;

    setIsResetting(true);
    setResetMessage(null);
    try {
      const res = await settingsService.resetSystem();
      if (res.success) {
        setResetMessage({
          type: 'success',
          text: locale === 'ar' ? 'تمت إعادة تعيين بيانات النظام بالكامل بنجاح!' : 'System data has been successfully reset!',
        });
      } else {
        setResetMessage({
          type: 'error',
          text: res.message || (locale === 'ar' ? 'فشل إعادة تعيين بيانات النظام' : 'Failed to reset system data'),
        });
      }
    } catch (err: any) {
      setResetMessage({
        type: 'error',
        text: err.message || (locale === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم' : 'An error occurred while connecting to server'),
      });
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const res = await settingsService.get();
        if (res.success && res.data) {
          setMinimumWithdrawalAmount(res.data.minimumWithdrawalAmount);
          setMarketerPenaltyAmount(res.data.marketerPenaltyAmount);
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
      const res = await settingsService.update({ minimumWithdrawalAmount, marketerPenaltyAmount });
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

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-600">
                {locale === 'ar' ? 'قيمة الغرامة على المسوق عند فشل التوصيل (ج.م):' : 'Marketer Penalty for Failed Delivery (EGP):'}
              </label>
              <input
                type="number"
                min={0}
                required
                value={marketerPenaltyAmount}
                onChange={(e) => setMarketerPenaltyAmount(parseFloat(e.target.value) || 0)}
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm font-bold bg-slate-50 focus:bg-white transition-colors"
                placeholder="مثال: 10"
              />
              <p className="text-slate-400 text-[10px] font-bold mt-1">
                {locale === 'ar' 
                  ? 'المبلغ الذي سيتم خصمه تلقائياً من رصيد المسوق إذا فشلت عملية التوصيل للمستهلك.' 
                  : 'The amount deducted from the marketer balance automatically if order delivery fails.'}
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
                <span className="flex items-center gap-1.5">
                  <SaveIcon className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'حفظ إعدادات النظام' : 'Save System Settings'}</span>
                </span>
              )}
            </button>
          </form>

          {/* Danger Zone */}
          <div className="mt-8 bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 space-y-6 text-right shadow-sm">
            <h3 className="text-lg font-black text-rose-600 border-b border-rose-100 pb-3 flex items-center justify-end gap-2">
              {locale === 'ar' ? 'منطقة الخطر - إعادة تعيين البيانات' : 'Danger Zone - Reset Data'}
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </h3>

            {resetMessage && (
              <div className={`p-4 rounded-xl text-xs font-black border text-center ${
                resetMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {resetMessage.text}
              </div>
            )}

            <p className="text-slate-500 text-xs font-bold leading-relaxed">
              {locale === 'ar'
                ? 'تنبيه: هذا الإجراء سيقوم بحذف جميع طلبات الشحن والطلبات المسجلة نهائياً، وحذف جميع طلبات سحب الأرباح للمسوقين، وتصفير محافظ جميع المسوقين لتصبح 0. هذا الإجراء لا يمكن التراجع عنه.'
                : 'Warning: This action will permanently delete all registered orders, remove all withdrawal requests, and reset all marketer wallet balances to 0. This cannot be undone.'}
            </p>

            <button
              type="button"
              onClick={handleResetSystem}
              disabled={isResetting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isResetting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{locale === 'ar' ? 'جاري إعادة تعيين البيانات...' : 'Resetting System...'}</span>
                </>
              ) : (
                <span>{locale === 'ar' ? 'إعادة تعيين كافة البيانات' : 'Reset All System Data'}</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
