'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { orderService } from '@/features/orders/api/orderService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { OrderDto, OrderStatus } from '@/shared/types/order';
import Pagination from '@/shared/components/Pagination';
import { toast } from 'react-hot-toast';
import { PlusIcon, SearchIcon, CloseIcon, FileIcon, PhoneIcon, MapPinIcon } from '@/shared/components/Icons';

export default function MarketerOrdersPage() {
  const { locale, dir } = useLocale();
  const { user, initialize } = useAuthStore();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [mounted, setMounted] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    initialize();
    const params = new URLSearchParams(window.location.search);
    const urlPage = parseInt(params.get('page') || '1', 10) || 1;
    if (urlPage !== 1) {
      setCurrentPage(urlPage);
    }
    setMounted(true);
  }, [initialize]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlPage = parseInt(params.get('page') || '1', 10) || 1;
      setCurrentPage(urlPage);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const urlPage = parseInt(params.get('page') || '1', 10) || 1;
    if (currentPage !== urlPage) {
      const url = new URL(window.location.href);
      url.searchParams.set('page', currentPage.toString());
      window.history.pushState({}, '', url.toString());
    }
  }, [currentPage, mounted]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getMyOrders(
        statusFilter || undefined,
        searchQuery || undefined,
        currentPage,
        pageSize
      );
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

  const handleCancelOrder = (id: number) => {
    setCancelOrderId(id);
    setCancelReason('');
  };

  const handleConfirmCancelOrder = async () => {
    if (cancelOrderId === null) return;
    setIsCancelling(true);
    try {
      const res = await orderService.cancel(cancelOrderId, { reason: cancelReason || undefined });
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم إلغاء الطلب بنجاح' : 'Order cancelled successfully');
        setCancelOrderId(null);
        await loadOrders();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل إلغاء الطلب' : 'Failed to cancel order'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (!mounted) return;
    const delayDebounceFn = setTimeout(() => {
      if (user) {
        loadOrders();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [user, searchQuery, statusFilter, currentPage, mounted]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case OrderStatus.Confirmed:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatus.Shipped:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case OrderStatus.Delivered:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case OrderStatus.Cancelled:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case OrderStatus.ConfirmationFailed:
        return 'bg-red-50 text-red-700 border-red-200';
      case OrderStatus.DeliveryFailed:
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    if (locale !== 'ar') return status;
    switch (status) {
      case OrderStatus.Pending: return 'قيد الانتظار';
      case OrderStatus.Confirmed: return 'تم التأكيد';
      case OrderStatus.Shipped: return 'جاري الشحن';
      case OrderStatus.Delivered: return 'تم التوصيل';
      case OrderStatus.Cancelled: return 'ملغي';
      case OrderStatus.ConfirmationFailed: return 'فشل التأكيد';
      case OrderStatus.DeliveryFailed: return 'فشل التوصيل';
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            {locale === 'ar' ? 'سجل طلباتي' : 'My Orders'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
            {locale === 'ar' ? 'تتبع حالة طلبات عملائك وعمولاتك المحصلة والمنتظرة.' : 'Track customer shipments and payout statuses.'}
          </p>
        </div>
        <Link
          href="/marketer/products"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
        >
          <PlusIcon className="w-4 h-4" />
          <span>{locale === 'ar' ? 'تسويق منتج جديد' : 'Market New Product'}</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col sm:flex-row gap-4 items-center justify-between text-right shadow-sm">
        <h3 className="font-black text-slate-800 text-sm shrink-0 flex items-center gap-1.5">
          <SearchIcon className="w-4 h-4 text-slate-400" />
          <span>{locale === 'ar' ? 'تصفح وبحث الطلبات' : 'Filter & Search Orders'}</span>
        </h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-right px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-full sm:w-auto"
          >
            <option value="">{locale === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="Pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="Confirmed">{locale === 'ar' ? 'تم التأكيد' : 'Confirmed'}</option>
            <option value="Shipped">{locale === 'ar' ? 'جاري الشحن' : 'Shipped'}</option>
            <option value="Delivered">{locale === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
            <option value="Cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
            <option value="ConfirmationFailed">{locale === 'ar' ? 'فشل التأكيد' : 'Confirmation Failed'}</option>
            <option value="DeliveryFailed">{locale === 'ar' ? 'فشل التوصيل' : 'Delivery Failed'}</option>
          </select>

          {/* Search Query Input */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث برقم الطلب، اسم العميل...' : 'Search by order ID, customer...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right pr-9 pl-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-4 bg-slate-100 rounded w-1/6" />
              </div>
              <div className="h-10 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="flex justify-center mb-2">
            <FileIcon className="w-14 h-14 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-700">
            {searchQuery || statusFilter
              ? (locale === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matches found for your search')
              : (locale === 'ar' ? 'لا توجد طلبات مسجلة بعد' : 'No orders recorded yet')}
          </h3>
          <p className="text-slate-400 text-sm font-bold">
            {searchQuery || statusFilter
              ? (locale === 'ar' ? 'جرب البحث بكلمة أخرى أو تغيير الفلتر' : 'Try searching for something else or clearing filters')
              : (locale === 'ar' ? 'ابدأ بتسويق المنتجات وتسجيل أول طلب لعميلك.' : 'Place your first order to get started.')}
          </p>
        </div>
      ) : (
        <div className={`space-y-6 transition-opacity duration-200 ${isLoading ? 'opacity-65 pointer-events-none' : ''}`}>
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden text-right"
            >
              <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-800">
                    #{order.id}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {new Date(order.createdTime).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  {order.status === OrderStatus.Pending && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 transition-all cursor-pointer shadow-sm hover:shadow flex items-center gap-1"
                    >
                      <CloseIcon className="w-3 h-3" />
                      <span>{locale === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 border-b md:border-b-0 md:border-l border-slate-100 pb-4 md:pb-0 md:pl-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'بيانات العميل' : 'Customer'}</h4>
                  <div className="space-y-1 text-sm font-bold text-slate-700">
                    <p className="text-slate-900 font-black">{order.customerName}</p>
                    <p className="flex items-center gap-1.5">
                      <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerPhone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.shippingAddress.street}، {order.shippingAddress.city}، {order.shippingAddress.state}</span>
                    </p>
                    {order.supplierName && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mt-1">
                        <span>🏪</span>
                        <span>{locale === 'ar' ? 'المورد:' : 'Supplier:'} {order.supplierName}</span>
                      </p>
                    )}
                    {order.notes && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-xl border border-amber-100 mt-2 font-bold flex items-center gap-1.5 w-fit">
                        <FileIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>{locale === 'ar' ? 'ملاحظات: ' : 'Notes: '} {order.notes}</span>
                      </p>
                    )}
                    {order.cancellationReason && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-100 mt-2 font-bold flex items-center gap-1.5 w-fit">
                        <CloseIcon className="w-3.5 h-3.5 text-rose-600" />
                        <span>{locale === 'ar' ? 'سبب الإلغاء/الفشل: ' : 'Reason: '} {order.cancellationReason}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 border-b md:border-b-0 md:border-l border-slate-100 pb-4 md:pb-0 md:pl-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'المنتجات المطلوبة' : 'Products'}</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/60 flex flex-col justify-start text-xs font-bold text-slate-700">
                        <div className="flex justify-between items-center w-full gap-2">
                          <span className="font-black text-slate-900 truncate max-w-[155px]" title={item.productName}>{item.productName}</span>
                          <span className="text-primary font-black shrink-0">x{item.quantity}</span>
                        </div>
                        <div className="flex justify-between items-center w-full mt-1 text-[10px] text-slate-400">
                          {item.variantSku ? (
                            <span className="font-mono">SKU: {item.variantSku}</span>
                          ) : (
                            <span />
                          )}
                          <div className="text-left space-y-0.5">
                            <div className="flex justify-end gap-1">
                              <span>{locale === 'ar' ? 'الأساسي:' : 'Base:'}</span>
                              <span className="text-emerald-600 font-black">{((item.unitPrice || item.price || 0) - (item.unitProfit || 0)).toLocaleString()} ج.م</span>
                            </div>
                            <div className="flex justify-end gap-1">
                              <span>{locale === 'ar' ? 'البيع:' : 'Sell:'}</span>
                              <span className="text-slate-700 font-black">{(item.unitPrice || item.price || 0).toLocaleString()} ج.م</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'التفاصيل المالية' : 'Financials'}</h4>
                    <div className="space-y-1 text-xs sm:text-sm font-bold text-slate-600">
                      <div className="flex justify-between">
                        <span>{order.totalAmount.toLocaleString()} ج.م</span>
                        <span>{locale === 'ar' ? 'مجموع البيع للعميل:' : 'Sales amount:'}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{order.totalCost.toLocaleString()} / ج.م</span>
                        <span>{locale === 'ar' ? 'سعر الجملة والشحن:' : 'Wholesale cost:'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-sm font-black text-emerald-600">
                    <span>+{order.commission.toLocaleString()} ج.م</span>
                    <span>{locale === 'ar' ? 'أرباحك الصافية:' : 'Net profit:'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination controls */}
          {!isLoading && orders.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Nice Cancellation Modal Replacement */}
      {cancelOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn" dir={dir}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200/50 p-6 text-right animate-scaleIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800">
                {locale === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
              </h3>
              <button
                onClick={() => setCancelOrderId(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-600">
                {locale === 'ar' 
                  ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ يرجى كتابة سبب الإلغاء:' 
                  : 'Are you sure you want to cancel this order? Please enter the cancellation reason:'}
              </p>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: العميل غير رأيه، خطأ في البيانات...' : 'e.g. Customer changed mind, incorrect data...'}
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs font-bold bg-white text-slate-800"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isCancelling || !cancelReason.trim()}
                onClick={handleConfirmCancelOrder}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{locale === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...'}</span>
                  </>
                ) : (
                  <>
                    <CloseIcon className="w-3.5 h-3.5" />
                    <span>{locale === 'ar' ? 'إلغاء الطلب نهائياً' : 'Cancel Order'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCancelOrderId(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
              >
                {locale === 'ar' ? 'التراجع' : 'Keep Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
