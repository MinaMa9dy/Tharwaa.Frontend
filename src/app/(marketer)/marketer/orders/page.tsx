'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { orderService } from '@/features/orders/api/orderService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { OrderDto, OrderStatus } from '@/shared/types/order';

export default function MarketerOrdersPage() {
  const { locale, dir } = useLocale();
  const { user, initialize } = useAuthStore();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getMyOrders(undefined, undefined, currentPage, pageSize);
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
    if (user) {
      loadOrders();
    }
  }, [user, currentPage]);

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
    }
  };

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
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
        >
          {locale === 'ar' ? '➕ تسويق منتج جديد' : '➕ Market New Product'}
        </Link>
      </div>

      {isLoading ? (
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
          <span className="text-5xl">📄</span>
          <h3 className="text-lg font-black text-slate-700">{locale === 'ar' ? 'لا توجد طلبات مسجلة بعد' : 'No orders recorded yet'}</h3>
          <p className="text-slate-400 text-sm font-bold">{locale === 'ar' ? 'ابدأ بتسويق المنتجات وتسجيل أول طلب لعميلك.' : 'Place your first order to get started.'}</p>
        </div>
      ) : (
        <div className="space-y-6">
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
                    {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 border-b md:border-b-0 md:border-l border-slate-100 pb-4 md:pb-0 md:pl-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'بيانات العميل' : 'Customer'}</h4>
                  <div className="space-y-1 text-sm font-bold text-slate-700">
                    <p className="text-slate-900 font-black">{order.customerName}</p>
                    <p>📱 {order.customerPhone}</p>
                    <p>📍 {order.shippingAddress.street}، {order.shippingAddress.city}، {order.shippingAddress.state}</p>
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
            <div className="flex items-center justify-center gap-4 p-6 border border-slate-200 bg-white rounded-3xl shadow-sm">
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
      )}
    </div>
  );
}
