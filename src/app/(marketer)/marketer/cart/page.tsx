'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { useCartStore } from '@/features/cart/store/cartStore';
import { orderService } from '@/features/orders/api/orderService';
import { CartItemDto } from '@/shared/types/cart';
import { env } from '@/shared/config/env';
import { toast } from 'react-hot-toast';
import { TrashIcon, CartIcon } from '@/shared/components/Icons';


export default function CartPage() {
  const { locale, dir } = useLocale();
  const { cart, loading, error, fetchCart, updateQty, removeItem, clearCart } = useCartStore();

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = env.apiUrl.replace(/\/api$/, '');
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${apiBase}/${cleanUrl}`;
  };

  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [notes, setNotes] = useState('');
  const [marketerNotes, setMarketerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [governorates, setGovernorates] = useState<{ id: number; name: string; nameAr: string }[]>([]);

  useEffect(() => {
    fetchCart();
    orderService.getGovernorates().then((res) => {
      if (res.success && res.data) {
        setGovernorates(res.data);
      }
    });
  }, [fetchCart]);

  const activeItems: CartItemDto[] = cart?.items || [];

  const totalWholesaleCost = activeItems.reduce((sum, item) => sum + (item.productCostPrice * item.quantity), 0);
  const totalSellingPrice = activeItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
  const totalProfit = Math.max(0, totalSellingPrice - totalWholesaleCost);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeItems.length === 0) return;
    if (!customerName || !customerPhone || !street || !city || !state) {
      toast.error(locale === 'ar' ? 'يرجى ملء جميع حقول العميل' : 'Please fill all customer fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload = activeItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.productPrice,
      }));

      let combinedNotes = notes;
      if (marketerNotes.trim()) {
        const marketerPrefix = locale === 'ar' ? 'مصدر المسوق: ' : 'Marketer Source: ';
        combinedNotes = combinedNotes
          ? `${combinedNotes}\n\n[${marketerPrefix}${marketerNotes.trim()}]`
          : `[${marketerPrefix}${marketerNotes.trim()}]`;
      }

      const res = await orderService.create({
        customerName,
        customerPhone,
        shippingAddress: {
          street,
          city,
          state,
          postalCode: '12345',
          country: locale === 'ar' ? 'مصر' : 'Egypt',
        },
        items: itemsPayload,
        notes: combinedNotes || undefined,
      });

      if (res.success) {
        toast.success(locale === 'ar' ? 'تم إنشاء الطلب وتأكيده للشحن!' : 'Order created and shipped successfully!');
        setOrderSuccess(locale === 'ar' ? `تم إنشاء الطلب بنجاح برقم: #${res.data?.id}` : `Order created successfully: #${res.data?.id}`);
        clearCart();
        setNotes('');
        setMarketerNotes('');
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل إتمام الطلب' : 'Failed to submit order'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ أثناء إتمام الطلب: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-l from-slate-900 via-slate-800 to-primary bg-clip-text text-transparent">
            {locale === 'ar' ? 'سلة المشتريات والطلبات' : 'Shopping Cart'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
            {locale === 'ar' ? 'راجع تفاصيل سلتك، حدد هامش ربحك، وأدخل بيانات العميل لإتمام شحن الطلب.' : 'Review cart items, check profit margins, and place order.'}
          </p>
        </div>
        {activeItems.length > 0 && (
          <button
            onClick={() => {
              if (confirm(locale === 'ar' ? 'هل أنت متأكد من تفريغ السلة؟' : 'Are you sure you want to empty the cart?')) {
                clearCart();
                toast.success(locale === 'ar' ? 'تم تفريغ السلة بنجاح!' : 'Cart cleared successfully!');
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100 flex items-center gap-1.5 cursor-pointer"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'تفرغ السلة بالكامل' : 'Clear All'}</span>
          </button>
        )}
      </div>

      {orderSuccess ? (
        <div className="p-10 sm:p-12 text-center space-y-6 bg-gradient-to-b from-emerald-50/50 to-emerald-50 rounded-3xl border border-emerald-100 max-w-xl mx-auto shadow-xl shadow-emerald-500/5 animate-scaleUp">
          <div className="flex justify-center mb-2">
            <svg className="w-16 h-16 text-emerald-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800">{locale === 'ar' ? 'تم تقديم طلبك بنجاح!' : 'Order Placed!'}</h3>
          <p className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100/50 py-2.5 px-4 rounded-2xl border border-emerald-200/50 inline-block">{orderSuccess}</p>
          <div className="pt-4 flex gap-4 justify-center">
            <Link href="/marketer/products" className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all">
              {locale === 'ar' ? 'متابعة التسوق' : 'Browse Catalog'}
            </Link>
            <Link href="/marketer/orders" className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm transition-all">
              {locale === 'ar' ? 'تتبع طلباتي' : 'Track Orders'}
            </Link>
          </div>
        </div>
      ) : activeItems.length === 0 ? (
        <div className="text-center py-20 sm:py-24 bg-white rounded-3xl border border-slate-200 space-y-5 shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-inner">
            <CartIcon className="w-10 h-10" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800">{locale === 'ar' ? 'سلتك فارغة حالياً' : 'Your cart is empty'}</h3>
          <p className="text-slate-400 text-xs sm:text-sm font-bold max-w-sm mx-auto leading-relaxed">{locale === 'ar' ? 'تصفح كتالوج المنتجات وابدأ في إضافة المنتجات لتحديد أسعار بيعها وتأكيد طلباتك.' : 'Go to catalog and configure items.'}</p>
          <div className="pt-3">
            <Link href="/marketer/products" className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all inline-block">
              {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Catalog'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Cart Items list */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-right">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{activeItems.length} {locale === 'ar' ? 'منتجات' : 'items'}</span>
                <h3 className="font-black text-slate-800 text-sm">{locale === 'ar' ? 'عناصر السلة' : 'Items'}</h3>
              </div>

              <div className="divide-y divide-slate-100 text-right">
                {activeItems.map((item) => {
                  const profit = (item.productPrice - item.productCostPrice) * item.quantity;
                  return (
                    <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center hover:bg-slate-50/30 transition-all">
                      <div className="flex gap-4 items-center flex-1 text-right">
                        <div className="w-12 h-12 rounded-2xl border border-slate-200 overflow-hidden shadow-inner shrink-0 relative bg-slate-50 flex items-center justify-center">
                          {item.productPhotoUrl ? (
                            <img
                              src={getImageUrl(item.productPhotoUrl)}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <h4 className="font-black text-slate-800 text-sm sm:text-base line-clamp-1">
                            {item.productName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-bold">
                            {item.variantSku && (
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200 text-[9px] sm:text-[10px]">
                                {locale === 'ar' ? `الرمز: ${item.variantSku}` : `SKU: ${item.variantSku}`}
                              </span>
                            )}
                            <span className="bg-amber-50/70 text-amber-700 border border-amber-100/50 px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px]">
                              {locale === 'ar' ? `التكلفة: ${item.productCostPrice} ج.م` : `Cost: ${item.productCostPrice}`}
                            </span>
                            <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px]">
                              {locale === 'ar' ? `سعر البيع: ${item.productPrice} ج.م` : `Price: ${item.productPrice}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row-reverse items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t border-slate-100 sm:border-t-0 pt-4 sm:pt-0">
                        {/* Qty selectors */}
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-9 bg-white shadow-sm shrink-0">
                          <button
                            onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                            className="px-3 h-full hover:bg-slate-50 text-slate-500 font-black text-sm transition-all"
                          >
                            -
                          </button>
                          <span className="px-3 font-extrabold text-xs text-slate-800 w-10 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="px-3 h-full hover:bg-slate-50 text-slate-500 font-black text-sm transition-all"
                          >
                            +
                          </button>
                        </div>

                        {/* Calculated commission */}
                        <div className="text-right shrink-0 bg-emerald-50/50 border border-emerald-100 px-3.5 py-1.5 rounded-2xl min-w-[90px] sm:min-w-[100px]">
                          <span className="text-[9px] sm:text-[10px] text-slate-400 block font-bold">{locale === 'ar' ? 'ربحك المقدر' : 'Profit'}</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-600">
                            +{profit.toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                          </span>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={async () => {
                            await removeItem(item.id);
                            toast.success(locale === 'ar' ? 'تم حذف العنصر من السلة' : 'Item removed from cart');
                          }}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all shrink-0"
                          title={locale === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pricing breakdown and Checkout Form */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 text-right shadow-xl shadow-slate-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-xl pointer-events-none" />
              <h4 className="font-black text-xs text-slate-400 uppercase tracking-wider">{locale === 'ar' ? 'ملخص الأرباح والعمولات' : 'Earnings Summary'}</h4>
              
              <div className="space-y-2.5 border-b border-white/10 pb-4 text-xs font-extrabold text-slate-300">
                <div className="flex justify-between">
                  <span>{totalSellingPrice.toLocaleString()} ج.م</span>
                  <span>{locale === 'ar' ? 'قيمة البيع الكلية:' : 'Total sales:'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{totalWholesaleCost.toLocaleString()} ج.م</span>
                  <span>{locale === 'ar' ? 'سعر الجملة الكلي:' : 'Wholesale cost:'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-2xl font-black text-emerald-400">+{totalProfit.toLocaleString()} ج.م</span>
                <span className="text-sm font-black text-white">{locale === 'ar' ? 'أرباحك الصافية:' : 'Net commission:'}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-right shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-2">
                <span className="text-xl">📋</span>
                <h4 className="font-black text-slate-800 text-base">{locale === 'ar' ? 'بيانات شحن العميل' : 'Customer Info'}</h4>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'اسم العميل ثلاثي:' : 'Customer Name:'}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={locale === 'ar' ? 'مثال: محمد أحمد علي' : 'Full Name'}
                    className="w-full text-right p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-xs font-bold transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: 01012345678' : '01xxxxxxxxx'}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-xs font-bold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'المحافظة:' : 'State/Governorate:'}</label>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-xs font-bold bg-white cursor-pointer transition-all"
                >
                  <option value="">{locale === 'ar' ? '-- اختر المحافظة --' : '-- Choose Governorate --'}</option>
                  {governorates.map((gov) => (
                    <option key={gov.id} value={gov.name}>
                      {locale === 'ar' ? gov.nameAr : gov.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'المدينة / الحي:' : 'City:'}</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: مصر الجديدة' : 'Heliopolis'}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-xs font-bold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'العنوان بالتفصيل:' : 'Detailed Address:'}</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: شارع الثورة، عمارة 5، شقة 2' : 'Street name, building, floor'}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-xs font-bold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600">
                  {locale === 'ar' ? 'صفحة / متجر المسوق (اختياري):' : 'Marketer Page / Store (Optional):'}
                </label>
                <input
                  type="text"
                  value={marketerNotes}
                  onChange={(e) => setMarketerNotes(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: صفحة فيسبوك أو اسم متجرك لمساعدة المشرف أثناء تأكيد الطلب' : 'e.g. Facebook page name or link to help supervisors confirm orders'}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-xs font-bold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'ملاحظات إضافية (اختياري):' : 'Additional Notes (Optional):'}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: التسليم بعد الساعة 5 مساءً، أو أي تفاصيل خاصة بالشحن' : 'e.g. Delivery after 5 PM, or specific shipping details'}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none text-xs font-bold transition-all min-h-[80px]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary text-white font-extrabold text-sm shadow-md hover:shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{locale === 'ar' ? 'جاري إتمام الطلب...' : 'Processing...'}</span>
                  </>
                ) : (
                  <span>✅ {locale === 'ar' ? 'تأكيد وإرسال الطلب للشحن' : 'Submit & Ship Order'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
