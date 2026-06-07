'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [isSalesLoading, setIsSalesLoading] = useState(false);

  const [selectedBarDate, setSelectedBarDate] = useState<string | null>(null);
  const [groupPeriod, setGroupPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click/tap (works on both desktop and mobile)
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const [fromDateStr, setFromDateStr] = useState<string>(() => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    return fromDate.toISOString().split('T')[0];
  });
  const [toDateStr, setToDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    async function loadStaticStats() {
      // Only Admin can access these endpoints
      if (!user || user.role !== 'Admin') {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [sRes, mRes, pRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getTopMarketers(),
          dashboardService.getTopProducts()
        ]);

        if (sRes.success && sRes.data) setStats(sRes.data);
        if (mRes.success && mRes.data) setTopMarketers(mRes.data);
        if (pRes.success && pRes.data) setTopProducts(pRes.data);

      } catch (err) {
        // Suppress error
      } finally {
        setIsLoading(false);
      }
    }
    loadStaticStats();
  }, [user]);

  useEffect(() => {
    async function loadSales() {
      // Only Admin can access the sales endpoint
      if (!user || user.role !== 'Admin') return;
      if (!fromDateStr || !toDateStr) return;
      setIsSalesLoading(true);
      try {
        const salesRes = await dashboardService.getSales(fromDateStr, toDateStr);
        if (salesRes.success && salesRes.data) {
          setSalesData(salesRes.data);
          setSelectedBarDate(null);
        }
      } catch (err) {
        // Suppress error
      } finally {
        setIsSalesLoading(false);
      }
    }
    loadSales();
  }, [user, fromDateStr, toDateStr]);

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
                  ? 'بصفتك مشرفاً على المنصة، يمكنك متابعة طلبات الشحن وتحديث حالات التوصيل وإدارة المهام اليومية.'
                  : 'As a system Supervisor, you can manage shipping orders, update delivery statuses, and keep operations running smoothly.')
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

  // Dynamic sales data grouping
  const getGroupedSalesData = () => {
    if (groupPeriod === 'day') return salesData;

    const groups: { [key: string]: { orderCount: number; totalRevenue: number } } = {};

    salesData.forEach((s) => {
      let key = s.date;
      if (groupPeriod === 'week') {
        try {
          const d = new Date(s.date);
          const day = d.getDay();
          const diff = d.getDate() - day;
          const Sunday = new Date(d.setDate(diff));
          key = Sunday.toISOString().split('T')[0];
        } catch (e) {
          key = s.date;
        }
      } else if (groupPeriod === 'month') {
        key = s.date.substring(0, 7) + "-01";
      }

      if (!groups[key]) {
        groups[key] = { orderCount: 0, totalRevenue: 0 };
      }
      groups[key].orderCount += s.orderCount || 0;
      groups[key].totalRevenue += s.totalRevenue || 0;
    });

    return Object.keys(groups)
      .sort()
      .map((key) => ({
        date: key,
        orderCount: groups[key].orderCount,
        totalRevenue: groups[key].totalRevenue,
      }));
  };

  const displayedSalesData = getGroupedSalesData();

  // Find the maximum orders in the displayedSalesData
  const maxOrders = displayedSalesData.length > 0 
    ? Math.max(...displayedSalesData.map(d => d.orderCount || 0), 1)
    : 10;
  
  // Calculate a nice rounded ceiling for the Y-Axis
  let yAxisMax = 5;
  if (maxOrders <= 5) yAxisMax = 5;
  else if (maxOrders <= 10) yAxisMax = 10;
  else if (maxOrders <= 20) yAxisMax = 20;
  else if (maxOrders <= 50) yAxisMax = 50;
  else if (maxOrders <= 100) yAxisMax = 100;
  else if (maxOrders <= 150) yAxisMax = 150;
  else if (maxOrders <= 200) yAxisMax = 200;
  else if (maxOrders <= 250) yAxisMax = 250;
  else if (maxOrders <= 500) yAxisMax = 500;
  else yAxisMax = Math.ceil(maxOrders / 100) * 100;

  // Let's create exactly 6 intervals like in the mockup (0, 50, 100, 150, 200, 250)
  const yAxisTicks = [
    yAxisMax,
    yAxisMax * 0.8,
    yAxisMax * 0.6,
    yAxisMax * 0.4,
    yAxisMax * 0.2,
    0
  ];

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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
        {/* Chart Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h3 className="font-black text-slate-800 text-sm sm:text-base">
            {locale === 'ar' ? 'الطلبات بمرور الوقت' : 'Orders Over Time'}
          </h3>
          <div className="flex items-center gap-2">
            {/* Grouping dropdown (By Day/Week/Month) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-bold hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <span>
                  {groupPeriod === 'day'
                    ? (locale === 'ar' ? 'يومياً' : 'By Day')
                    : groupPeriod === 'week'
                      ? (locale === 'ar' ? 'أسبوعياً' : 'By Week')
                      : (locale === 'ar' ? 'شهرياً' : 'By Month')
                  }
                </span>
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-right">
                  {(['day', 'week', 'month'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setGroupPeriod(p); setIsDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-xs font-bold hover:bg-slate-50 text-right block ${groupPeriod === p ? 'text-emerald-600 bg-emerald-50/60' : 'text-slate-700'}`}
                    >
                      {p === 'day' ? (locale === 'ar' ? 'يومياً' : 'By Day') : p === 'week' ? (locale === 'ar' ? 'أسبوعياً' : 'By Week') : (locale === 'ar' ? 'شهرياً' : 'By Month')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Line chart toggle icon */}
            <button className="bg-white border border-slate-200 rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Date Range + Summary sub-row — stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-6 pb-4">
          {/* Date pickers */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-500 font-bold min-w-0 flex-1 sm:flex-none">
            <span className="shrink-0">{locale === 'ar' ? 'من' : 'From'}</span>
            <input
              type="date"
              value={fromDateStr}
              onChange={(e) => setFromDateStr(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 cursor-pointer font-black text-[11px] min-w-0 w-full sm:w-auto"
            />
            <span className="text-slate-300 mx-0.5 shrink-0">—</span>
            <span className="shrink-0">{locale === 'ar' ? 'إلى' : 'To'}</span>
            <input
              type="date"
              value={toDateStr}
              onChange={(e) => setToDateStr(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 cursor-pointer font-black text-[11px] min-w-0 w-full sm:w-auto"
            />
          </div>
          {/* Summary pills */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 text-[11px] font-black text-emerald-600 whitespace-nowrap">
              {displayedSalesData.reduce((sum, s) => sum + (s.totalRevenue || 0), 0).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
            <span className="bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5 text-[11px] font-black text-indigo-600 whitespace-nowrap">
              {displayedSalesData.reduce((sum, s) => sum + (s.orderCount || 0), 0)} {locale === 'ar' ? 'طلب' : 'Orders'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Chart Body */}
        <div className={`px-6 pb-4 pt-4 transition-opacity duration-300 ${isSalesLoading ? 'opacity-50' : 'opacity-100'}`}>
          {displayedSalesData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              {locale === 'ar' ? 'لا توجد بيانات مبيعات للفترة المحددة' : 'No sales data available for the period'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', overflowY: 'visible' }} className="scrollbar-none pb-1">
              <div className="min-w-[480px]" style={{ direction: 'ltr' }}>
                {/* Chart area: extra top padding = tooltip height headroom */}
                <div className="flex gap-3" style={{ height: '19rem', paddingTop: '4rem' }}>
                  {/* Y-Axis labels */}
                  <div className="flex flex-col justify-between text-[11px] text-slate-400 font-semibold w-9 text-right shrink-0 pb-0 pt-1 select-none">
                    {yAxisTicks.map((val, idx) => (
                      <span key={idx} className="leading-none">{Math.round(val)}</span>
                    ))}
                  </div>

                  {/* Grid + bars */}
                  <div className="flex-1 relative">
                    {/* Horizontal gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {yAxisTicks.map((_, idx) => (
                        <div key={idx} className="w-full border-t border-dashed border-slate-100" />
                      ))}
                    </div>

                    {/* Bars row — overflow-visible so tooltips escape upward */}
                    <div className="absolute inset-0 flex items-end gap-2 px-2" style={{ overflow: 'visible' }}>
                      {displayedSalesData.map((s, idx) => {
                        const heightPercent = Math.max(((s.orderCount || 0) / yAxisMax) * 100, 1.5);

                        const isFirst = idx === 0;
                        const isLast = idx === displayedSalesData.length - 1;

                        let tooltipAlignClass = 'left-1/2 -translate-x-1/2';
                        let arrowAlignClass = 'left-1/2 -translate-x-1/2';

                        if (displayedSalesData.length > 1) {
                          if (isFirst) {
                            tooltipAlignClass = 'left-1/2 -translate-x-[5%]';
                            arrowAlignClass = 'left-[5%] -translate-x-1/2';
                          } else if (isLast) {
                            tooltipAlignClass = 'left-1/2 -translate-x-[95%]';
                            arrowAlignClass = 'left-[95%] -translate-x-1/2';
                          }
                        }

                        let tooltipDateStr = s.date || (s as any).Date || '';
                        const cleanDate = tooltipDateStr.split('T')[0];
                        if (groupPeriod === 'week') {
                          tooltipDateStr = locale === 'ar' ? `أسبوع ${cleanDate}` : `Week of ${cleanDate}`;
                        } else if (groupPeriod === 'month') {
                          tooltipDateStr = locale === 'ar' ? `شهر ${cleanDate.substring(0, 7)}` : `Month ${cleanDate.substring(0, 7)}`;
                        } else {
                          tooltipDateStr = cleanDate;
                        }

                        const isSelected = selectedBarDate === s.date;

                        return (
                          <div
                            key={s.date}
                            className="flex-1 flex flex-col justify-end items-center group relative h-full"
                            style={{ minWidth: 0, overflow: 'visible' }}
                          >
                            {/* Selected Bar Info Box */}
                            <div
                              className={`absolute bottom-full mb-2 z-20 pointer-events-none transition-all duration-200 ${tooltipAlignClass} ${isSelected ? 'opacity-100 -translate-y-1' : 'opacity-0 invisible'}`}
                              style={{ overflow: 'visible' }}
                            >
                              <div
                                className={`bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-xl whitespace-nowrap ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                              >
                                <div className="text-[11px] font-black text-slate-700 mb-2 border-b border-slate-100 pb-1">
                                  {tooltipDateStr}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between gap-5">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 inline-block" />
                                      <span>{locale === 'ar' ? 'الطلبات' : 'Orders'}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{s.orderCount || 0}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-5">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 inline-block" />
                                      <span>{locale === 'ar' ? 'الإيرادات' : 'Revenue'}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">
                                      {(s.totalRevenue || 0).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                                    </span>
                                  </div>
                                </div>
                                {/* Arrow */}
                                <div className={`absolute top-full -mt-px w-2.5 h-2.5 bg-white border-r border-b border-slate-200 rotate-45 ${arrowAlignClass}`} />
                              </div>
                            </div>

                            {/* Bar */}
                            <div
                              style={{ height: `${heightPercent}%` }}
                              onClick={() => setSelectedBarDate(isSelected ? null : s.date)}
                              className={`w-full rounded-t-lg cursor-pointer transition-all duration-300 relative overflow-hidden ${
                                isSelected
                                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/30'
                                  : 'bg-gradient-to-t from-emerald-500/80 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 hover:shadow-md hover:shadow-emerald-500/20'
                              }`}
                            >
                              {/* shine strip */}
                              <div className="absolute inset-x-0 top-0 h-[3px] bg-white/25 rounded-t-lg" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* X-Axis Labels */}
                <div className="flex gap-2 mt-2 pl-12">
                  {displayedSalesData.map((s) => {
                    let label = '';
                    try {
                      const dateVal = s.date || (s as any).Date || '';
                      const cleanDate = dateVal.split('T')[0];
                      const parts = cleanDate.split('-');
                      if (parts.length === 3) {
                        const year = parts[0];
                        const month = parts[1];
                        const day = parts[2];
                        const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                        const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthIndex = parseInt(month, 10) - 1;
                        const monthName = locale === 'ar' ? monthsAr[monthIndex] : monthsEn[monthIndex];

                        if (groupPeriod === 'day') {
                          label = locale === 'ar'
                            ? `${parseInt(day, 10)} ${monthName}`
                            : `${monthName} ${parseInt(day, 10)}`;
                        } else if (groupPeriod === 'week') {
                          label = locale === 'ar'
                            ? `أسبوع ${parseInt(day, 10)} ${monthName}`
                            : `Wk ${monthName} ${parseInt(day, 10)}`;
                        } else {
                          label = locale === 'ar'
                            ? `${monthName} ${year.substring(2)}`
                            : `${monthName} ${year.substring(2)}`;
                        }
                      } else {
                        label = dateVal;
                      }
                    } catch {
                      label = s.date || '';
                    }
                    return (
                      <span
                        key={s.date}
                        className="flex-1 text-center text-[10px] text-slate-400 font-semibold select-none truncate"
                        style={{ minWidth: 0 }}
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
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
