'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { orderService } from '@/features/orders/api/orderService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { OrderDto, OrderStatus } from '@/shared/types/order';
import { toast } from 'react-hot-toast';
import Pagination from '@/shared/components/Pagination';
import {
  PlusIcon,
  SearchIcon,
  CloseIcon,
  FileIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  TruckIcon,
  EyeIcon,
  NotesIcon,
  MegaphoneIcon,
  ShieldIcon,
  WalletIcon,
  CheckIcon,
  CheckCircleIcon,
  PackageIcon,
  EditIcon
} from '@/shared/components/Icons';

export default function AdminOrdersPage() {
  const { locale, dir } = useLocale();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'Supervisor';
  const isAdmin = user?.role === 'Admin';
  const isSupplier = user?.role === 'Supplier';

  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Supervisor tabs: 'available' = unconfirmed orders, 'my' = supervisor's own orders
  const [supervisorTab, setSupervisorTab] = useState<'available' | 'my'>('available');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [editingNoteOrderId, setEditingNoteOrderId] = useState<number | null>(null);
  const [tempNoteValue, setTempNoteValue] = useState('');
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPage = parseInt(params.get('page') || '1', 10) || 1;
    if (urlPage !== 1) {
      setCurrentPage(urlPage);
    }
    setMounted(true);
  }, []);

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
      let res;
      if (isSupervisor) {
        if (supervisorTab === 'available') {
          // Unassigned pending orders for any supervisor to claim
          res = await orderService.getAll(undefined, undefined, searchQuery || undefined, currentPage, pageSize, undefined, true);
        } else {
          // Orders already assigned to this supervisor
          res = await orderService.getMyOrders(statusFilter || undefined, searchQuery || undefined, currentPage, pageSize);
        }
      } else if (isSupplier && user) {
        // Supplier: only confirmed orders containing products of this supplier
        res = await orderService.getAll(undefined, statusFilter || undefined, searchQuery || undefined, currentPage, pageSize, undefined, undefined, user.id);
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
    setStatusFilter('');
  }, [supervisorTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadOrders();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [user, searchQuery, statusFilter, currentPage, supervisorTab]);

  const handleUpdateNotes = async (orderId: number) => {
    setIsUpdatingNote(true);
    try {
      const res = await orderService.updateNotes(orderId, tempNoteValue);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تحديث الملاحظات بنجاح' : 'Notes updated successfully');
        setEditingNoteOrderId(null);
        await loadOrders();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تحديث الملاحظات' : 'Failed to update notes'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const handleConfirmOrder = async (id: number) => {
    setActionLoadingId(id);
    try {
      const res = await orderService.updateStatus(id, OrderStatus.Confirmed);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تأكيد الطلب وتحويله لطلباتك' : 'Order confirmed and assigned to you');
        await loadOrders();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تأكيد الطلب' : 'Failed to confirm order'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateStatus = async (id: number, status: OrderStatus, reason?: string) => {
    setActionLoadingId(id);
    try {
      const res = await orderService.updateStatus(id, status, reason);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تحديث حالة الطلب بنجاح' : 'Order status updated successfully');
        await loadOrders();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update order status'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return locale === 'ar' ? 'قيد الانتظار' : 'Pending';
      case OrderStatus.Confirmed: return locale === 'ar' ? 'تم التأكيد' : 'Confirmed';
      case OrderStatus.Shipped: return locale === 'ar' ? 'جاري الشحن' : 'Shipped';
      case OrderStatus.Delivered: return locale === 'ar' ? 'تم التوصيل' : 'Delivered';
      case OrderStatus.Cancelled: return locale === 'ar' ? 'ملغي' : 'Cancelled';
      case OrderStatus.ConfirmationFailed: return locale === 'ar' ? 'فشل التأكيد' : 'Confirmation Failed';
      case OrderStatus.DeliveryFailed: return locale === 'ar' ? 'فشل التوصيل' : 'Delivery Failed';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Delivered: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case OrderStatus.Cancelled: return 'bg-rose-50 text-rose-700 border-rose-200';
      case OrderStatus.Pending: return 'bg-amber-50 text-amber-700 border-amber-200';
      case OrderStatus.Confirmed: return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatus.Shipped: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case OrderStatus.ConfirmationFailed: return 'bg-red-50 text-red-700 border-red-200';
      case OrderStatus.DeliveryFailed: return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-8 animate-pulse" dir={dir}>
        <div className="h-10 bg-slate-100 rounded-2xl w-1/2" />
        <div className="h-4 bg-slate-100 rounded-xl w-2/3" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          {locale === 'ar' ? 'طلبات الشحن والتسليم' : 'Shipping Orders'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {isSupervisor
            ? (locale === 'ar' ? 'اختر طلبات للتأكيد أو راجع طلباتك المُعيَّنة' : 'Pick orders to confirm or review your assigned orders')
            : isSupplier
            ? (locale === 'ar' ? 'استعرض طلبات الشحن المؤكدة التي تحتوي على منتجاتك لتجهيزها للشحن والتسليم.' : 'View confirmed shipping orders containing your products.')
            : (locale === 'ar' ? 'راجع تفاصيل طلبات الشحن المرسلة من المسوقين، غير حالة الطلب لتأكيد الشحن والتسليم للعميل.' : 'View dropshipping orders and update logistics statuses.')}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden text-right">
        {/* Header bar: Tabs for supervisors, or status/search for admin */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
          {isSupervisor ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              {/* Supervisor tabs */}
              <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 w-fit shrink-0">
                <button
                  type="button"
                  onClick={() => { setSupervisorTab('available'); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    supervisorTab === 'available'
                      ? 'bg-white text-primary shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileIcon className="w-3.5 h-3.5" />
                  <span>{locale === 'ar' ? 'الطلبات المتاحة' : 'Available Orders'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSupervisorTab('my'); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    supervisorTab === 'my'
                      ? 'bg-white text-primary shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  <span>{locale === 'ar' ? 'طلباتي المُعيَّنة' : 'My Assigned Orders'}</span>
                </button>
              </div>

              {/* Search & Status Filter for supervisor */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {supervisorTab === 'my' && (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-right px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-full sm:w-auto"
                  >
                    <option value="">{locale === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
                    <option value="Confirmed">{locale === 'ar' ? 'تم التأكيد' : 'Confirmed'}</option>
                    <option value="Shipped">{locale === 'ar' ? 'جاري الشحن' : 'Shipped'}</option>
                    <option value="Delivered">{locale === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                    <option value="Cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                    <option value="ConfirmationFailed">{locale === 'ar' ? 'فشل التأكيد' : 'Confirmation Failed'}</option>
                    <option value="DeliveryFailed">{locale === 'ar' ? 'فشل التوصيل' : 'Delivery Failed'}</option>
                  </select>
                )}

                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <SearchIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'ابحث برقم الطلب، اسم العميل...' : 'Search by order ID, customer...'}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full text-right pr-9 pl-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="font-black text-slate-800 text-sm shrink-0">
                {isSupplier
                  ? (locale === 'ar' ? 'طلباتي المؤكدة' : 'My Confirmed Orders')
                  : (locale === 'ar' ? 'كل طلبات المنصة' : 'All Platform Orders')}
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
                  <option value="ConfirmationFailed">{locale === 'ar' ? 'فشل التأكيد' : 'Confirmation Failed'}</option>
                  <option value="DeliveryFailed">{locale === 'ar' ? 'فشل التوصيل' : 'Delivery Failed'}</option>
                </select>

                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <SearchIcon className="w-4 h-4" />
                  </span>
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

        {isLoading && orders.length === 0 ? (
          <div className="p-6 text-center text-sm font-bold text-slate-400 animate-pulse">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {searchQuery
              ? (locale === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matches found for your search')
              : isSupervisor && supervisorTab === 'available'
              ? (locale === 'ar' ? 'لا توجد طلبات متاحة للتأكيد حالياً' : 'No available orders to confirm at the moment')
              : isSupervisor && supervisorTab === 'my'
              ? (locale === 'ar' ? 'لا توجد طلبات مُعيَّنة لك بعد' : 'No orders assigned to you yet')
              : (locale === 'ar' ? 'لا توجد طلبات حالياً' : 'No orders found')}
          </div>
        ) : (
          <div className={`divide-y divide-slate-100 transition-opacity duration-200 ${isLoading ? 'opacity-65 pointer-events-none' : ''}`}>
            {orders.map((order) => (
              <div key={order.id} className="p-5 sm:p-6 flex flex-col justify-between items-stretch gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1.5 flex-1 text-right">
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                        <span>{order.createdTime ? new Date(order.createdTime).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-sm font-black text-slate-900">{locale === 'ar' ? 'الطلب' : 'Order'} #{order.id}</span>
                    </div>
                    {!isSupplier && (
                      <>
                        <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 flex-wrap justify-end">
                          <span>{order.customerPhone}</span>
                          <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-300">|</span>
                          <span>{locale === 'ar' ? 'العميل:' : 'Customer:'} {order.customerName}</span>
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        </p>
                        <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 flex-wrap justify-end">
                          <span>{locale === 'ar' ? 'العنوان:' : 'Address:'} {order.shippingAddress?.street}، {order.shippingAddress?.city}، {order.shippingAddress?.state}</span>
                          <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                        </p>
                      </>
                    )}
                    {order.supplierName && (isAdmin || isSupervisor) && (
                      <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 flex-wrap justify-end">
                        {order.supplierPhone && (
                          <>
                            <span>{order.supplierPhone}</span>
                            <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-300">|</span>
                          </>
                        )}
                        <span>{locale === 'ar' ? 'المورد:' : 'Supplier:'} {order.supplierName}</span>
                        <span>🏪</span>
                      </p>
                    )}
                    {!isSupplier && order.marketerName && (
                      <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 flex-wrap justify-end">
                        <span>{locale === 'ar' ? 'المسوق:' : 'Marketer:'} {order.marketerName}</span>
                        <MegaphoneIcon className="w-3.5 h-3.5 text-slate-400" />
                      </p>
                    )}
                    {editingNoteOrderId === order.id ? (
                      <div className="mt-2 space-y-2 max-w-md ml-auto">
                        <textarea
                          value={tempNoteValue}
                          onChange={(e) => setTempNoteValue(e.target.value)}
                          className="w-full text-right p-2 rounded-xl border border-slate-200 focus:border-primary focus:outline-none text-xs font-bold transition-all min-h-[60px] bg-slate-50"
                          placeholder={locale === 'ar' ? 'أدخل ملاحظات الطلب...' : 'Enter order notes...'}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            disabled={isUpdatingNote}
                            onClick={() => handleUpdateNotes(order.id)}
                            className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-extrabold cursor-pointer hover:bg-primary/95 transition-all"
                          >
                            {isUpdatingNote ? '...' : (locale === 'ar' ? 'حفظ' : 'Save')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNoteOrderId(null)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-extrabold cursor-pointer transition-all"
                          >
                            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group flex-wrap justify-end">
                        {isSupervisor && order.supervisorId === user?.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteOrderId(order.id);
                              setTempNoteValue(order.notes || '');
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-extrabold mt-1.5 hover:underline flex items-center gap-1 cursor-pointer bg-blue-50/50 hover:bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100/50"
                          >
                            <span>{locale === 'ar' ? 'تعديل' : 'Edit'}</span>
                            <EditIcon className="w-3 h-3" />
                          </button>
                        )}
                        {order.notes ? (
                          <p className="text-xs text-amber-600 bg-amber-50 p-1.5 rounded-lg border border-amber-100 mt-1.5 font-bold flex items-center gap-1 w-fit">
                            <span>{locale === 'ar' ? 'ملاحظات: ' : 'Notes: '} {order.notes}</span>
                            <NotesIcon className="w-3.5 h-3.5 text-amber-500" />
                          </p>
                        ) : (
                          isSupervisor && order.supervisorId === user?.id && (
                            <p className="text-xs text-slate-400 italic mt-1.5 font-medium flex items-center gap-1 w-fit">
                              <span>{locale === 'ar' ? 'لا توجد ملاحظات' : 'No notes'}</span>
                              <NotesIcon className="w-3.5 h-3.5 text-slate-400" />
                            </p>
                          )
                        )}
                      </div>
                    )}
                    {order.cancellationReason && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-100 mt-1.5 font-bold flex items-center gap-1 w-fit ml-auto">
                        <span>{locale === 'ar' ? 'سبب الإلغاء/الفشل: ' : 'Reason: '} {order.cancellationReason}</span>
                        <CloseIcon className="w-3.5 h-3.5 text-rose-500" />
                      </p>
                    )}
                    {/* Show supervisor name for admin */}
                    {isAdmin && (
                      <div className="text-xs font-bold flex items-center gap-1 justify-end mt-1.5">
                        {order.supervisorName ? (
                          <>
                            <span className="text-indigo-600">{locale === 'ar' ? 'المشرف المسؤول:' : 'Assigned Supervisor:'} {order.supervisorName}</span>
                            <ShieldIcon className="w-3.5 h-3.5 text-indigo-600" />
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400">{locale === 'ar' ? 'المشرف: غير معين بعد' : 'Supervisor: Not yet assigned'}</span>
                            <ShieldIcon className="w-3.5 h-3.5 text-slate-400" />
                          </>
                        )}
                      </div>
                    )}
                    {!isSupplier && (
                      <p className="text-xs font-black text-emerald-600 flex items-center gap-1 justify-end mt-1.5">
                        <span>{locale === 'ar' ? 'عمولة المسوق:' : 'Commission:'} {order.commission} ج.م | {locale === 'ar' ? 'القيمة الكلية:' : 'Total:'} {order.totalAmount} ج.م</span>
                        <WalletIcon className="w-3.5 h-3.5 text-emerald-600" />
                      </p>
                    )}
                  </div>

                  {/* Status action controllers */}
                  <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto shrink-0">
                    {/* Supervisor: confirm pending orders in "available" tab */}
                    {isSupervisor && supervisorTab === 'available' && order.status === OrderStatus.Pending && (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={actionLoadingId !== null}
                          onClick={() => handleConfirmOrder(order.id)}
                          className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-black cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {actionLoadingId === order.id ? (
                            <>
                              <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                              {locale === 'ar' ? 'جاري التأكيد...' : 'Confirming...'}
                            </>
                          ) : (
                            <>
                              <span>{locale === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'}</span>
                              <CheckIcon className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId !== null}
                          onClick={() => {
                            const reason = prompt(locale === 'ar' ? 'الرجاء إدخال سبب فشل التأكيد:' : 'Please enter confirmation failure reason:');
                            if (reason !== null) {
                              handleUpdateStatus(order.id, OrderStatus.ConfirmationFailed, reason || undefined);
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-black cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <CloseIcon className="w-3.5 h-3.5" />
                          <span>{locale === 'ar' ? 'فشل التأكيد' : 'Failed Confirmation'}</span>
                        </button>
                      </div>
                    )}
                    {/* Supervisor: update status in "my" tab */}
                    {isSupervisor && supervisorTab === 'my' && (
                      <div className="flex gap-2 flex-wrap">
                        {order.status === OrderStatus.Confirmed && (
                          <button
                            type="button"
                            disabled={actionLoadingId !== null}
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Shipped)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-black cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {actionLoadingId === order.id ? (
                              <>
                                <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                                {locale === 'ar' ? 'جاري الشحن...' : 'Shipping...'}
                              </>
                            ) : (
                              <>
                                <span>{locale === 'ar' ? 'شحن الطلب' : 'Ship Order'}</span>
                                <TruckIcon className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                        {order.status === OrderStatus.Shipped && (
                          <>
                            <button
                              type="button"
                              disabled={actionLoadingId !== null}
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.Delivered)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-black cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              {actionLoadingId === order.id ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                                  {locale === 'ar' ? 'جاري التوصيل...' : 'Delivering...'}
                                </>
                              ) : (
                                <>
                                  <span>{locale === 'ar' ? 'تم التوصيل' : 'Mark Delivered'}</span>
                                  <CheckCircleIcon className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={actionLoadingId !== null}
                              onClick={() => {
                                const reason = prompt(locale === 'ar' ? 'الرجاء إدخال سبب فشل التوصيل:' : 'Please enter delivery failure reason:');
                                if (reason !== null) {
                                  handleUpdateStatus(order.id, OrderStatus.DeliveryFailed, reason || undefined);
                                }
                              }}
                              className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-black cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              <CloseIcon className="w-3.5 h-3.5" />
                              <span>{locale === 'ar' ? 'فشل التوصيل' : 'Delivery Failed'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {/* Non-supervisor (Admin/Supplier): read-only view */}
                    {!isSupervisor && (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black border border-slate-200 bg-slate-50 text-slate-400 flex items-center gap-1">
                        <span>{locale === 'ar' ? 'عرض فقط' : 'View Only'}</span>
                        <EyeIcon className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 justify-end">
                      <span>{locale === 'ar' ? 'المنتجات المطلوبة:' : 'Requested Products:'}</span>
                      <PackageIcon className="w-3.5 h-3.5 text-slate-400" />
                    </span>
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
                            {!isSupplier && (
                              <>
                                <div className="flex justify-end gap-2">
                                  <span className="text-slate-400">{locale === 'ar' ? 'السعر الأساسي:' : 'Base Price:'}</span>
                                  <span className="text-emerald-600">{((item.unitPrice || 0) - (item.unitProfit || 0)).toLocaleString()} ج.م</span>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <span className="text-slate-400">{locale === 'ar' ? 'سعر البيع:' : 'Sell Price:'}</span>
                                  <span className="text-slate-700">{(item.unitPrice || 0).toLocaleString()} ج.م</span>
                                </div>
                              </>
                            )}
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
