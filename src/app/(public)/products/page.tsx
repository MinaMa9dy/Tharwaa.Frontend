'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/shared/context/LocaleContext';
import { productService } from '@/features/products/api/productService';
import { categoryService } from '@/features/categories/api/categoryService';
import { ProductDto, ProductParams } from '@/shared/types/product';
import { CategoryDto } from '@/shared/types/category';
import { useAuthStore } from '@/features/auth/store/authStore';
import Pagination from '@/shared/components/Pagination';
import { toast } from 'react-hot-toast';
import { SearchIcon, CartIcon, CloseIcon, SparklesIcon } from '@/shared/components/Icons';
import { bannerService } from '@/features/banners/api/bannerService';
import { BannerDto } from '@/shared/types/banner';
import { env } from '@/shared/config/env';

const ALL_CATEGORY: CategoryDto = { id: 0, name: 'الكل', nameEn: 'All', isActive: true };

export default function PublicProductsPage() {
  const { locale, dir } = useLocale();
  const { user } = useAuthStore();
  const router = useRouter();

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<BannerDto[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isBannersLoading, setIsBannersLoading] = useState(true);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Variant selector / preview modal state
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mounted, setMounted] = useState(false);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const apiBase = env.apiUrl.replace(/\/api$/, '');
    const cleanUrl = path.startsWith('/') ? path.slice(1) : path;
    return `${apiBase}/${cleanUrl}`;
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 200;
      const modifier = dir === 'rtl' ? -1 : 1;
      categoriesRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount * modifier : -scrollAmount * modifier,
        behavior: 'smooth',
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove  = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd   = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setActiveBannerIndex((p) => (p + 1) % banners.length);
      else          setActiveBannerIndex((p) => (p === 0 ? banners.length - 1 : p - 1));
    }
    touchStartX.current = null;
    touchEndX.current   = null;
  };

  // Called when an unauthenticated user tries to order a product
  const handleOrderRequiresLogin = () => {
    toast(
      locale === 'ar'
        ? '🔐 يجب تسجيل الدخول لإتمام عملية الطلب'
        : '🔐 Please login to place an order',
      {
        duration: 3000,
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          fontWeight: '700',
          borderRadius: '14px',
          padding: '14px 20px',
        },
      }
    );
    setTimeout(() => {
      router.push('/login?redirect=/products');
    }, 1000);
  };

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleResize = () => setPageSize(window.innerWidth < 640 ? 6 : 12);
    handleResize();
    window.addEventListener('resize', handleResize);

    const urlPage = parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10) || 1;
    if (urlPage !== 1) setCurrentPage(urlPage);
    setMounted(true);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const urlPage = parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10) || 1;
      setCurrentPage(urlPage);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', currentPage.toString());
    window.history.pushState({}, '', url.toString());
  }, [currentPage, mounted]);

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, searchQuery]);

  // Load categories
  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.success && res.data) {
        setCategories([ALL_CATEGORY, ...res.data.filter((c) => c.isActive)]);
      } else {
        setCategories([ALL_CATEGORY]);
      }
    }).catch(() => setCategories([ALL_CATEGORY]));
  }, []);

  // Load banners
  useEffect(() => {
    setIsBannersLoading(true);
    bannerService.getAll().then((res) => {
      if (res.success && res.data) setBanners(res.data);
    }).catch(() => {}).finally(() => setIsBannersLoading(false));
  }, []);

  // Auto-play banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setActiveBannerIndex((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // Load products
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params: ProductParams = {
          pageSize,
          pageNumber: currentPage,
          categoryId: selectedCategory === 0 ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
        };
        const res = await productService.getAll(params);
        if (!active) return;
        if (res.success && res.data) {
          setProducts(res.data);
          setTotalPages(res.meta?.totalPages || 1);
        } else {
          setProducts([]);
          setTotalPages(1);
        }
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [selectedCategory, searchQuery, pageSize, currentPage]);

  if (!mounted) return null;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>

      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      {isBannersLoading ? (
        <div className="w-full aspect-[3/1] rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
      ) : banners.length > 0 ? (
        <div
          className="relative w-full aspect-[3/1] rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 group border border-slate-200"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full h-full relative">
            {banners.map((b, idx) => (
              <img
                key={b.id}
                src={getImageUrl(b.imageUrl)}
                alt={b.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  idx === activeBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              />
            ))}
          </div>
          {banners.length > 1 && (
            <>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeBannerIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => setActiveBannerIndex((p) => (p === 0 ? banners.length - 1 : p - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/40 hover:bg-slate-950/60 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 opacity-0 group-hover:opacity-100 shadow-md text-xs">
                ◀
              </button>
              <button type="button" onClick={() => setActiveBannerIndex((p) => (p + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/40 hover:bg-slate-950/60 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 opacity-0 group-hover:opacity-100 shadow-md text-xs">
                ▶
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white relative overflow-hidden shadow-xl shadow-emerald-500/10">
          <div className="relative z-10 space-y-3 sm:space-y-4 max-w-2xl text-right">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
              {locale === 'ar' ? 'الكتالوج التجاري' : 'Trading Catalog'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight">
              {locale === 'ar' ? 'ابدأ بيع وتجارة بدون رأس مال' : 'Start Selling Without Capital'}
            </h1>
            <p className="text-white/90 text-sm sm:text-base font-bold">
              {locale === 'ar'
                ? 'اختر المنتجات، حدد سعر البيع، واترك الشحن والتوصيل لـ ثروة.'
                : 'Choose products, set your price, and let Tharwa handle shipping and payouts.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Guest Login CTA Banner ───────────────────────────────────────────── */}
      {mounted && !user && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary/10 to-indigo-500/5 border border-primary/20 rounded-2xl p-4 sm:p-5">
          <div className="text-right sm:text-start space-y-0.5">
            <p className="font-black text-slate-800 text-sm">
              {locale === 'ar' ? '🚀 سجّل الآن وابدأ الربح مجاناً' : '🚀 Register now and start earning for free'}
            </p>
            <p className="text-xs text-slate-500 font-bold">
              {locale === 'ar'
                ? 'أنشئ حسابك لإضافة المنتجات وتحديد أسعارك وإتمام الطلبات.'
                : 'Create your account to configure products, set prices, and place orders.'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/login" className="px-4 py-2.5 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-all">
              {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Link>
            <Link href="/register" className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all">
              {locale === 'ar' ? 'إنشاء حساب' : 'Register Free'}
            </Link>
          </div>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        {/* Category Tabs */}
        <div className="flex-1 flex items-center gap-1.5 min-w-0 relative">
          <button type="button" onClick={() => scrollCategories('left')}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-all font-black text-xs shrink-0 cursor-pointer">
            ◀
          </button>
          <div ref={categoriesRef} className="flex-1 flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none min-w-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {locale === 'ar' ? cat.name : cat.nameEn || cat.name}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => scrollCategories('right')}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-all font-black text-xs shrink-0 cursor-pointer">
            ▶
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 md:shrink-0">
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            <SearchIcon className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={locale === 'ar' ? 'ابحث عن منتج...' : 'Search products...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all text-right"
          />
        </div>
      </div>

      {/* ── Products Grid ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-3 animate-pulse">
              <div className="aspect-square w-full rounded-xl bg-slate-100" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-6 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-4">
          <span className="text-4xl">📦</span>
          <h3 className="text-lg font-black text-slate-700">
            {locale === 'ar' ? 'لا توجد منتجات مطابقة' : 'No products found'}
          </h3>
          <p className="text-slate-400 text-sm font-semibold">
            {locale === 'ar' ? 'جرب البحث بكلمة أخرى أو تصفح أقسام أخرى.' : 'Try a different search or category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((prod) => {
            const mainImg = prod.files.find((f) => f.isMain)?.url || prod.files[0]?.url || '';
            return (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-primary/30 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <button
                  onClick={() => setSelectedProduct(prod)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    {mainImg ? (
                      <img
                        src={getImageUrl(mainImg)}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">📦</div>
                    )}
                  </div>
                </button>

                {/* Info */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 text-right">
                  <div className="space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-black text-primary/80 uppercase">
                      {prod.categoryName || (locale === 'ar' ? 'تصنيف عام' : 'General')}
                    </span>
                    <h3 className="text-xs sm:text-base font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 sm:pt-3">
                      <div className="flex flex-col text-right w-full">
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">
                          {locale === 'ar' ? 'سعر الجملة' : 'Wholesale price'}
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-800">
                          {prod.price} {locale === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                    </div>

                    {mounted && user ? (
                      // Logged-in: redirect to marketer products for full cart experience
                      <Link
                        href="/marketer/products"
                        className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <CartIcon className="w-4 h-4" />
                        <span>{locale === 'ar' ? 'إضافة وتحديد السعر' : 'Configure & Add'}</span>
                      </Link>
                    ) : (
                      // Guest: show login prompt
                      <button
                        onClick={handleOrderRequiresLogin}
                        className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[10px] sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer"
                      >
                        <span>🔐</span>
                        <span>{locale === 'ar' ? 'سجّل للطلب' : 'Login to Order'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {!isLoading && products.length > 0 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* ── Product Preview Modal ────────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200/50 text-right">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">
                {locale === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Product summary */}
              <div className="flex gap-4">
                {selectedProduct.files && selectedProduct.files[0]?.url ? (
                  <img
                    src={getImageUrl(selectedProduct.files[0]?.url)}
                    alt={selectedProduct.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 text-3xl border border-slate-200 shrink-0 select-none">
                    📦
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h4 className="font-black text-slate-800 text-base">{selectedProduct.name}</h4>
                  <p className="text-xs text-slate-400 font-bold line-clamp-3">{selectedProduct.description}</p>
                  <p className="text-sm font-black text-primary">
                    {locale === 'ar' ? `سعر الجملة: ${selectedProduct.price} ج.م` : `Wholesale: ${selectedProduct.price} EGP`}
                  </p>
                  {(() => {
                    const lowestPrices = (selectedProduct.productVariants || []).map(v => v.lowestPriceToSell || 0).filter(p => p > 0);
                    const minLowestPrice = lowestPrices.length > 0 ? Math.min(...lowestPrices) : 0;
                    const maxLowestPrice = lowestPrices.length > 0 ? Math.max(...lowestPrices) : 0;
                    if (minLowestPrice === 0) return null;
                    const priceText = minLowestPrice === maxLowestPrice
                      ? `${minLowestPrice} ج.م`
                      : `${minLowestPrice} - ${maxLowestPrice} ج.م`;
                    const priceTextEn = minLowestPrice === maxLowestPrice
                      ? `${minLowestPrice} EGP`
                      : `${minLowestPrice} - ${maxLowestPrice} EGP`;
                    return (
                      <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-1.5 w-fit mt-1.5">
                        {locale === 'ar' ? `أقل سعر للبيع: ${priceText}` : `Lowest retail price: ${priceTextEn}`}
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Variants preview */}
              {selectedProduct.variants.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-600">
                    {locale === 'ar' ? 'الأنواع المتاحة:' : 'Available variants:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.variants.slice(0, 4).map((v) => (
                      <div key={v.id} className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 text-right">
                        <div>{v.attributes.map((a) => `${a.name}: ${a.value}`).join(' | ')}</div>
                        <div className="text-slate-400 mt-0.5 text-[10px]">
                          {locale === 'ar' ? `${v.price} ج.م` : `${v.price} EGP`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                {mounted && user ? (
                  <>
                    <p className="text-xs text-slate-500 font-bold text-center">
                      {locale === 'ar'
                        ? 'انتقل إلى منصة المسوقين لإضافة المنتج وتحديد سعرك.'
                        : 'Go to the marketer platform to configure and order this product.'}
                    </p>
                    <Link
                      href="/marketer/products"
                      className="w-full py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CartIcon className="w-4 h-4" />
                      <span>{locale === 'ar' ? 'انتقل لمتجر المسوقين' : 'Go to Marketer Store'}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 text-center space-y-2">
                      <SparklesIcon className="w-6 h-6 text-primary mx-auto" />
                      <p className="text-sm font-black text-slate-800">
                        {locale === 'ar' ? 'سجّل الآن لطلب هذا المنتج' : 'Register to order this product'}
                      </p>
                      <p className="text-xs text-slate-500 font-bold">
                        {locale === 'ar'
                          ? 'أنشئ حسابك مجاناً وابدأ البيع والربح فوراً.'
                          : 'Create your free account and start selling immediately.'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href="/login?redirect=/products"
                        onClick={() => setSelectedProduct(null)}
                        className="flex-1 py-3 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-all text-center"
                      >
                        {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setSelectedProduct(null)}
                        className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all text-center"
                      >
                        {locale === 'ar' ? 'إنشاء حساب' : 'Register Free'}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
