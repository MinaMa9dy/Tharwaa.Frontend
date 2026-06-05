'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { orderService } from '@/features/orders/api/orderService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { OrderDto, OrderStatus } from '@/shared/types/order';
import { toast } from 'react-hot-toast';

export default function AdminOrdersPage() {
  const { locale, dir } = useLocale();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'Supervisor';
  const isAdmin = user?.role === 'Admin';

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Supervisor tabs: 'available' = unconfirmed orders, 'my' = supervisor's own orders
  const [supervisorTab, setSupervisorTab] = useState<'available' | 'my'>('available');

  const filteredOrders = orders;

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      let res;
      if (isSupervisor) {
        if (supervisorTab === 'available') {
          // Unassigned pending orders for any supervisor to claim
          res = await orderService.getAll(undefined, undefined, searchQuery || undefined, currentPage, pageSize, undefined, true);
        } else {
          // Orders already assigned to this supervisor
          res = await orderService.getMyOrders(undefined, searchQuery || undefined, currentPage, pageSize);
        }
      } else {
        // Admin: all orders with optional status + search
        res = await orderService.getAll(undefined, statusFilter || undefined, searchQuery || undefined, currentPage, pageSize);
      }

      if (res.success && res.data) {
        setOrders(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (err) {
      setOrders([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, supervisorTab]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadOrders();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, currentPage, supervisorTab]);

  const handleConfirmOrder = async (id: number) => {
    try {
      const res = await orderService.updateStatus(id, OrderStatus.Confirmed);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تأكيد الطلب وتحويله لطلباتك' : 'Order confirmed and assigned to you');
        loadOrders();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تأكيد الطلب' : 'Failed to confirm order'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (id: number, status: OrderStatus) => {
    try {
      const res = await orderService.updateStatus(id, status);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تحديث حالة الطلب بنجاح' : 'Order status updated successfully');
        loadOrders();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update order status'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return locale === 'ar' ? 'قيد الانتظار' : 'Pending';
      case OrderStatus.Confirmed: return locale === 'ar' ? 'تم التأكيد' : 'Confirmed';
      case OrderStatus.Shipped: return locale === 'ar' ? 'جاري الشحن' : 'Shipped';
      case OrderStatus.Delivered: return locale === 'ar' ? 'تم التوصيل' : 'Delivered';
      case OrderStatus.Cancelled: return locale === 'ar' ? 'ملغي' : 'Cancelled';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Delivered: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case OrderStatus.Cancelled: return 'bg-rose-50 text-rose-700 border-rose-200';
      case OrderStatus.Pending: return 'bg-amber-50 text-amber-700 border-amber-200';
      case OrderStatus.Confirmed: return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatus.Shipped: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          {locale === 'ar' ? 'طلبات الشحن والتسليم' : 'Shipping Orders'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {isSupervisor
            ? (locale === 'ar' ? 'اختر طلبات للتأكيد أو راجع طلباتك المُعيَّنة' : 'Pick orders to confirm or review your assigned orders')
            : (locale === 'ar' ? 'راجع تفاصيل طلبات الشحن المرسلة من المسوقين، غير حالة الطلب لتأكيد الشحن والتسليم للعميل.' : 'View dropshipping orders and update logistics statuses.')}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden text-right">
        {/* Header bar: Tabs for supervisors, or status/search for admin */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
          {isSupervisor ? (
            <>
              {/* Supervisor tabs */}
              <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
                <button
                  onClick={() => { setSupervisorTab('available'); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    supervisorTab === 'available'
                      ? 'bg-white text-primary shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  📋 {locale === 'ar' ? 'الطلبات المتاحة' : 'Available Orders'}
                </button>
                <button
                  onClick={() => { setSupervisorTab('my'); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    supervisorTab === 'my'
                      ? 'bg-white text-primary shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ✅ {locale === 'ar' ? 'طلباتي المُعيَّنة' : 'My Assigned Orders'}
                </button>
              </div>

              {/* Search for supervisor */}
              <div className="relative w-full sm:max-w-sm">
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder={locale === 'ar' ? 'ابحث برقم الطلب، اسم العميل...' : 'Search by order ID, customer...'}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full text-right pr-9 pl-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder-slate-400"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="font-black text-slate-800 text-sm shrink-0">
                {locale === 'ar' ? 'كل طلبات المنصة' : 'All Platform Orders'}
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Status Filter Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-right px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">{locale === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
                  <option value="Pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                  <option value="Confirmed">{locale === 'ar' ? 'تم التأكيد' : 'Confirmed'}</option>
                  <option value="Shipped">{locale === 'ar' ? 'جاري الشحن' : 'Shipped'}</option>
                  <option value="Delivered">{locale === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                  <option value="Cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                </select>

                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'ابحث برقم الطلب، اسم العميل أو العنوان...' : 'Search by order ID, customer or address...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-right pr-9 pl-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-sm font-bold text-slate-400 animate-pulse">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {isSupervisor && supervisorTab === 'available'
              ? (locale === 'ar' ? 'لا توجد طلبات متاحة للتأكيد حالياً' : 'No available orders to confirm at the moment')
              : isSupervisor && supervisorTab === 'my'
              ? (locale === 'ar' ? 'لا توجد طلبات مُعيَّنة لك بعد' : 'No orders assigned to you yet')
              : (locale === 'ar' ? 'لا توجد طلبات حالياً' : 'No orders found')}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {locale === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matches found for your search'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-5 sm:p-6 flex flex-col justify-between items-stretch gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1.5 flex-1 text-right">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-black text-slate-900">{locale === 'ar' ? 'الطلب' : 'Order'} #{order.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">
                      👤 {locale === 'ar' ? 'العميل:' : 'Customer:'} {order.customerName} | 📞 {order.customerPhone}
                    </p>
                    <p className="text-xs text-slate-500 font-bold">
                      📍 {locale === 'ar' ? 'العنوان:' : 'Address:'} {order.shippingAddress?.street}، {order.shippingAddress?.city}، {order.shippingAddress?.state}
                    </p>
                    {order.marketerName && (
                      <p className="text-xs text-slate-500 font-bold">
                        📣 {locale === 'ar' ? 'المسوق:' : 'Marketer:'} {order.marketerName}
                      </p>
                    )}
                    {/* Show supervisor name for admin */}
                    {isAdmin && (
                      <p className="text-xs font-bold">
                        {order.supervisorName
                          ? <span className="text-indigo-600">👮 {locale === 'ar' ? 'المشرف المسؤول:' : 'Assigned Supervisor:'} {order.supervisorName}</span>
                          : <span className="text-slate-400">👮 {locale === 'ar' ? 'المشرف: غير معين بعد' : 'Supervisor: Not yet assigned'}</span>
                        }
                      </p>
                    )}
                    <p className="text-xs font-black text-emerald-600">
                      💰 {locale === 'ar' ? 'عمولة المسوق:' : 'Commission:'} {order.commission} ج.م | {locale === 'ar' ? 'القيمة الكلية:' : 'Total:'} {order.totalAmount} ج.م
                    </p>
                  </div>

                  {/* Status action controllers */}
                  <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto shrink-0">
                    {/* Supervisor: confirm pending orders in "available" tab */}
                    {isSupervisor && supervisorTab === 'available' && order.status === OrderStatus.Pending && (
                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-black cursor-pointer shadow-sm"
                      >
                        {locale === 'ar' ? 'تأكيد الطلب ✓' : 'Confirm Order ✓'}
                      </button>
                    )}
                    {/* Supervisor: update status in "my" tab */}
                    {isSupervisor && supervisorTab === 'my' && (
                      <>
                        {order.status === OrderStatus.Confirmed && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Shipped)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-black cursor-pointer shadow-sm"
                          >
                            {locale === 'ar' ? 'شحن الطلب 🚚' : 'Ship Order 🚚'}
                          </button>
                        )}
                        {order.status === OrderStatus.Shipped && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Delivered)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-black cursor-pointer shadow-sm"
                          >
                            {locale === 'ar' ? 'تم التوصيل 🎉' : 'Mark Delivered 🎉'}
                          </button>
                        )}
                        {order.status !== OrderStatus.Delivered && order.status !== OrderStatus.Cancelled && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Cancelled)}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-black cursor-pointer shadow-sm"
                          >
                            {locale === 'ar' ? 'إلغاء ✕' : 'Cancel ✕'}
                          </button>
                        )}
                      </>
                    )}
                    {/* Admin: full status control */}
                    {isAdmin && (
                      <>
                        {order.status === OrderStatus.Pending && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Confirmed)}
                            className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-black cursor-pointer shadow-sm"
                          >
                            {locale === 'ar' ? 'تأكيد الطلب ✓' : 'Confirm Order ✓'}
                          </button>
                        )}
                        {order.status === OrderStatus.Confirmed && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Shipped)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-black cursor-pointer shadow-sm"
                          >
                            {locale === 'ar' ? 'شحن الطلب 🚚' : 'Ship Order 🚚'}
                          </button>
                        )}
                        {order.status === OrderStatus.Shipped && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Delivered)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-black cursor-pointer shadow-sm"
                          >
                            {locale === 'ar' ? 'تم التوصيل 🎉' : 'Mark Delivered 🎉'}
                          </button>
                        )}
                        {order.status !== OrderStatus.Delivered && order.status !== OrderStatus.Cancelled && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Cancelled)}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-black cursor-pointer shadow-sm"
                          >
                            {locale === 'ar' ? 'إلغاء ✕' : 'Cancel ✕'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] text-slate-400 font-black block">📦 {locale === 'ar' ? 'المنتجات المطلوبة:' : 'Requested Products:'}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100/60 flex justify-between items-center gap-2 text-[11px] font-bold text-slate-700">
                          <div className="min-w-0 text-right">
                            <p className="font-black text-slate-800 truncate">{item.productName}</p>
                            {item.variantSku && (
                              <span className="text-[9px] text-slate-400 font-mono block">SKU: {item.variantSku}</span>
                            )}
                          </div>
                          <div className="text-left shrink-0 font-black text-xs space-y-1">
                            <div className="flex justify-end gap-2">
                              <span className="text-slate-400">{locale === 'ar' ? 'السعر الأساسي:' : 'Base Price:'}</span>
                              <span className="text-emerald-600">{((item.unitPrice || 0) - (item.unitProfit || 0)).toLocaleString()} ج.م</span>
                            </div>
                            <div className="flex justify-end gap-2">
                              <span className="text-slate-400">{locale === 'ar' ? 'سعر البيع:' : 'Sell Price:'}</span>
                              <span className="text-slate-700">{(item.unitPrice || 0).toLocaleString()} ج.م</span>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-1 mt-1">
                              <span className="text-primary">x{item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && orders.length > 0 && (
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
