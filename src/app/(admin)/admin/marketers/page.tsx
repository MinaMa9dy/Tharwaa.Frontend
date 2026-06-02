'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { marketerService } from '@/features/marketers/api/marketerService';
import { orderService } from '@/features/orders/api/orderService';
import { withdrawalService } from '@/features/withdrawals/api/withdrawalService';
import { MarketerDto, MarketerStatsDto } from '@/shared/types/marketer';
import { OrderDto, OrderStatus } from '@/shared/types/order';
import { WithdrawalDto, WithdrawalStatus } from '@/shared/types/withdrawal';
import { toast } from 'react-hot-toast';

export default function AdminMarketersPage() {
  const { locale, dir } = useLocale();
  const [marketers, setMarketers] = useState<MarketerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Marketer Detail Modal States
  const [selectedMarketer, setSelectedMarketer] = useState<MarketerDto | null>(null);
  const [marketerStats, setMarketerStats] = useState<MarketerStatsDto | null>(null);
  const [marketerOrders, setMarketerOrders] = useState<OrderDto[]>([]);
  const [marketerWithdrawals, setMarketerWithdrawals] = useState<WithdrawalDto[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'withdrawals'>('orders');

  const loadMarketers = async () => {
    setIsLoading(true);
    try {
      const res = await marketerService.getAll(searchQuery, currentPage, pageSize);
      if (res.success && res.data) {
        setMarketers(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      } else {
        setMarketers([]);
        setTotalPages(1);
      }
    } catch (err) {
      setMarketers([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketers();
  }, [currentPage, searchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleToggleActive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent modal from opening when clicking toggle button
    try {
      const res = await marketerService.toggleActive(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تعديل حالة المسوق بنجاح' : 'Marketer status toggled successfully');
        loadMarketers();
        if (selectedMarketer && selectedMarketer.id === id) {
          setSelectedMarketer({ ...selectedMarketer, isActive: !selectedMarketer.isActive });
        }
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تعديل حالة المسوق' : 'Failed to update marketer status'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    }
  };

  const handleViewDetails = async (m: MarketerDto) => {
    setSelectedMarketer(m);
    setMarketerStats(null);
    setMarketerOrders([]);
    setMarketerWithdrawals([]);
    setIsDetailLoading(true);
    setActiveTab('orders');
    try {
      const [statsRes, ordersRes, withdrawalsRes] = await Promise.all([
        marketerService.getStats(m.id),
        orderService.getAll(m.id),
        withdrawalService.getAll(m.id)
      ]);

      if (statsRes.success && statsRes.data) {
        setMarketerStats(statsRes.data);
      }
      if (ordersRes.success && ordersRes.data) {
        setMarketerOrders(ordersRes.data);
      }
      if (withdrawalsRes.success && withdrawalsRes.data) {
        setMarketerWithdrawals(withdrawalsRes.data);
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل تحميل تفاصيل المسوق' : 'Failed to load marketer details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const filteredMarketers = marketers;

  const getOrderStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return locale === 'ar' ? 'قيد الانتظار' : 'Pending';
      case OrderStatus.Confirmed: return locale === 'ar' ? 'تم التأكيد' : 'Confirmed';
      case OrderStatus.Shipped: return locale === 'ar' ? 'جاري الشحن' : 'Shipped';
      case OrderStatus.Delivered: return locale === 'ar' ? 'تم التوصيل' : 'Delivered';
      case OrderStatus.Cancelled: return locale === 'ar' ? 'ملغي' : 'Cancelled';
    }
  };

  const getWithdrawalStatusText = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.Pending: return locale === 'ar' ? 'قيد الانتظار' : 'Pending';
      case WithdrawalStatus.Approved: return locale === 'ar' ? 'تم التحويل' : 'Approved';
      case WithdrawalStatus.Rejected: return locale === 'ar' ? 'مرفوض' : 'Rejected';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          {locale === 'ar' ? 'إدارة المسوقين النشطين' : 'Marketers Directory'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {locale === 'ar' ? 'راجع تفاصيل المسوقين المسجلين في النظام، فعل حساباتهم أو عطلها لمراقبة العمليات.' : 'Verify user profiles, track status flags, and update system entries.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden text-right">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-black text-slate-800 text-sm shrink-0">
            {locale === 'ar' ? 'قائمة المسوقين' : 'Marketers Directory'}
          </h3>
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث باسم المسوق، البريد الإلكتروني، أو الهاتف...' : 'Search by name, email or phone...'}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-right pr-9 pl-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-sm font-bold text-slate-400 animate-pulse">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : marketers.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {locale === 'ar' ? 'لا يوجد مسوقين مسجلين حالياً' : 'No marketers found'}
          </div>
        ) : filteredMarketers.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {locale === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matches found for your search'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMarketers.map((m) => (
              <div 
                key={m.id} 
                onClick={() => handleViewDetails(m)}
                className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
              >
                <div className="space-y-1.5 flex-1 text-right">
                  <div className="flex items-center gap-2 justify-start">
                    <span className="text-base font-black text-slate-800">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      m.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {m.isActive ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Disabled')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">
                    📧 {m.email} | 📞 {m.phoneNumber || (locale === 'ar' ? 'بدون رقم' : 'No number')}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    💸 {locale === 'ar' ? 'الرصيد المتاح:' : 'Balance:'} {m.balance.toLocaleString()} ج.م
                  </p>
                  <span className="inline-block text-[10px] text-primary font-black underline mt-1">
                    🔍 {locale === 'ar' ? 'عرض تفاصيل الأنشطة والسحوبات والطلبات' : 'View all orders, withdrawals and statistics'}
                  </span>
                </div>

                <button
                  onClick={(e) => handleToggleActive(m.id, e)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all shrink-0 ${
                    m.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                  }`}
                >
                  {m.isActive ? (locale === 'ar' ? 'تعطيل الحساب' : 'Disable') : (locale === 'ar' ? 'تفعيل الحساب' : 'Enable')}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && marketers.length > 0 && (
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

      {/* Marketer Details Modal */}
      {selectedMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200/50 text-right animate-scaleIn my-8">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  👤 {selectedMarketer.firstName} {selectedMarketer.lastName}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5 select-all">ID: {selectedMarketer.id}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedMarketer(null);
                  setMarketerStats(null);
                  setMarketerOrders([]);
                  setMarketerWithdrawals([]);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700 text-xs font-black"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Profile details & Quick Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold">📧 {locale === 'ar' ? 'البريد الإلكتروني:' : 'Email:'} <span className="text-slate-800 font-black">{selectedMarketer.email}</span></p>
                  <p className="text-xs text-slate-500 font-bold">📞 {locale === 'ar' ? 'رقم الهاتف:' : 'Phone:'} <span className="text-slate-800 font-black">{selectedMarketer.phoneNumber || 'N/A'}</span></p>
                </div>
                <button
                  onClick={(e) => handleToggleActive(selectedMarketer.id, e)}
                  className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                    selectedMarketer.isActive
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {selectedMarketer.isActive ? (locale === 'ar' ? 'تعطيل الحساب' : 'Disable Account') : (locale === 'ar' ? 'تفعيل الحساب' : 'Enable Account')}
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-right space-y-1">
                  <span className="text-[10px] text-slate-400 font-black block">{locale === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}</span>
                  <span className="text-base sm:text-lg font-black text-slate-900">
                    {selectedMarketer.balance.toLocaleString()} ج.م
                  </span>
                </div>
                
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-right space-y-1">
                  <span className="text-[10px] text-slate-400 font-black block">{locale === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}</span>
                  <span className="text-base sm:text-lg font-black text-emerald-600">
                    {marketerStats ? marketerStats.totalEarnings.toLocaleString() : '...'} ج.م
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-right space-y-1">
                  <span className="text-[10px] text-slate-400 font-black block">{locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</span>
                  <span className="text-base sm:text-lg font-black text-indigo-600">
                    {marketerStats ? marketerStats.totalOrders : '...'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-right space-y-1">
                  <span className="text-[10px] text-slate-400 font-black block">{locale === 'ar' ? 'حالة الطلبات' : 'Orders Status'}</span>
                  <span className="text-xs font-black text-slate-700 flex gap-2 pt-1 items-center">
                    <span className="text-emerald-600">✅ {marketerStats?.deliveredOrders || 0}</span>
                    <span>|</span>
                    <span className="text-rose-600">❌ {marketerStats?.cancelledOrders || 0}</span>
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-200 flex justify-start gap-4">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
                    activeTab === 'orders'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  📦 {locale === 'ar' ? 'طلبات المسوق' : 'Orders History'} ({marketerOrders.length})
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`pb-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer ${
                    activeTab === 'withdrawals'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  💸 {locale === 'ar' ? 'سجل السحوبات' : 'Withdrawal Log'} ({marketerWithdrawals.length})
                </button>
              </div>

              {/* Tab Contents */}
              {isDetailLoading ? (
                <div className="p-8 text-center text-xs font-black text-slate-400 animate-pulse">
                  {locale === 'ar' ? 'جاري تحميل تفاصيل الأنشطة...' : 'Loading activity details...'}
                </div>
              ) : activeTab === 'orders' ? (
                marketerOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs font-black text-slate-400 bg-slate-50 rounded-2xl">
                    {locale === 'ar' ? 'لا توجد طلبات مسجلة لهذا المسوق' : 'No orders recorded for this marketer'}
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {marketerOrders.map((ord) => (
                      <div key={ord.id} className="p-4 flex justify-between items-center text-right text-xs">
                        <div className="space-y-1">
                          <p className="font-black text-slate-800">
                            الطلب #{ord.id} - {ord.customerName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            📍 {ord.shippingAddress.city}، {ord.shippingAddress.state} | 📅 {new Date(ord.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                          </p>
                        </div>
                        <div className="text-left space-y-1">
                          <p className="font-black text-emerald-600">{ord.totalAmount} ج.م</p>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-500">
                            {getOrderStatusText(ord.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                marketerWithdrawals.length === 0 ? (
                  <div className="p-8 text-center text-xs font-black text-slate-400 bg-slate-50 rounded-2xl">
                    {locale === 'ar' ? 'لا توجد طلبات سحب مسجلة لهذا المسوق' : 'No withdrawal requests for this marketer'}
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {marketerWithdrawals.map((w) => (
                      <div key={w.id} className="p-4 flex justify-between items-center text-right text-xs">
                        <div className="space-y-1">
                          <p className="font-black text-slate-800">
                            طلب سحب #{w.id}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            📅 {new Date(w.createdAt || w.requestedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                          </p>
                          {w.notes && (
                            <p className="text-[10px] text-slate-500 font-bold mt-1">💡 {w.notes}</p>
                          )}
                        </div>
                        <div className="text-left space-y-1">
                          <p className="font-black text-emerald-600">{w.amount} ج.م</p>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-500">
                            {getWithdrawalStatusText(w.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
