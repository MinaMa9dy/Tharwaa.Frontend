'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { withdrawalService } from '@/features/withdrawals/api/withdrawalService';
import { marketerService } from '@/features/marketers/api/marketerService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { WithdrawalDto, WithdrawalStatus } from '@/shared/types/withdrawal';
import { settingsService } from '@/features/settings/api/settingsService';
import { toast } from 'react-hot-toast';

export default function WithdrawalsPage() {
  const { locale, dir } = useLocale();
  const { user, initialize } = useAuthStore();
  
  const [withdrawals, setWithdrawals] = useState<WithdrawalDto[]>([]);
  const [balanceStats, setBalanceStats] = useState({
    balance: 0,
    withdrawnAmount: 0,
    pendingWithdrawals: 0
  });
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState<number>(50);
  
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const loadData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [wRes, bRes, sRes] = await Promise.all([
        withdrawalService.getMyWithdrawals(currentPage, pageSize),
        marketerService.getBalance(user.id),
        settingsService.get()
      ]);

      const wData = (wRes.success && wRes.data) ? wRes.data : [];
      setWithdrawals(wData);
      setTotalPages(wRes.meta?.totalPages || 1);

      if (sRes.success && sRes.data) {
        setMinWithdrawalAmount(sRes.data.minimumWithdrawalAmount);
      }

      if (bRes.success && bRes.data) {
        setBalanceStats({
          balance: bRes.data.balance || 0,
          withdrawnAmount: bRes.data.withdrawnAmount || 0,
          pendingWithdrawals: bRes.data.pendingWithdrawals || 0
        });
      } else {
        setBalanceStats({
          balance: 0,
          withdrawnAmount: 0,
          pendingWithdrawals: 0
        });
      }
    } catch (err) {
      setWithdrawals([]);
      setBalanceStats({
        balance: 0,
        withdrawnAmount: 0,
        pendingWithdrawals: 0
      });
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentPage]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < minWithdrawalAmount) {
      toast.error(locale === 'ar' 
        ? `الحد الأدنى لطلب السحب هو ${minWithdrawalAmount} ج.م` 
        : `Minimum withdrawal amount is ${minWithdrawalAmount} EGP`);
      return;
    }
    if (amount > balanceStats.balance) {
      toast.error(locale === 'ar' ? 'القيمة تتجاوز الرصيد المتاح' : 'Amount exceeds available balance');
      return;
    }
    if (!notes) {
      toast.error(locale === 'ar' ? 'يرجى إدخال تفاصيل وسيلة السحب أو الملاحظات' : 'Please input payout details or notes');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await withdrawalService.requestWithdrawal({
        amount,
        notes
      });

      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تقديم طلب السحب بنجاح قيد المراجعة' : 'Withdrawal requested successfully');
        setAmount(0);
        setNotes('');
        loadData();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تقديم طلب السحب' : 'Failed to request withdrawal'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ أثناء تقديم الطلب: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.Pending:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case WithdrawalStatus.Approved:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case WithdrawalStatus.Rejected:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: WithdrawalStatus) => {
    if (locale !== 'ar') return status;
    switch (status) {
      case WithdrawalStatus.Pending: return 'قيد الانتظار';
      case WithdrawalStatus.Approved: return 'تم التحويل';
      case WithdrawalStatus.Rejected: return 'مرفوض';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          {locale === 'ar' ? 'الأرباح والمحفظة المالية' : 'Withdrawals & Wallet'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {locale === 'ar' ? 'تابع عمولاتك المستلمة وقدم طلبات تحويل الأرباح لحسابك البنكي أو محفظتك الإلكترونية.' : 'Track earnings and submit payout requests.'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between text-right space-y-3 sm:space-y-4">
          <span className="text-xl sm:text-2xl">💵</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">{locale === 'ar' ? 'الرصيد المتاح للسحب' : 'Available balance'}</span>
            <span className="text-lg sm:text-2xl font-black text-slate-800">
              {balanceStats.balance.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between text-right space-y-3 sm:space-y-4">
          <span className="text-xl sm:text-2xl">⏳</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">{locale === 'ar' ? 'طلبات سحب معلقة' : 'Pending payouts'}</span>
            <span className="text-lg sm:text-2xl font-black text-amber-600">
              {balanceStats.pendingWithdrawals.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between text-right space-y-3 sm:space-y-4">
          <span className="text-xl sm:text-2xl">💳</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">{locale === 'ar' ? 'إجمالي الأرباح المستلمة' : 'Total withdrawn'}</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-600">
              {balanceStats.withdrawnAmount.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-right space-y-4 h-fit">
          <h4 className="font-black text-slate-800 text-base border-b border-slate-100 pb-3">
            {locale === 'ar' ? 'طلب سحب أرباح جديد' : 'Request Payout'}
          </h4>

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'المبلغ المطلوب سحبه (ج.م):' : 'Amount to withdraw (EGP):'}</label>
              <input
                type="number"
                min={minWithdrawalAmount}
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder={locale === 'ar' ? `الحد الأدنى: ${minWithdrawalAmount}` : `Min: ${minWithdrawalAmount}`}
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600">
                {locale === 'ar' ? 'تفاصيل التحويل والملاحظات:' : 'Payout details & Notes:'}
              </label>
              <textarea
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={locale === 'ar' ? 'اكتب اسم المحفظة ورقم الهاتف أو رقم الحساب البنكي بالإضافة لأي ملاحظات إضافية' : 'Wallet number, bank account details, and full name with notes'}
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || amount < minWithdrawalAmount || amount > balanceStats.balance}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{locale === 'ar' ? 'جاري تقديم الطلب...' : 'Submitting...'}</span>
                </>
              ) : (
                <span>💸 {locale === 'ar' ? 'تقديم طلب تحويل أرباح' : 'Request Payout'}</span>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 text-right">
              <h3 className="font-black text-slate-800 text-sm">
                {locale === 'ar' ? 'سجل السحوبات السابقة' : 'Payout History'}
              </h3>
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-sm font-bold text-slate-400 animate-pulse">
                {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="p-10 text-center text-sm font-bold text-slate-400">
                {locale === 'ar' ? 'لا توجد سحوبات سابقة بعد' : 'No payout history found'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-right">
                {withdrawals.map((w) => (
                  <div key={w.id} className="p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-slate-800">
                          {w.amount.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${getStatusColor(w.status)}`}>
                          {getStatusText(w.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold">
                        📅 {new Date(w.createdAt || w.requestedAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {w.notes && (
                        <p className="text-xs text-slate-600 font-semibold mt-1 whitespace-pre-wrap">
                          {w.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination controls */}
            {!isLoading && withdrawals.length > 0 && (
              <div className="flex items-center justify-center gap-4 p-6 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {locale === 'ar' ? 'الصفحة السابقة ➡️' : '⬅️ Previous'}
                </button>
                
                <span className="text-xs sm:text-sm font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
                  {locale === 'ar' ? `الصفحة ${currentPage}` : `Page ${currentPage}`}
                </span>
                
                <button
                  onClick={() => {
                    setCurrentPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {locale === 'ar' ? '⬅️ الصفحة التالية' : 'Next ➡️'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
