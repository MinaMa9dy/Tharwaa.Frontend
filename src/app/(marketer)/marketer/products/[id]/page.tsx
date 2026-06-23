'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/shared/context/LocaleContext';
import { productService } from '@/features/products/api/productService';
import { cartService } from '@/features/cart/api/cartService';
import { useCartStore } from '@/features/cart/store/cartStore';
import { ProductDto } from '@/shared/types/product';
import { toast } from 'react-hot-toast';
import { env } from '@/shared/config/env';
import { SearchIcon, CartIcon } from '@/shared/components/Icons';

export default function ProductDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { locale, dir } = useLocale();
  const { addItem } = useCartStore();

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = env.apiUrl.replace(/\/api$/, '');
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${apiBase}/${cleanUrl}`;
  };

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);

  // Variant selector states
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [priceToSell, setPriceToSell] = useState<number>(0);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;

    const loadProductData = async () => {
      setIsLoading(true);
      try {
        const res = await productService.getById(id);
        if (!active) return;
        if (res.success && res.data) {
          const prod = res.data;
          setProduct(prod);
          
          // Set initial main image
          const mainImg = prod.files.find((f) => f.isMain)?.url || prod.files[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80';
          setActivePhotoUrl(mainImg);

          // Select first variant by default if any exist
          if (prod.variants && prod.variants.length > 0) {
            const first = prod.variants[0];
            setSelectedVariant(first);
            setPriceToSell(first.price);
            
            // Populate initial selected attributes
            const initialAttrs: Record<string, string> = {};
            first.attributes.forEach((attr: any) => {
              initialAttrs[attr.name] = attr.value;
            });
            setSelectedAttributes(initialAttrs);
          } else {
            setPriceToSell(prod.price || 0);
          }

          // Main product data loaded, show details immediately
          setIsLoading(false);

          // Load related products in the background asynchronously
          if (prod.categoryId) {
            setIsRelatedLoading(true);
            productService.getAll({ categoryId: prod.categoryId, pageSize: 5 })
              .then((relRes) => {
                if (!active) return;
                if (relRes.success && relRes.data) {
                  const list = Array.isArray(relRes.data) ? relRes.data : ((relRes.data as any).items || []);
                  const filtered = list.filter((p: ProductDto) => p.id !== prod.id).slice(0, 4);
                  setRelatedProducts(filtered);
                }
              })
              .catch((err) => {
                console.error('Failed to load related products', err);
              })
              .finally(() => {
                if (active) {
                  setIsRelatedLoading(false);
                }
              });
          }
        } else {
          toast.error(locale === 'ar' ? 'فشل تحميل المنتج' : 'Failed to load product');
          setIsLoading(false);
        }
      } catch (err: any) {
        if (!active) return;
        toast.error(locale === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading product details');
        setIsLoading(false);
      }
    };

    loadProductData();

    return () => {
      active = false;
    };
  }, [id]);

  // Match attributes map to variants list
  const findMatchingVariant = (attrs: Record<string, string>) => {
    if (!product?.variants) return null;
    return product.variants.find((v) => {
      return v.attributes.every((attr) => attrs[attr.name] === attr.value);
    }) || null;
  };

  const handleAttributeChange = (name: string, value: string) => {
    if (!product?.variants || product.variants.length === 0) return;
    
    // Copy current selection and update the changed attribute
    const updated = { ...selectedAttributes };
    updated[name] = value;
    
    // 1. Try to find a variant that matches the new combination exactly
    let match = product.variants.find((v) => {
      return v.attributes.every((attr) => updated[attr.name] === attr.value);
    });
    
    // 2. If no exact match is found, find a candidate variant with the clicked attribute value
    // that matches as many of the other currently selected attributes as possible.
    if (!match) {
      const candidates = product.variants.filter((v) => {
        return v.attributes.some((attr) => attr.name === name && attr.value === value);
      });
      
      if (candidates.length > 0) {
        let bestCandidate = candidates[0];
        let maxScore = -1;
        
        candidates.forEach((v) => {
          let score = 0;
          v.attributes.forEach((attr) => {
            if (attr.name !== name && selectedAttributes[attr.name] === attr.value) {
              score++;
            }
          });
          if (score > maxScore) {
            maxScore = score;
            bestCandidate = v;
          }
        });
        
        match = bestCandidate;
      }
    }
    
    if (match) {
      // Synchronize selection state to match the found variant's attributes exactly
      const syncedAttrs: Record<string, string> = {};
      match.attributes.forEach((attr) => {
        syncedAttrs[attr.name] = attr.value;
      });
      setSelectedAttributes(syncedAttrs);
      setSelectedVariant(match);
      setPriceToSell(match.price);
    }
  };

  const isOptionAvailable = (attrName: string, val: string) => {
    if (!product?.variants) return false;
    
    // Create a copy of current selection but override the tested attribute
    const testSelection = { ...selectedAttributes };
    testSelection[attrName] = val;
    
    // An option matches if there is any variant matching this modified selection
    return product.variants.some((v) => {
      return v.attributes.every((attr) => testSelection[attr.name] === attr.value);
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error(locale === 'ar' ? 'الرجاء اختيار خيار للمنتج أولاً' : 'Please select a variant option first');
      return;
    }

    if (priceToSell < (selectedVariant ? selectedVariant.price : product.price)) {
      toast.error(locale === 'ar' ? 'سعر البيع لا يمكن أن يكون أقل من سعر الجملة' : 'Selling price cannot be less than wholesale price');
      return;
    }

    setIsAddingToCart(true);
    try {
      const variantId = selectedVariant ? selectedVariant.id : product.variants[0]?.id;
      if (!variantId) {
        toast.error(locale === 'ar' ? 'المنتج غير متوفر للشراء' : 'Product variant is unavailable');
        return;
      }

      await addItem(product.id, variantId, quantity, product, priceToSell);
      
      const error = useCartStore.getState().error;
      if (!error) {
        toast.success(locale === 'ar' ? 'تم إضافة المنتج إلى عربة التسوق بنجاح!' : 'Added to cart successfully!');
      } else {
        toast.error(error || (locale === 'ar' ? 'فشل الإضافة للعربة' : 'Failed to add to cart'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? 'فشل الاتصال بالخادم' : 'Server connection error');
    } finally {
      setIsAddingToCart(false);
    }
  };



  // Group attributes by name to get list of unique values
  const getAttributeOptions = () => {
    if (!product?.variants) return {};
    const grouped: Record<string, Set<string>> = {};
    product.variants.forEach((v) => {
      v.attributes.forEach((attr) => {
        if (!grouped[attr.name]) grouped[attr.name] = new Set();
        grouped[attr.name].add(attr.value);
      });
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse" dir={dir}>
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center justify-start gap-2">
          <div className="w-16 h-4 bg-slate-200 rounded" />
          <span>/</span>
          <div className="w-24 h-4 bg-slate-200 rounded" />
        </div>

        {/* Main product card Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          {/* Gallery column */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-slate-100" />
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0" />
              <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0" />
              <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0" />
            </div>
          </div>

          {/* Info Column */}
          <div className="flex flex-col justify-between space-y-6 text-right">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-24 h-6 bg-slate-200 rounded-full" />
                <div className="w-20 h-6 bg-slate-200 rounded-full" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-3/4 mr-auto md:mr-0" />
              <div className="h-4 bg-slate-200 rounded w-1/4 mr-auto md:mr-0" />
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-4/6" />
              </div>
            </div>

            <div className="space-y-5 border-t border-slate-100 pt-5">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-12 mr-auto md:mr-0" />
                <div className="flex gap-2 justify-start">
                  <div className="w-16 h-8 bg-slate-100 rounded-xl" />
                  <div className="w-16 h-8 bg-slate-100 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-4 justify-start">
                <div className="w-12 h-4 bg-slate-200 rounded" />
                <div className="w-32 h-10 bg-slate-100 rounded-xl" />
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/50 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-16 h-4 bg-slate-200 rounded" />
                  <div className="w-32 h-4 bg-slate-200 rounded" />
                </div>
                <div className="h-12 bg-slate-200 rounded-xl w-full" />
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <div className="w-16 h-4 bg-slate-200 rounded" />
                  <div className="w-32 h-4 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-14 bg-slate-200 rounded-2xl w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
        <div className="flex justify-center mb-4">
          <SearchIcon className="w-14 h-14 text-slate-300" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mt-4">{locale === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}</h2>
        <p className="text-slate-400 text-sm font-bold mt-2">{locale === 'ar' ? 'ربما تم حذفه أو تعطيله.' : 'This product may have been removed.'}</p>
        <Link href="/marketer/products" className="inline-block mt-5 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow">
          {locale === 'ar' ? 'العودة لصفحة المنتجات' : 'Back to Products'}
        </Link>
      </div>
    );
  }

  const attrOptions = getAttributeOptions();
  const wholesalePrice = selectedVariant ? selectedVariant.price : product.price;
  const stock = selectedVariant ? selectedVariant.quantity : product.stockQuantity;
  const currentSku = selectedVariant ? selectedVariant.sku : '';
  const profit = (priceToSell - wholesalePrice) * quantity;

  return (
    <div className="space-y-12 animate-fadeIn" dir={dir}>
      {/* Breadcrumb */}
      <div className="text-right text-xs font-bold text-slate-400 flex items-center justify-start gap-2">
        <Link href="/marketer/products" className="hover:text-primary transition-colors">
          {locale === 'ar' ? 'المنتجات' : 'Products'}
        </Link>
        <span>/</span>
        <span className="text-slate-600">
          {product.name}
        </span>
      </div>

      {/* Main product card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        
        {/* Gallery column */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative shadow-inner">
            <img
              src={getImageUrl(activePhotoUrl)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          {product.files && product.files.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 justify-start">
              {product.files.map((file, idx) => (
                <button
                  key={file.id || idx}
                  onClick={() => setActivePhotoUrl(file.url)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                    activePhotoUrl === file.url ? 'border-primary shadow' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(file.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex flex-col justify-between space-y-6 text-right">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {stock > 0 ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black">
                  {locale === 'ar' ? 'متوفر بالمخزن' : 'In Stock'}
                </span>
              ) : (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black">
                  {locale === 'ar' ? 'نفذ المخزون' : 'Out of Stock'}
                </span>
              )}
              <span className="bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black">
                {product.categoryName || (locale === 'ar' ? 'قسم عام' : 'General')}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-800 leading-tight">
              {product.name}
            </h1>

            {currentSku && (
              <p className="text-xs font-bold text-slate-400">
                {locale === 'ar' ? 'الرمز (SKU):' : 'SKU:'} <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{currentSku}</span>
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed border-t border-slate-100 pt-4">
              {product.description}
            </p>
          </div>

          <div className="space-y-5 border-t border-slate-100 pt-5">
            {/* Dynamic Attributes Selectors */}
            {Object.keys(attrOptions).map((attrName) => (
              <div key={attrName} className="space-y-2">
                <label className="text-xs font-black text-slate-600 block">{attrName}:</label>
                <div className="flex flex-wrap gap-2 justify-start">
                  {Array.from(attrOptions[attrName]).map((val) => {
                    const isSelected = selectedAttributes[attrName] === val;
                    const isAvailable = isOptionAvailable(attrName, val);
                    return (
                      <button
                        key={val}
                        onClick={() => handleAttributeChange(attrName, val)}
                        className={`px-4 py-2 rounded-xl text-xs font-black border transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : !isAvailable
                            ? 'bg-slate-50 text-slate-400/80 border-slate-200/60 opacity-60'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {val}
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                            <div className="w-[140%] h-[1.5px] bg-slate-300/80 -rotate-12 transform origin-center shrink-0" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 justify-start">
              <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'الكمية:' : 'Quantity:'}</label>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock}
                  className="w-10 h-10 flex items-center justify-center font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 text-lg disabled:opacity-50"
                >
                  +
                </button>
                <span className="w-12 text-center text-sm font-black text-slate-700">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-lg disabled:opacity-50"
                >
                  -
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                ({locale === 'ar' ? `المتبقي: ${stock} قطعة` : `${stock} items left`})
              </span>
            </div>

            {/* Pricing Details */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/50 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">{wholesalePrice.toLocaleString()} ج.م</span>
                <span className="text-slate-400">{locale === 'ar' ? 'سعر الجملة المقترح:' : 'Suggested Wholesale Price:'}</span>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-black text-slate-600 block">
                  {locale === 'ar' ? 'سعر البيع المقترح للمستهلك (ج.م):' : 'Selling Price (EGP):'}
                </label>
                <input
                  type="number"
                  min={wholesalePrice}
                  value={priceToSell}
                  onChange={(e) => setPriceToSell(parseFloat(e.target.value) || 0)}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm font-black bg-white"
                />
              </div>

              <div className="flex justify-between items-center text-xs sm:text-sm font-black border-t border-slate-200 pt-3 text-emerald-700">
                <span>+{profit.toLocaleString()} ج.م</span>
                <span>{locale === 'ar' ? 'ربحك الإجمالي المتوقع:' : 'Your Expected Profit:'}</span>
              </div>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || stock <= 0}
              className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/95 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{locale === 'ar' ? 'جاري الإضافة للسلة...' : 'Adding to Cart...'}</span>
                </>
              ) : (
                <>
                  <CartIcon className="w-5 h-5 text-white" />
                  <span>{locale === 'ar' ? 'إضافة إلى سلة البيع' : 'Add to Sales Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {(isRelatedLoading || relatedProducts.length > 0) && (
        <div className="space-y-6">
          <div className="text-right border-b border-slate-200 pb-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-800">
              {locale === 'ar' ? 'منتجات ذات صلة قد تعجبك' : 'Related Products'}
            </h2>
            <p className="text-slate-400 text-xs font-bold mt-0.5">
              {locale === 'ar' ? 'تصفح منتجات من نفس القسم لتسويقها مع هذا المنتج.' : 'More items from the same category.'}
            </p>
          </div>

          {isRelatedLoading ? (
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-[70%] sm:w-[45%] lg:w-auto shrink-0 snap-start bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-3 sm:space-y-4 animate-pulse">
                  <div className="aspect-square w-full rounded-xl bg-slate-100" />
                  <div className="h-4 bg-slate-100 rounded w-2/3 mr-auto md:mr-0" />
                  <div className="h-3 bg-slate-100 rounded w-full mr-auto md:mr-0" />
                  <div className="h-6 bg-slate-100 rounded w-1/3 mr-auto md:mr-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0">
              {relatedProducts.map((prod) => {
                const mainImg = prod.files.find((f) => f.isMain)?.url || prod.files[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80';
                return (
                  <Link
                    key={prod.id}
                    href={`/marketer/products/${prod.id}`}
                    className="w-[70%] sm:w-[45%] lg:w-auto shrink-0 snap-start group bg-white rounded-2xl border border-slate-200 hover:border-primary/30 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 text-right"
                  >
                    <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                      <img
                        src={getImageUrl(mainImg)}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-0.5">
                        <span className="text-[8px] sm:text-[9px] font-black text-primary/80 uppercase">
                          {prod.categoryName || (locale === 'ar' ? 'تصنيف عام' : 'General')}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                          {prod.name}
                        </h3>
                      </div>

                      <div className="flex justify-between items-center text-xs font-extrabold text-slate-800 pt-1 border-t border-slate-100">
                        <span>{prod.price} ج.م</span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {locale === 'ar' ? 'سعر الجملة' : 'Wholesale'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
