'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/shared/context/LocaleContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { withdrawalService } from '@/features/withdrawals/api/withdrawalService';
import { WithdrawalDto, WithdrawalStatus } from '@/shared/types/withdrawal';
import { toast } from 'react-hot-toast';

export default function AdminWithdrawalsPage() {
  const { locale, dir } = useLocale();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'Supervisor') {
      router.replace('/admin/orders');
    }
  }, [user, router]);

  if (user?.role === 'Supervisor') return null;

  const [withdrawals, setWithdrawals] = useState<WithdrawalDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const loadWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await withdrawalService.getAll(undefined, searchQuery, currentPage, pageSize);
      if (res.success && res.data) {
        setWithdrawals(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      } else {
        setWithdrawals([]);
        setTotalPages(1);
      }
    } catch (err) {
      setWithdrawals([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadWithdrawals();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage]);

  const handleApprove = async (id: number) => {
    try {
      const res = await withdrawalService.approve(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تمت الموافقة على طلب السحب بنجاح' : 'Withdrawal approved successfully');
        loadWithdrawals();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل الموافقة على طلب السحب' : 'Failed to approve withdrawal'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await withdrawalService.reject(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم رفض طلب السحب' : 'Withdrawal request rejected');
        loadWithdrawals();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل رفض طلب السحب' : 'Failed to reject withdrawal'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    }
  };

  const getStatusText = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.Pending: return 'قيد الانتظار';
      case WithdrawalStatus.Approved: return 'تم التحويل';
      case WithdrawalStatus.Rejected: return 'مرفوض';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          {locale === 'ar' ? 'طلبات سحب العمولات والأرباح' : 'Withdrawal Requests'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {locale === 'ar' ? 'راجع تفاصيل المحفظة المالية للمسوقين، أكد تحويل المبالغ لحساباتهم أو ارفضها مع توضيح السبب.' : 'Approve payouts or cancel requests after verifying details.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden text-right">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-black text-slate-800 text-sm shrink-0">
            {locale === 'ar' ? 'كل سحوبات المسوقين المعلقة والمكتملة' : 'Payout Directory'}
          </h3>
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث باسم المسوق أو الملاحظات...' : 'Search by marketer or notes...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right pr-9 pl-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-sm font-bold text-slate-400 animate-pulse">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {locale === 'ar' ? 'لا توجد طلبات تحويل حالياً' : 'No requests found'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {withdrawals.map((w) => {
              const initials = w.marketerName
                ? w.marketerName
                    .split(' ')
                    .filter(Boolean)
                    .map((n: string) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'M';
              
              return (
                <div key={w.id} className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex gap-4 items-start flex-1 w-full text-right justify-start">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm shrink-0 border border-slate-200">
                      {initials}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-slate-900">
                          {locale === 'ar' ? 'المبلغ:' : 'Amount:'} {w.amount.toLocaleString()} ج.م
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          w.status === WithdrawalStatus.Approved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : w.status === WithdrawalStatus.Rejected
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {getStatusText(w.status)}
                        </span>
                      </div>
                      
                      {/* Marketer Details */}
                      <div className="text-xs text-slate-500 font-bold space-y-0.5">
                        <p className="text-slate-800 font-black">
                          👤 {locale === 'ar' ? 'المسوق:' : 'Marketer:'} {w.marketerName || (locale === 'ar' ? 'غير معروف' : 'Unknown')}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono select-all">
                          🔑 ID: {w.marketerId}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          📅 {locale === 'ar' ? 'تاريخ الطلب:' : 'Request Date:'} {new Date(w.createdAt || w.requestedAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {w.notes && (
                        <p className="text-xs text-slate-500 font-bold bg-slate-50 border border-slate-100 p-2.5 rounded-xl whitespace-pre-wrap mt-2">
                          💡 {locale === 'ar' ? 'تفاصيل وملاحظات:' : 'Details & Notes:'} {w.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {w.status === WithdrawalStatus.Pending && (
                    <div className="flex gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleApprove(w.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-black cursor-pointer shadow-sm transition-all"
                      >
                        {locale === 'ar' ? 'موافقة وتحويل الرصيد ✓' : 'Approve payout ✓'}
                      </button>
                      <button
                        onClick={() => handleReject(w.id)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-black cursor-pointer shadow-sm transition-all"
                      >
                        {locale === 'ar' ? 'رفض الطلب ✕' : 'Reject request ✕'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
  );
}
