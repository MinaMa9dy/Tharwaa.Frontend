'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { dashboardService } from '@/features/dashboard/api/dashboardService';
import { DashboardStatsDto, TopMarketerDto, TopProductDto, SalesPeriodDto } from '@/shared/types/dashboard';

export default function AdminDashboardPage() {
  const { locale, dir } = useLocale();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStatsDto>({
    totalMarketers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0
  });
  const [topMarketers, setTopMarketers] = useState<TopMarketerDto[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductDto[]>([]);
  const [salesData, setSalesData] = useState<SalesPeriodDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - 7);

        const fromStr = fromDate.toISOString().split('T')[0];
        const toStr = toDate.toISOString().split('T')[0];

        const [sRes, mRes, pRes, salesRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getTopMarketers(),
          dashboardService.getTopProducts(),
          dashboardService.getSales(fromStr, toStr)
        ]);

        if (sRes.success && sRes.data) setStats(sRes.data);
        if (mRes.success && mRes.data) setTopMarketers(mRes.data);
        if (pRes.success && pRes.data) setTopProducts(pRes.data);
        if (salesRes.success && salesRes.data) setSalesData(salesRes.data);

      } catch (err) {
        // Suppress error
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (user && user.role !== 'Admin') {
    return (
      <div className="space-y-8 animate-fadeIn" dir={dir}>
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white text-right relative overflow-hidden shadow-xl shadow-slate-950/20">
          <div className="relative z-10 space-y-4">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-primary/20 text-primary border border-primary/20">
              {locale === 'ar' ? 'منصة الإدارة والتحكم' : 'Management Portal'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              {locale === 'ar'
                ? `مرحباً بك مجدداً، ${user.firstName} 👋`
                : `Welcome back, ${user.firstName} 👋`}
            </h1>
            <p className="text-slate-300 text-xs sm:text-base font-semibold max-w-2xl leading-relaxed">
              {user.role === 'Supervisor'
                ? (locale === 'ar'
                  ? 'بصفتك مشرفاً على المنصة، يمكنك متابعة طلبات الشحن وتدقيق عمليات السحب وإدارة حسابات المسوقين لتيسير العمل اليومي.'
                  : 'As a system Supervisor, you can manage shipping orders, review marketer payouts, and keep the platform running smoothly.')
                : (locale === 'ar'
                  ? 'بصفتك مورداً للمنصة، يمكنك إدارة منتجاتك ومتابعة الطلبات الجارية لتجهيز الشحنات بكفاءة وسرعة.'
                  : 'As a Supplier, you can manage your catalog and process incoming product orders.')}
            </p>
          </div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-800 text-right mb-4">
            {locale === 'ar' ? 'الوصول السريع للمهام' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {user.role === 'Supervisor' && (
              <>
                <Link
                  href="/admin/orders"
                  className="bg-white hover:bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between space-y-3 sm:space-y-4 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform">📦</div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-800 text-xs sm:text-base">
                      {locale === 'ar' ? 'إدارة طلبات الشحن' : 'Manage Orders'}
                    </h4>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-semibold leading-relaxed">
                      {locale === 'ar' ? 'متابعة الطلبات وتحديث حالات التوصيل والمشكلات.' : 'Track, filter and update orders delivery status.'}
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin/withdrawals"
                  className="bg-white hover:bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between space-y-3 sm:space-y-4 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform">💳</div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-800 text-xs sm:text-base">
                      {locale === 'ar' ? 'مراجعة طلبات السحب' : 'Payout Requests'}
                    </h4>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-semibold leading-relaxed">
                      {locale === 'ar' ? 'تدقيق طلبات سحب الأرباح وتأكيد التحويلات المالية.' : 'Review and approve payout requests from marketers.'}
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin/marketers"
                  className="col-span-2 lg:col-span-1 bg-white hover:bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between space-y-3 sm:space-y-4 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform">👥</div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-800 text-xs sm:text-base">
                      {locale === 'ar' ? 'المسوقين والعملاء' : 'Marketers Directory'}
                    </h4>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-semibold leading-relaxed">
                      {locale === 'ar' ? 'استعراض المسوقين النشطين ومراقبة إحصائياتهم.' : 'Browse active platform marketers and monitor their performance.'}
                    </p>
                  </div>
                </Link>
              </>
            )}

            {user.role === 'Supplier' && (
              <>
                <Link
                  href="/admin/products"
                  className="bg-white hover:bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between space-y-3 sm:space-y-4 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform">🏷️</div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-800 text-xs sm:text-base">
                      {locale === 'ar' ? 'إدارة كتالوج المنتجات' : 'Products Catalog'}
                    </h4>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-semibold leading-relaxed">
                      {locale === 'ar' ? 'إضافة وتعديل المنتجات وأسعار الجملة والمخزون.' : 'Add, update or view products in your catalog.'}
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin/orders"
                  className="bg-white hover:bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between space-y-3 sm:space-y-4 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform">📦</div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-800 text-xs sm:text-base">
                      {locale === 'ar' ? 'طلبات الشحن الجارية' : 'Shipments'}
                    </h4>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-semibold leading-relaxed">
                      {locale === 'ar' ? 'تجهيز الشحنات الواردة لمنتجاتك ومتابعة التسليم.' : 'Process and prepare orders for delivery.'}
                    </p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          {locale === 'ar' ? 'لوحة التحكم والمشرفين' : 'Admin Control Panel'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {locale === 'ar' ? 'متابعة أداء منصة ثروة، المبيعات الكلية، المسوقين النشطين، والمنتجات الأكثر مبيعاً.' : 'Monitor global platform statistics, top performing marketers, and hot sales.'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 text-white flex flex-col justify-between text-right space-y-3 sm:space-y-4 shadow-xl">
          <span className="text-xl sm:text-2xl">💰</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
              {locale === 'ar' ? 'إجمالي السحوبات المعتمدة' : 'Total Approved Withdrawals'}
            </span>
            <span className="text-base sm:text-2xl lg:text-3xl font-black text-emerald-400">
              {stats.totalWithdrawals.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 flex flex-col justify-between text-right space-y-3 sm:space-y-4 shadow-sm">
          <span className="text-xl sm:text-2xl">📦</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
              {locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
            </span>
            <span className="text-base sm:text-2xl lg:text-3xl font-black text-slate-800">
              {stats.totalOrders.toLocaleString()} {locale === 'ar' ? 'طلب' : 'Orders'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 flex flex-col justify-between text-right space-y-3 sm:space-y-4 shadow-sm">
          <span className="text-xl sm:text-2xl">👥</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
              {locale === 'ar' ? 'المسوقين المسجلين' : 'Registered Marketers'}
            </span>
            <span className="text-base sm:text-2xl lg:text-3xl font-black text-slate-800">
              {stats.totalMarketers.toLocaleString()} {locale === 'ar' ? 'مسوق' : 'Marketers'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 flex flex-col justify-between text-right space-y-3 sm:space-y-4 shadow-sm">
          <span className="text-xl sm:text-2xl">⏳</span>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
              {locale === 'ar' ? 'سحوبات قيد الانتظار' : 'Pending Withdrawals'}
            </span>
            <span className="text-base sm:text-2xl lg:text-3xl font-black text-slate-800">
              {stats.pendingWithdrawals.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown & Performance Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-right">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">{locale === 'ar' ? 'الطلبات المسلمة' : 'Delivered Orders'}</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              {stats.deliveredOrders.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">✅</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-right">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">{locale === 'ar' ? 'الطلبات قيد الانتظار' : 'Pending Orders'}</span>
            <span className="text-xl sm:text-2xl font-black text-amber-500">
              {stats.pendingOrders.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">⏳</div>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-right">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 block">{locale === 'ar' ? 'الطلبات الملغاة' : 'Cancelled Orders'}</span>
            <span className="text-xl sm:text-2xl font-black text-rose-500">
              {stats.cancelledOrders.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">❌</div>
        </div>
      </div>

      {/* Sales & Revenue History Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-right">
          <div className="space-y-1">
            <h3 className="font-black text-slate-800 text-sm sm:text-base">
              {locale === 'ar' ? '📈 حركة المبيعات والإيرادات اليومية' : '📈 Daily Sales & Revenue History'}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold">
              {locale === 'ar' ? 'تقرير المبيعات والطلبات خلال السبعة أيام الأخيرة' : 'Sales and order activity over the last 7 days'}
            </p>
          </div>
          
          <div className="flex gap-4 text-right w-full sm:w-auto">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 flex-1 sm:flex-none">
              <span className="text-[9px] text-slate-400 font-bold block">{locale === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</span>
              <span className="text-xs sm:text-sm font-black text-emerald-600">
                {salesData.reduce((sum, s) => sum + (s.totalRevenue || 0), 0).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
              </span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex-1 sm:flex-none">
              <span className="text-[9px] text-slate-400 font-bold block">{locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</span>
              <span className="text-xs sm:text-sm font-black text-indigo-600">
                {salesData.reduce((sum, s) => sum + (s.orderCount || 0), 0)} {locale === 'ar' ? 'طلب' : 'Orders'}
              </span>
            </div>
          </div>
        </div>

        {/* Custom CSS Bar Chart */}
        {salesData.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            {locale === 'ar' ? 'لا توجد بيانات مبيعات كافية للفترة المحددة' : 'No sales data available for the period'}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-64 flex items-end justify-between gap-2 pt-6 border-b border-slate-100 px-2 sm:px-4">
              {salesData.map((s) => {
                const maxAmount = Math.max(...salesData.map(d => d.totalRevenue || 0), 1);
                const heightPercent = Math.max(((s.totalRevenue || 0) / maxAmount) * 100, 6);
                
                // Format Date nicely
                let formattedDay = '';
                try {
                  const dateObj = new Date(s.date);
                  formattedDay = dateObj.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { 
                    weekday: 'short', 
                    day: 'numeric' 
                  });
                } catch (e) {
                  formattedDay = s.date;
                }

                return (
                  <div key={s.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 bg-slate-900 text-white rounded-xl p-3 text-xs shadow-xl text-right min-w-[140px] -translate-y-2">
                      <p className="font-black text-emerald-400 mb-1">{(s.totalRevenue || 0).toLocaleString()} ج.م</p>
                      <p className="font-semibold text-slate-300">📦 {s.orderCount || 0} {locale === 'ar' ? 'طلبات' : 'orders'}</p>
                      <p className="text-[10px] text-slate-400 border-t border-slate-700/50 mt-1 pt-1">{s.date}</p>
                    </div>

                    {/* Bar */}
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[44px] rounded-t-xl bg-gradient-to-t from-primary/80 to-primary hover:from-primary hover:to-indigo-500 transition-all duration-500 relative cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-white/30 rounded-t-xl" />
                    </div>
                    
                    {/* Label */}
                    <span className="text-[10px] sm:text-xs text-slate-500 font-bold mt-2 truncate w-full text-center">
                      {formattedDay}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50 text-right">
            <h3 className="font-black text-slate-800 text-sm">
              {locale === 'ar' ? '🏆 أعلى المسوقين مبيعاً' : '🏆 Top Performing Marketers'}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 text-right">
            {topMarketers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold">
                {locale === 'ar' ? 'لا توجد بيانات متاحة حالياً' : 'No data available'}
              </div>
            ) : (
              topMarketers.map((m, idx) => {
                const initials = m.marketerName
                  ? m.marketerName
                      .split(' ')
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'M';
                
                const colors = [
                  'bg-amber-100 text-amber-700 border-amber-200',
                  'bg-slate-100 text-slate-700 border-slate-200',
                  'bg-indigo-100 text-indigo-700 border-indigo-200',
                  'bg-emerald-100 text-emerald-700 border-emerald-200',
                  'bg-rose-100 text-rose-700 border-rose-200'
                ];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={m.marketerId} className="p-4 flex justify-between items-center text-sm font-bold text-slate-700 hover:bg-slate-50/60 transition-colors">
                    <div className="text-left">
                      <p className="font-black text-emerald-600 text-sm sm:text-base">{m.totalEarnings.toLocaleString()} ج.م</p>
                      <p className="text-[10px] text-slate-400 font-bold">{locale === 'ar' ? 'أرباح المسوق' : 'Earnings'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-black text-slate-800 text-xs sm:text-sm">{m.marketerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {m.totalOrders} {locale === 'ar' ? 'طلب ناجح' : 'successful orders'}
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border ${colorClass}`}>
                        {initials}
                      </div>
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 border border-slate-200/50">
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50 text-right">
            <h3 className="font-black text-slate-800 text-sm">
              {locale === 'ar' ? '🔥 المنتجات الأكثر طلباً' : '🔥 Top Selling Products'}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 text-right">
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold">
                {locale === 'ar' ? 'لا توجد بيانات متاحة حالياً' : 'No data available'}
              </div>
            ) : (
              topProducts.map((p, idx) => {
                const productImg = p.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=80&q=80';
                return (
                  <div key={p.productId} className="p-4 flex justify-between items-center text-sm font-bold text-slate-700 hover:bg-slate-50/60 transition-colors">
                    <div className="text-left">
                      <p className="font-black text-slate-900 text-sm sm:text-base">{p.totalOrdered.toLocaleString()} {locale === 'ar' ? 'قطعة' : 'pcs'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{locale === 'ar' ? 'إجمالي المبيعات' : 'Total sales'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-black text-slate-800 text-xs sm:text-sm line-clamp-1">{p.productName}</p>
                        <p className="text-xs text-primary font-black">{p.price || 0} ج.م</p>
                      </div>
                      <img
                        src={productImg}
                        alt={p.productName}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                      />
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 border border-slate-200/50">
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
