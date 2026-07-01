'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { useWishlistStore } from '@/features/wishlist/store/wishlistStore';
import { TrashIcon, SearchIcon } from '@/shared/components/Icons';
import { env } from '@/shared/config/env';
import { toast } from 'react-hot-toast';

export default function WishlistPage() {
  const { locale, dir } = useLocale();
  const { wishlist, fetchWishlist, loading, removeItem } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = env.apiUrl.replace(/\/api$/, '');
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${apiBase}/${cleanUrl}`;
  };

  const handleRemove = async (id: number) => {
    try {
      await removeItem(id);
      toast.success(locale === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from wishlist');
    } catch {
      toast.error(locale === 'ar' ? 'فشل إزالة المنتج' : 'Failed to remove item');
    }
  };

  const items = wishlist || [];

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      {/* Page Header */}
      <div className="text-right border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight">
          {locale === 'ar' ? 'المنتجات المفضلة' : 'My Wishlist'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {locale === 'ar'
            ? 'تصفح واحفظ المنتجات التي تود تسويقها لاحقاً.'
            : 'Access the list of products you saved to market later.'}
        </p>
      </div>

      {loading && items.length === 0 ? (
        // Loading skeleton grid
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3 sm:p-5 space-y-3 sm:space-y-4 animate-pulse">
              <div className="aspect-square w-full rounded-xl sm:rounded-2xl bg-slate-100" />
              <div className="h-4 bg-slate-100 rounded w-2/3 mr-auto" />
              <div className="h-6 bg-slate-100 rounded w-1/3 mr-auto" />
              <div className="h-8 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        // Empty State
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 space-y-5">
          <span className="text-5xl block animate-bounce">❤️</span>
          <h3 className="text-lg font-black text-slate-700">
            {locale === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
          </h3>
          <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto">
            {locale === 'ar'
              ? 'تصفح الكتالوج وقم بإضافة المنتجات التي تنال إعجابك للوصول السريع إليها.'
              : 'Browse products and click the heart icon to save products here.'}
          </p>
          <Link
            href="/marketer/products"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary/95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all hover:-translate-y-0.5"
          >
            {locale === 'ar' ? 'تصفح المنتجات الآن' : 'Browse Products Now'}
          </Link>
        </div>
      ) : (
        // Grid display
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-primary/30 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 relative text-right"
            >
              {/* Image & Delete Button */}
              <div className="relative block">
                <Link href={`/products/${item.productId}`} className="block w-full">
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl select-none">
                        📦
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-3 right-3 z-10 w-8.5 h-8.5 bg-white/95 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 border border-slate-100/50"
                  title={locale === 'ar' ? 'إزالة' : 'Remove'}
                >
                  <TrashIcon className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <Link href={`/products/${item.productId}`} className="block group">
                    <span className="text-[9px] sm:text-[10px] font-black text-primary/80 uppercase">
                      {locale === 'ar' ? 'منتج مفضل' : 'Wishlist Item'}
                    </span>
                    <h3 className="text-xs sm:text-base font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                      {item.productName}
                    </h3>
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 sm:pt-3">
                    <div className="flex flex-col text-right w-full">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">
                        {locale === 'ar' ? 'سعر الجملة' : 'Wholesale price'}
                      </span>
                      <span className="text-sm sm:text-base font-black text-slate-800">
                        {item.productPrice} {locale === 'ar' ? 'ج.م' : 'EGP'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/products/${item.productId}`}
                    className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 sm:gap-2 border border-transparent"
                  >
                    <SearchIcon className="w-4 h-4" />
                    <span>{locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
