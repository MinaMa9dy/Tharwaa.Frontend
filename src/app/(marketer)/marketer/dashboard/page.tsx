'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { marketerService } from '@/features/marketers/api/marketerService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { MarketerStatsDto } from '@/shared/types/marketer';

export default function MarketerDashboardPage() {
  const { locale, dir } = useLocale();
  const { user, initialize } = useAuthStore();
  const [stats, setStats] = useState<MarketerStatsDto>({
    marketerId: '',
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalEarnings: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const res = await marketerService.getStats(user.id);
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          setStats({
            marketerId: '',
            totalOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            totalEarnings: 0,
            balance: 0
          });
        }
      } catch (err) {
        setStats({
          marketerId: '',
          totalOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          totalEarnings: 0,
          balance: 0
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [user]);

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            {locale === 'ar' ? 'إحصائيات الأداء' : 'Marketer Analytics'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
            {locale === 'ar' ? 'حلل حجم مبيعاتك، عمولاتك المحققة، ومعدلات تسليم طلباتك لزيادة أرباحك.' : 'Monitor your dropshipping sales and payout progress.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/marketer/products"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
          >
            {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Catalog'}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 text-white flex flex-col justify-between text-right space-y-3 sm:space-y-4 shadow-xl shadow-slate-900/10">
          <span className="text-xl sm:text-2xl">💰</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">{locale === 'ar' ? 'إجمالي الأرباح والعمولات' : 'Total commission'}</span>
            <span className="text-xl sm:text-3xl font-black text-emerald-400">
              {(stats.totalEarnings || 0).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 flex flex-col justify-between text-right space-y-3 sm:space-y-4 shadow-sm">
          <span className="text-xl sm:text-2xl">💳</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">{locale === 'ar' ? 'الرصيد المتاح للسحب' : 'Available Balance'}</span>
            <span className="text-xl sm:text-3xl font-black text-slate-800">
              {(stats.balance || 0).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 flex flex-col justify-between text-right space-y-3 sm:space-y-4 shadow-sm">
          <span className="text-xl sm:text-2xl">📦</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">{locale === 'ar' ? 'إجمالي الطلبات' : 'Total orders'}</span>
            <span className="text-xl sm:text-3xl font-black text-slate-800">
              {stats.totalOrders} {locale === 'ar' ? 'طلب' : 'Orders'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 text-right">
        <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">
          {locale === 'ar' ? 'تفاصيل حالة الطلبات ومعدلات التوصيل' : 'Order Delivery Funnel'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
            <div className="flex justify-between items-center text-emerald-800 text-[10px] sm:text-xs font-black">
              <span>🎉 {locale === 'ar' ? 'مكتمل' : 'Delivered'}</span>
              <span>{Math.round((stats.deliveredOrders / (stats.totalOrders || 1)) * 100)}%</span>
            </div>
            <p className="text-lg sm:text-2xl font-black text-emerald-600">
              {stats.deliveredOrders} <span className="text-[10px] sm:text-xs font-bold text-slate-400">{locale === 'ar' ? 'طلب ناجح' : 'Orders'}</span>
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
            <div className="flex justify-between items-center text-amber-800 text-[10px] sm:text-xs font-black">
              <span>⏳ {locale === 'ar' ? 'قيد الشحن' : 'Pending'}</span>
              <span>{Math.round(((stats.totalOrders - stats.deliveredOrders - stats.cancelledOrders) / (stats.totalOrders || 1)) * 100)}%</span>
            </div>
            <p className="text-lg sm:text-2xl font-black text-amber-600">
              {Math.max(0, stats.totalOrders - stats.deliveredOrders - stats.cancelledOrders)} <span className="text-[10px] sm:text-xs font-bold text-slate-400">{locale === 'ar' ? 'قيد الشحن' : 'Orders'}</span>
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
            <div className="flex justify-between items-center text-rose-800 text-[10px] sm:text-xs font-black">
              <span>❌ {locale === 'ar' ? 'ملغي' : 'Cancelled'}</span>
              <span>{Math.round((stats.cancelledOrders / (stats.totalOrders || 1)) * 100)}%</span>
            </div>
            <p className="text-lg sm:text-2xl font-black text-rose-600">
              {stats.cancelledOrders} <span className="text-[10px] sm:text-xs font-bold text-slate-400">{locale === 'ar' ? 'ملغي' : 'Orders'}</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm font-bold text-slate-500 flex items-center gap-2">
          <span>💡</span>
          <p>
            {locale === 'ar'
              ? 'معدل توصيل طلباتك الحالي مرتفع! استهدف تقليل المرتجعات عبر تأكيد العنوان وتفاصيل المنتج هاتفياً مع العميل قبل الشحن.'
              : 'Your current delivery rate is high! Ensure calling your customers before dispatching to minimize returns.'}
          </p>
        </div>
      </div>
    </div>
  );
}
