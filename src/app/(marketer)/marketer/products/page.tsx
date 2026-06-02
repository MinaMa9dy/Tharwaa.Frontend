'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { productService } from '@/features/products/api/productService';
import { categoryService } from '@/features/categories/api/categoryService';
import { ProductDto, ProductParams } from '@/shared/types/product';
import { CategoryDto } from '@/shared/types/category';
import { useCartStore } from '@/features/cart/store/cartStore';
import { toast } from 'react-hot-toast';

const ALL_CATEGORY: CategoryDto = { id: 0, name: 'الكل', nameEn: 'All', isActive: true };

export default function ProductsPage() {
  const { locale, dir } = useLocale();
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Categories ref and scroll helper for PC view
  const categoriesRef = useRef<HTMLDivElement>(null);

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

  // Pagination states (responsive page sizes: 6 for mobile, 12 for PC)
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Variant selector states
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [chosenVariantId, setChosenVariantId] = useState<string | undefined>(undefined);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);

  // Handle responsive page size detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPageSize(6);
      } else {
        setPageSize(12);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset current page when category or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Load categories once on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const catRes = await categoryService.getAll();
        let dbCategories: CategoryDto[] = [ALL_CATEGORY];
        if (catRes.success && catRes.data) {
          dbCategories = [...dbCategories, ...catRes.data];
        }
        setCategories(dbCategories.filter(c => c.isActive));
      } catch (err) {
        setCategories([ALL_CATEGORY]);
      }
    }
    loadCategories();
  }, []);

  // Load products from backend with parameters (debounced for search query)
  useEffect(() => {
    let active = true;
    async function loadProducts() {
      setIsLoading(true);
      try {
        const params: ProductParams = {
          pageSize: pageSize,
          pageNumber: currentPage,
          categoryId: selectedCategory === 0 ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
        };
        const prodRes = await productService.getAll(params);
        if (!active) return;

        let dbProducts: ProductDto[] = [];
        if (prodRes.success && prodRes.data) {
          dbProducts = prodRes.data;
          setTotalPages(prodRes.meta?.totalPages || 1);
        } else {
          setTotalPages(1);
        }
        setProducts(dbProducts.filter(p => p.isActive));
      } catch (err) {
        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedCategory, searchQuery, pageSize, currentPage]);

  const filteredProducts = products;

  const handleOpenVariantSelector = (product: ProductDto) => {
    setSelectedProduct(product);
    setChosenVariantId(product.variants.length > 0 ? product.variants[0].id : undefined);
    setCustomPrice(product.price);
    setQuantity(1);
    setCartSuccessMessage(null);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    await addItem(selectedProduct.id, chosenVariantId, quantity, selectedProduct, customPrice);
    
    const error = useCartStore.getState().error;
    if (!error) {
      toast.success(locale === 'ar' ? 'تم إضافة المنتج بنجاح إلى سلتك!' : 'Product added to cart successfully!');
      setCartSuccessMessage('تم إضافة المنتج بنجاح إلى سلتك!');
      setTimeout(() => {
        setSelectedProduct(null);
      }, 1500);
    } else {
      toast.error(locale === 'ar' ? `خطأ في إضافة المنتج للسلة: ${error}` : `Error adding product to cart: ${error}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      {/* Banner */}
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
              ? 'اختر المنتجات التي تريد تسويقها، حدد سعر البيع المناسب لك، واترك الشحن والتوصيل وتحصيل الأرباح لـ ثروة.'
              : 'Choose products to market, set your price, and let Tharwa handle shipping and payouts.'}
          </p>
        </div>
        <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-15 hidden lg:block">
          <svg className="w-56 h-56 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        {/* Category Tabs with Navigation Arrows */}
        <div className="flex-1 flex items-center gap-1.5 min-w-0 relative">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-all font-black text-xs shrink-0 cursor-pointer"
            title={locale === 'ar' ? 'السابق' : 'Previous'}
          >
            ◀
          </button>

          {/* Category Scroll List */}
          <div
            ref={categoriesRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none min-w-0"
          >
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

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-all font-black text-xs shrink-0 cursor-pointer"
            title={locale === 'ar' ? 'التالي' : 'Next'}
          >
            ▶
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 md:shrink-0">
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            🔎
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

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-3 sm:space-y-4 animate-pulse">
              <div className="aspect-square w-full rounded-xl bg-slate-100" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-6 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-4">
          <span className="text-4xl">📦</span>
          <h3 className="text-lg font-black text-slate-700">
            {locale === 'ar' ? 'لا توجد منتجات مطابقة للبحث' : 'No products found'}
          </h3>
          <p className="text-slate-400 text-sm font-semibold">
            {locale === 'ar' ? 'جرب البحث بكلمة أخرى أو تصفح الأقسام الأخرى.' : 'Try searching different terms.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((prod) => {
            const mainImg = prod.files.find((f) => f.isMain)?.url || prod.files[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80';
            
            return (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-primary/30 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <Link href={`/marketer/products/${prod.id}`} className="block">
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    <img
                      src={mainImg}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>

                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 text-right">
                  <div className="space-y-1">
                    <Link href={`/marketer/products/${prod.id}`} className="block group">
                      <span className="text-[9px] sm:text-[10px] font-black text-primary/80 uppercase">
                        {prod.categoryName || (locale === 'ar' ? 'تصنيف عام' : 'General')}
                      </span>
                      <h3 className="text-xs sm:text-base font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                        {locale === 'ar' ? prod.name : prod.nameEn || prod.name}
                      </h3>
                    </Link>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold line-clamp-1 sm:line-clamp-2 leading-relaxed">
                      {locale === 'ar' ? prod.description : prod.descriptionEn || prod.description}
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 sm:pt-3">
                      <div className="flex flex-col text-right w-full">
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">{locale === 'ar' ? 'سعر الجملة' : 'Wholesale price'}</span>
                        <span className="text-sm sm:text-base font-black text-slate-800">
                          {prod.price} {locale === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenVariantSelector(prod)}
                      className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer"
                    >
                      🛒 {locale === 'ar' ? 'إضافة وتحديد السعر' : 'Configure & Add'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {!isLoading && products.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-8 pb-4">
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

      {/* Variant & Commission Selector Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200/50 text-right animate-scaleIn">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">
                {locale === 'ar' ? 'تخصيص وإضافة المنتج' : 'Customize Product'}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700 text-xs font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {cartSuccessMessage ? (
                <div className="p-8 text-center space-y-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <span className="text-3xl">🎉</span>
                  <p className="text-base font-black">{cartSuccessMessage}</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-4">
                    <img
                      src={selectedProduct.files[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=150&q=80'}
                      alt={selectedProduct.name}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-100"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-black text-slate-800 text-base">
                        {locale === 'ar' ? selectedProduct.name : selectedProduct.nameEn || selectedProduct.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold">
                        {locale === 'ar' ? `سعر الجملة: ${selectedProduct.price} ج.م` : `Wholesale price: ${selectedProduct.price} EGP`}
                      </p>
                    </div>
                  </div>

                  {/* Variants */}
                  {selectedProduct.variants.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-600 block">
                        {locale === 'ar' ? 'اختر النوع المتوفر:' : 'Select variant:'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.variants.map((v) => {
                          const attrText = v.attributes.map(a => `${a.name}: ${a.value}`).join(' | ');
                          return (
                            <button
                              key={v.id}
                              onClick={() => {
                                setChosenVariantId(v.id);
                                setCustomPrice(v.price);
                              }}
                              className={`p-3 text-right rounded-xl border text-xs font-black transition-all ${
                                chosenVariantId === v.id
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div>{attrText}</div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {locale === 'ar' ? `المخزون: ${v.quantity} قطعة` : `Stock: ${v.quantity}`}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Profit Calculator */}
                  <div className="space-y-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800">
                        {locale === 'ar' ? 'حدد سعر البيع لعميلك (ج.م):' : 'Set selling price (EGP):'}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        {locale === 'ar' ? `الحد الأدنى: ${selectedProduct.variants.find(v => v.id === chosenVariantId)?.price || selectedProduct.price} ج.م` : `Min: ${selectedProduct.variants.find(v => v.id === chosenVariantId)?.price || selectedProduct.price}`}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="number"
                        min={selectedProduct.variants.find(v => v.id === chosenVariantId)?.price || selectedProduct.price}
                        value={customPrice}
                        onChange={(e) => {
                          const priceVal = parseFloat(e.target.value) || 0;
                          setCustomPrice(priceVal);
                        }}
                        className="w-full text-right p-3 rounded-xl border border-emerald-200 bg-white font-black text-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-black pt-2 border-t border-emerald-100 text-emerald-800">
                      <span>{locale === 'ar' ? 'ربحك الصافي من كل قطعة:' : 'Your profit per unit:'}</span>
                      <span className="text-base font-black text-emerald-600">
                        {Math.max(0, customPrice - (selectedProduct.variants.find(v => v.id === chosenVariantId)?.price || selectedProduct.price))} ج.م
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-12 bg-white">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-3 h-full hover:bg-slate-50 text-slate-500 font-black text-sm"
                      >
                        -
                      </button>
                      <span className="px-4 font-black text-sm text-slate-800">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="px-3 h-full hover:bg-slate-50 text-slate-500 font-black text-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={customPrice < (selectedProduct.variants.find(v => v.id === chosenVariantId)?.price || selectedProduct.price)}
                      className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      🛒 {locale === 'ar' ? 'تأكيد وإضافة للسلة' : 'Confirm & Add'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
