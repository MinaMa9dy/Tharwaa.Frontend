'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { reportsService } from '@/features/reports/api/reportsService';
import {
  SalesReportDto,
  MarketerReportDto,
  ProductReportDto,
  FinancialsReportDto,
  DailySalesTrendDto,
  GovernorateSalesDto,
  ReportOrderDetailsDto,
  MonthlyFinancialTrendDto,
  ReportWithdrawalDetailsDto,
} from '@/shared/types/reports';
import {
  PackageIcon,
  TagIcon,
  WalletIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  CloseIcon,
  CheckIcon,
  TruckIcon,
  WarningIcon,
  DownloadIcon,
  CalendarIcon,
  SearchIcon,
  TrendingUpIcon
} from '@/shared/components/Icons';

type TabType = 'sales' | 'marketers' | 'products' | 'financials';

export default function AdminReportsPage() {
  const { locale, dir, t } = useLocale();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('sales');
  const [fromDateStr, setFromDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDateStr, setToDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Data States
  const [salesData, setSalesData] = useState<SalesReportDto | null>(null);
  const [marketersData, setMarketersData] = useState<MarketerReportDto[]>([]);
  const [productsData, setProductsData] = useState<ProductReportDto[]>([]);
  const [financialsData, setFinancialsData] = useState<FinancialsReportDto | null>(null);

  // Search & Filter States
  const [marketerSearch, setMarketerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'inStock' | 'lowStock'>('all');
  const [withdrawalSearch, setWithdrawalSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quick Date Presets
  const setDatePreset = (preset: '7days' | '30days' | 'thisMonth') => {
    const today = new Date();
    if (preset === '7days') {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      setFromDateStr(d.toISOString().split('T')[0]);
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      setFromDateStr(d.toISOString().split('T')[0]);
    } else if (preset === 'thisMonth') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDateStr(d.toISOString().split('T')[0]);
    }
    setToDateStr(today.toISOString().split('T')[0]);
  };

  // Fetch Report Data based on activeTab and date filters
  const loadReportData = async () => {
    if (!user || user.role !== 'Admin') return;
    setIsLoading(true);
    try {
      if (activeTab === 'sales') {
        const res = await reportsService.getSalesReport(fromDateStr, toDateStr);
        if (res.success && res.data) setSalesData(res.data);
      } else if (activeTab === 'marketers') {
        const res = await reportsService.getMarketersReport(fromDateStr, toDateStr);
        if (res.success && res.data) setMarketersData(res.data);
      } else if (activeTab === 'products') {
        const res = await reportsService.getProductsReport(fromDateStr, toDateStr);
        if (res.success && res.data) setProductsData(res.data);
      } else if (activeTab === 'financials') {
        const res = await reportsService.getFinancialsReport(fromDateStr, toDateStr);
        if (res.success && res.data) setFinancialsData(res.data);
      }
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [activeTab, fromDateStr, toDateStr, user]);

  // Export Data to CSV / Excel with UTF-8 BOM
  const handleExport = (data: any[], headers: string[], rowMapper: (item: any) => any[], filename: string) => {
    if (!data || data.length === 0) return;
    const csvContent = [
      headers.join(','),
      ...data.map(item => rowMapper(item).map(val => {
        const strVal = val === null || val === undefined ? '' : String(val);
        const escaped = strVal.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
    ].join('\n');

    // Add UTF-8 BOM to ensure Excel opens Arabic correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse" dir={dir}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-3xl" />
          ))}
        </div>
        <div className="h-72 bg-white border border-slate-200 rounded-3xl" />
        <div className="h-64 bg-white border border-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 font-bold" dir={dir}>
        {locale === 'ar' ? 'غير مصرح بالوصول لهذه الصفحة.' : 'Access Denied.'}
      </div>
    );
  }

  // Search filter helpers
  const filteredMarketers = marketersData.filter(m =>
    m.name.toLowerCase().includes(marketerSearch.toLowerCase()) ||
    m.phone.includes(marketerSearch)
  );

  const filteredProducts = productsData.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(productSearch.toLowerCase());
    const matchesStock = productStockFilter === 'all'
      ? true
      : productStockFilter === 'lowStock'
        ? p.stockQuantity < 10
        : p.stockQuantity >= 10;
    return matchesSearch && matchesStock;
  });

  const filteredOrders = salesData?.detailedOrders.filter(o =>
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customerPhone.includes(orderSearch) ||
    o.marketerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.id.toString().includes(orderSearch)
  ) || [];

  const filteredWithdrawals = financialsData?.withdrawalsLog.filter(w =>
    w.marketerName.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
    w.marketerPhone.includes(withdrawalSearch) ||
    w.id.toString().includes(withdrawalSearch)
  ) || [];

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-right">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center justify-end gap-2.5">
            {t('reports')}
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
            {locale === 'ar'
              ? 'تحليل المبيعات، ومراقبة أداء المسوقين، والمخزون المالي للمنصة بالكامل.'
              : 'Analyze sales, monitor marketer performance, and global financials.'}
          </p>
        </div>

        {/* Date Filters & Presets */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-500 font-bold">
            <button
              onClick={() => setDatePreset('7days')}
              className="px-2 py-1 rounded-lg hover:bg-white hover:shadow-sm transition-all"
            >
              {locale === 'ar' ? '٧ أيام' : '7d'}
            </button>
            <span className="text-slate-200">|</span>
            <button
              onClick={() => setDatePreset('30days')}
              className="px-2 py-1 rounded-lg hover:bg-white hover:shadow-sm transition-all"
            >
              {locale === 'ar' ? '٣٠ يوماً' : '30d'}
            </button>
            <span className="text-slate-200">|</span>
            <button
              onClick={() => setDatePreset('thisMonth')}
              className="px-2 py-1 rounded-lg hover:bg-white hover:shadow-sm transition-all"
            >
              {locale === 'ar' ? 'هذا الشهر' : 'Month'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-bold">
            <span>{locale === 'ar' ? 'من' : 'From'}</span>
            <input
              type="date"
              value={fromDateStr}
              onChange={(e) => setFromDateStr(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 cursor-pointer font-black text-xs"
            />
            <span className="text-slate-300 mx-0.5">—</span>
            <span>{locale === 'ar' ? 'إلى' : 'To'}</span>
            <input
              type="date"
              value={toDateStr}
              onChange={(e) => setToDateStr(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 cursor-pointer font-black text-xs"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 justify-end" aria-label="Tabs">
          {([
            { id: 'sales', label: t('salesReport') },
            { id: 'marketers', label: t('marketersReport') },
            { id: 'products', label: t('productsReport') },
            { id: 'financials', label: t('financialsReport') },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-black text-sm transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tabs Contents */}
      {isLoading ? (
        // Loading Skeleton
        <div className="space-y-6 animate-pulse" dir={dir}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white border border-slate-200 rounded-3xl" />
            ))}
          </div>
          <div className="h-72 bg-white border border-slate-200 rounded-3xl" />
          <div className="h-64 bg-white border border-slate-200 rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* ================================= SALES TAB ================================= */}
          {activeTab === 'sales' && salesData && (
            <div className="space-y-8 text-right">
              {/* Sales KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 text-white flex flex-col justify-between space-y-3 shadow-xl relative overflow-hidden">
                  <WalletIcon className="w-7 h-7 text-emerald-400" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
                      {locale === 'ar' ? 'إجمالي المبيعات (المستلمة)' : 'Total Revenue (Delivered)'}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-emerald-400">
                      {salesData.totalRevenue.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm">
                  <PackageIcon className="w-7 h-7 text-indigo-500" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
                      {locale === 'ar' ? 'إجمالي الطلبات الكلية' : 'Total Registered Orders'}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-slate-800">
                      {salesData.totalOrders.toLocaleString()} {locale === 'ar' ? 'طلب' : 'Orders'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm">
                  <TrendingUpIcon className="w-7 h-7 text-blue-500" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
                      {locale === 'ar' ? 'معدل قيمة الطلب' : 'Average Order Value'}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-slate-800">
                      {salesData.averageOrderValue.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm">
                  <CheckCircleIcon className="w-7 h-7 text-teal-500" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
                      {locale === 'ar' ? 'نسبة نجاح التوصيل' : 'Delivery Success Rate'}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-teal-600">
                      {(salesData.deliverySuccessRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Trends Chart */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-black text-slate-800 text-sm sm:text-base mb-6">
                  {locale === 'ar' ? 'اتجاهات المبيعات اليومية' : 'Daily Sales Trends'}
                </h3>
                {salesData.dailyTrends.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    {locale === 'ar' ? 'لا توجد بيانات للفترة المحددة' : 'No data available for this range'}
                  </div>
                ) : (
                  <div>
                    {/* SVG Chart */}
                    <div className="relative h-64 w-full" style={{ direction: 'ltr' }}>
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((yVal, idx) => (
                          <line
                            key={idx}
                            x1="0"
                            y1={yVal}
                            x2="100"
                            y2={yVal}
                            stroke="#f1f5f9"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                          />
                        ))}
                        {/* Path Line */}
                        <path
                          d={salesData.dailyTrends.map((d, idx) => {
                            const maxRev = Math.max(...salesData.dailyTrends.map(t => t.revenue), 100);
                            const x = (idx / (salesData.dailyTrends.length - 1 || 1)) * 100;
                            const y = 100 - (d.revenue / maxRev) * 100;
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="var(--color-primary, #10b981)"
                          strokeWidth="2.5"
                        />
                      </svg>
                    </div>
                    {/* X-Axis labels */}
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-3" style={{ direction: 'ltr' }}>
                      {salesData.dailyTrends.map((d, idx) => {
                        const isFirstLastOrMiddle = idx === 0 || idx === salesData.dailyTrends.length - 1 || idx === Math.floor(salesData.dailyTrends.length / 2);
                        return isFirstLastOrMiddle ? (
                          <span key={d.date}>{d.date.split('T')[0]}</span>
                        ) : (
                          <span key={d.date} />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Governorate Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport(
                        salesData.governorateBreakdown,
                        [
                          locale === 'ar' ? 'المحافظة' : 'Governorate',
                          locale === 'ar' ? 'عدد الطلبات' : 'Order Count',
                          locale === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue',
                          locale === 'ar' ? 'نسبة نجاح التوصيل' : 'Delivery Success Rate'
                        ],
                        (item: GovernorateSalesDto) => [
                          item.governorate,
                          item.orderCount,
                          item.totalRevenue,
                          `${(item.deliverySuccessRate * 100).toFixed(1)}%`
                        ],
                        `governorates-sales-${fromDateStr}-to-${toDateStr}.csv`
                      )}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      {locale === 'ar' ? 'تصدير إكسل' : 'Excel Export'}
                    </button>
                  </div>
                  <h3 className="font-black text-slate-800 text-sm">
                    {locale === 'ar' ? 'توزيع المبيعات بحسب المحافظات' : 'Sales by Governorates'}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold">
                      <tr>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'المحافظة' : 'Governorate'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'عدد الطلبات' : 'Orders'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'إجمالي المبيعات' : 'Revenue'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'نسبة نجاح التوصيل' : 'Delivery Success'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {salesData.governorateBreakdown.map((gov) => (
                        <tr key={gov.governorate} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-black">{gov.governorate}</td>
                          <td className="px-6 py-4 font-bold">{gov.orderCount}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{gov.totalRevenue.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black ${
                              gov.deliverySuccessRate >= 0.7 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {(gov.deliverySuccessRate * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Orders Report */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleExport(
                        filteredOrders,
                        [
                          locale === 'ar' ? 'رقم الطلب' : 'Order ID',
                          locale === 'ar' ? 'المسوق' : 'Marketer',
                          locale === 'ar' ? 'العميل' : 'Customer',
                          locale === 'ar' ? 'الهاتف' : 'Phone',
                          locale === 'ar' ? 'المحافظة' : 'Governorate',
                          locale === 'ar' ? 'الحالة' : 'Status',
                          locale === 'ar' ? 'الإجمالي' : 'Total Amount',
                          locale === 'ar' ? 'أرباح المسوق' : 'Marketer Commission',
                          locale === 'ar' ? 'تاريخ الإنشاء' : 'Date'
                        ],
                        (item: ReportOrderDetailsDto) => [
                          item.id,
                          item.marketerName,
                          item.customerName,
                          item.customerPhone,
                          item.governorate,
                          item.status,
                          item.totalPrice,
                          item.marketerProfit,
                          item.createdTime.split('T')[0]
                        ],
                        `orders-report-${fromDateStr}-to-${toDateStr}.csv`
                      )}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      {locale === 'ar' ? 'تصدير إكسل' : 'Excel Export'}
                    </button>
                    {/* Simple Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={locale === 'ar' ? 'ابحث برقم الطلب، المسوق، أو الهاتف...' : 'Search order, marketer, customer...'}
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-8 text-xs font-semibold outline-none focus:border-primary/50 text-slate-700 min-w-[200px]"
                      />
                      <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <h3 className="font-black text-slate-800 text-sm">
                    {locale === 'ar' ? 'سجل الطلبات التفصيلي للفترة' : 'Detailed Range Orders'}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold">
                      <tr>
                        <th className="px-6 py-3.5 font-black">#{locale === 'ar' ? 'الرقم' : 'ID'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'المسوق' : 'Marketer'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'العميل' : 'Customer'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'المحافظة' : 'Governorate'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'الإجمالي' : 'Total'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'أرباح المسوق' : 'Commission'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'تاريخ الإنشاء' : 'Date'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-slate-400 font-bold">
                            {locale === 'ar' ? 'لا توجد نتائج مطابقة' : 'No records found'}
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-black">#{ord.id}</td>
                            <td className="px-6 py-4 font-bold">{ord.marketerName}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{ord.customerName}</div>
                              <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-500">{ord.governorate}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[9px] font-black ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : ord.status === 'Cancelled' || ord.status === 'DeliveryFailed' || ord.status === 'ConfirmationFailed'
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-amber-50 text-amber-600'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900">{ord.totalPrice.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                            <td className="px-6 py-4 font-bold text-emerald-600">{ord.marketerProfit.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                            <td className="px-6 py-4 text-slate-400 font-bold">{ord.createdTime.split('T')[0]}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================= MARKETERS TAB ================================= */}
          {activeTab === 'marketers' && (
            <div className="space-y-6 text-right">
              {/* Marketers Listing */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleExport(
                        filteredMarketers,
                        [
                          locale === 'ar' ? 'كود المسوق' : 'Marketer ID',
                          locale === 'ar' ? 'الاسم' : 'Name',
                          locale === 'ar' ? 'الهاتف' : 'Phone',
                          locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders',
                          locale === 'ar' ? 'الطلبات المسلمة' : 'Delivered Orders',
                          locale === 'ar' ? 'نسبة نجاح التوصيل' : 'Delivery Success %',
                          locale === 'ar' ? 'العمولات المكتسبة' : 'Total Profits Earned',
                          locale === 'ar' ? 'السحوبات المعتمدة' : 'Approved Withdrawals',
                          locale === 'ar' ? 'السحوبات المعلقة' : 'Pending Withdrawals',
                          locale === 'ar' ? 'المحفظة الحالية' : 'Current Balance'
                        ],
                        (item: MarketerReportDto) => [
                          item.marketerId,
                          item.name,
                          item.phone,
                          item.totalOrdersCount,
                          item.deliveredOrdersCount,
                          `${(item.deliverySuccessRate * 100).toFixed(1)}%`,
                          item.totalProfitEarned,
                          item.approvedWithdrawals,
                          item.pendingWithdrawals,
                          item.currentBalance
                        ],
                        `marketers-performance-${fromDateStr}-to-${toDateStr}.csv`
                      )}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      {locale === 'ar' ? 'تصدير إكسل' : 'Excel Export'}
                    </button>
                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={locale === 'ar' ? 'ابحث باسم أو هاتف المسوق...' : 'Search by name or phone...'}
                        value={marketerSearch}
                        onChange={(e) => setMarketerSearch(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-8 text-xs font-semibold outline-none focus:border-primary/50 text-slate-700 min-w-[200px]"
                      />
                      <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <h3 className="font-black text-slate-800 text-sm">
                    {locale === 'ar' ? 'أداء ومبيعات المسوقين بالتفصيل' : 'Marketer Sales & Payout Metrics'}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold">
                      <tr>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'الاسم' : 'Name'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'نسبة نجاح التوصيل' : 'Delivery Success'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'العمولات المكتسبة' : 'Profits Earned'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'تم سحبها' : 'Paid Out'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'قيد السحب' : 'Pending Payout'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'الرصيد الحالي' : 'Wallet Balance'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredMarketers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400 font-bold">
                            {locale === 'ar' ? 'لا يوجد مسوقون لعرضهم' : 'No marketers found'}
                          </td>
                        </tr>
                      ) : (
                        filteredMarketers.map((m) => (
                          <tr key={m.marketerId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-black text-slate-800">{m.name}</div>
                              <div className="text-[10px] text-slate-400">{m.phone}</div>
                            </td>
                            <td className="px-6 py-4 font-bold">{m.totalOrdersCount} <span className="text-[10px] text-slate-400">({m.deliveredOrdersCount} سلمت)</span></td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                m.deliverySuccessRate >= 0.7 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {(m.deliverySuccessRate * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 font-black text-slate-800">{m.totalProfitEarned.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                            <td className="px-6 py-4 font-bold text-slate-500">{m.approvedWithdrawals.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                            <td className="px-6 py-4 font-bold text-amber-600">{m.pendingWithdrawals.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                            <td className="px-6 py-4 font-black text-emerald-600">{m.currentBalance.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================= PRODUCTS TAB ================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6 text-right">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleExport(
                        filteredProducts,
                        [
                          locale === 'ar' ? 'كود المنتج' : 'Product ID',
                          locale === 'ar' ? 'الاسم' : 'Name',
                          locale === 'ar' ? 'القسم' : 'Category',
                          locale === 'ar' ? 'المورد' : 'Supplier',
                          locale === 'ar' ? 'المخزون الحالي' : 'Stock Quantity',
                          locale === 'ar' ? 'الكمية المباعة' : 'Qty Sold',
                          locale === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue',
                          locale === 'ar' ? 'إجمالي الربح' : 'Total Margin'
                        ],
                        (item: ProductReportDto) => [
                          item.productId,
                          item.name,
                          item.categoryName,
                          item.supplierName,
                          item.stockQuantity,
                          item.quantitySold,
                          item.totalRevenue,
                          item.totalProfit
                        ],
                        `products-sales-${fromDateStr}-to-${toDateStr}.csv`
                      )}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      {locale === 'ar' ? 'تصدير إكسل' : 'Excel Export'}
                    </button>
                    {/* Stock status filter */}
                    <select
                      value={productStockFilter}
                      onChange={(e) => setProductStockFilter(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-600 outline-none"
                    >
                      <option value="all">{locale === 'ar' ? 'كل مستويات المخزون' : 'All Stock'}</option>
                      <option value="inStock">{locale === 'ar' ? 'متوفر (>= 10 قطع)' : 'In Stock'}</option>
                      <option value="lowStock">{locale === 'ar' ? 'مخزون منخفض (< 10 قطع)' : 'Low Stock'}</option>
                    </select>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder={locale === 'ar' ? 'ابحث باسم المنتج أو المورد...' : 'Search by name or supplier...'}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-8 text-xs font-semibold outline-none focus:border-primary/50 text-slate-700 min-w-[200px]"
                      />
                      <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <h3 className="font-black text-slate-800 text-sm">
                    {locale === 'ar' ? 'سجل المنتجات ومبيعات الكتالوج' : 'Product Inventory & Performance'}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold">
                      <tr>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'المنتج' : 'Product'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'القسم' : 'Category'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'المورد' : 'Supplier'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'المخزون الحالي' : 'Stock Quantity'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'الكمية المباعة' : 'Units Sold'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'المبيعات' : 'Revenue'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'إجمالي الأرباح' : 'Platform Margin'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400 font-bold">
                            {locale === 'ar' ? 'لا توجد منتجات مطابقة للبحث' : 'No products found'}
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.productId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-black text-slate-800">{p.name}</td>
                            <td className="px-6 py-4 font-semibold text-slate-500">{p.categoryName}</td>
                            <td className="px-6 py-4 font-bold text-slate-600">{p.supplierName}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                p.stockQuantity < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {p.stockQuantity} {locale === 'ar' ? 'قطعة' : 'units'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800">{p.quantitySold}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{p.totalRevenue.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                            <td className="px-6 py-4 font-black text-emerald-600">{p.totalProfit.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================= FINANCIALS TAB ================================= */}
          {activeTab === 'financials' && financialsData && (
            <div className="space-y-8 text-right">
              {/* Financial KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 text-white flex flex-col justify-between space-y-3 shadow-xl relative overflow-hidden">
                  <WalletIcon className="w-7 h-7 text-emerald-400" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
                      {locale === 'ar' ? 'صافي أرباح المنصة' : 'Net Platform Profit'}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-emerald-400">
                      {financialsData.netPlatformProfit.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm">
                  <TrendingUpIcon className="w-7 h-7 text-indigo-500" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
                      {locale === 'ar' ? 'إجمالي المبيعات' : 'Gross Revenue'}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-slate-800">
                      {financialsData.grossRevenue.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm">
                  <UsersIcon className="w-7 h-7 text-blue-500" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
                      {locale === 'ar' ? 'عمولات المسوقين الموزعة' : 'Marketer Commission Paid'}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-slate-800">
                      {financialsData.marketersProfit.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm">
                  <PackageIcon className="w-7 h-7 text-teal-500" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 block">
                      {locale === 'ar' ? 'تكلفة البضاعة الموردة' : 'Wholesale Wholesale Cost'}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-slate-800">
                      {financialsData.totalWholesaleCost.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Trends Chart */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-black text-slate-800 text-sm sm:text-base mb-6">
                  {locale === 'ar' ? 'الأداء المالي الكلي بالشهور' : 'Monthly Financial Trends'}
                </h3>
                {financialsData.monthlyTrends.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    {locale === 'ar' ? 'لا توجد بيانات للفترة المحددة' : 'No data available for this range'}
                  </div>
                ) : (
                  <div>
                    {/* SVG Chart */}
                    <div className="relative h-64 w-full" style={{ direction: 'ltr' }}>
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((yVal, idx) => (
                          <line
                            key={idx}
                            x1="0"
                            y1={yVal}
                            x2="100"
                            y2={yVal}
                            stroke="#f1f5f9"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                          />
                        ))}
                        {/* Platform Net Profit Path (Emerald) */}
                        <path
                          d={financialsData.monthlyTrends.map((d, idx) => {
                            const maxRev = Math.max(...financialsData.monthlyTrends.map(t => t.grossRevenue), 100);
                            const x = (idx / (financialsData.monthlyTrends.length - 1 || 1)) * 100;
                            const y = 100 - (d.netPlatformProfit / maxRev) * 100;
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="var(--color-primary, #10b981)"
                          strokeWidth="2.5"
                        />
                        {/* Gross Revenue Path (Indigo) */}
                        <path
                          d={financialsData.monthlyTrends.map((d, idx) => {
                            const maxRev = Math.max(...financialsData.monthlyTrends.map(t => t.grossRevenue), 100);
                            const x = (idx / (financialsData.monthlyTrends.length - 1 || 1)) * 100;
                            const y = 100 - (d.grossRevenue / maxRev) * 100;
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="1.5"
                          strokeDasharray="3,3"
                        />
                      </svg>
                    </div>
                    {/* Legend */}
                    <div className="flex justify-center gap-6 text-[10px] font-bold mt-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-primary block" />
                        <span>{locale === 'ar' ? 'صافي أرباح المنصة' : 'Net Platform Profit'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-indigo-500 border-dashed border-t block" />
                        <span>{locale === 'ar' ? 'إجمالي المبيعات' : 'Gross Revenue'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Withdrawals Log */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleExport(
                        filteredWithdrawals,
                        [
                          locale === 'ar' ? 'كود السحب' : 'Withdrawal ID',
                          locale === 'ar' ? 'المسوق' : 'Marketer',
                          locale === 'ar' ? 'الهاتف' : 'Phone',
                          locale === 'ar' ? 'المبلغ' : 'Amount',
                          locale === 'ar' ? 'الحالة' : 'Status',
                          locale === 'ar' ? 'التاريخ' : 'Date',
                          locale === 'ar' ? 'ملاحظات' : 'Notes'
                        ],
                        (item: ReportWithdrawalDetailsDto) => [
                          item.id,
                          item.marketerName,
                          item.marketerPhone,
                          item.amount,
                          item.status,
                          item.createdAt.split('T')[0],
                          item.notes
                        ],
                        `withdrawals-log-${fromDateStr}-to-${toDateStr}.csv`
                      )}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      {locale === 'ar' ? 'تصدير إكسل' : 'Excel Export'}
                    </button>
                    {/* Search bar */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={locale === 'ar' ? 'ابحث باسم المسوق أو هاتف...' : 'Search marketer or phone...'}
                        value={withdrawalSearch}
                        onChange={(e) => setWithdrawalSearch(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-8 text-xs font-semibold outline-none focus:border-primary/50 text-slate-700 min-w-[200px]"
                      />
                      <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <h3 className="font-black text-slate-800 text-sm">
                    {locale === 'ar' ? 'سجل تسويات طلبات السحب الكلي' : 'Settled Payouts Ledger'}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold">
                      <tr>
                        <th className="px-6 py-3.5 font-black">#{locale === 'ar' ? 'كود السحب' : 'ID'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'المسوق' : 'Marketer'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'المبلغ' : 'Amount'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="px-6 py-3.5 font-black">{locale === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400 font-bold">
                            {locale === 'ar' ? 'لا توجد طلبات سحب مطابقة' : 'No payout records found'}
                          </td>
                        </tr>
                      ) : (
                        filteredWithdrawals.map((w) => (
                          <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-black">#{w.id}</td>
                            <td className="px-6 py-4">
                              <div className="font-black text-slate-800">{w.marketerName}</div>
                              <div className="text-[10px] text-slate-400">{w.marketerPhone}</div>
                            </td>
                            <td className="px-6 py-4 font-black text-slate-900">{w.amount.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black ${
                                w.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : w.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-rose-50 text-rose-600'
                              }`}>
                                {w.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 font-bold">{w.createdAt.split('T')[0]}</td>
                            <td className="px-6 py-4 text-slate-500 font-medium max-w-[200px] truncate" title={w.notes}>{w.notes || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
