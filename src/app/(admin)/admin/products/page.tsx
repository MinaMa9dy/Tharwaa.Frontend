'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { productService } from '@/features/products/api/productService';
import { categoryService } from '@/features/categories/api/categoryService';
import { supplierService } from '@/features/suppliers/api/supplierService';
import { AdminProductDto, CreateProductVariantDto, CreateProductPhotoDto } from '@/shared/types/product';
import { CategoryDto } from '@/shared/types/category';
import { SupplierDto } from '@/shared/types/supplier';
import { toast } from 'react-hot-toast';
import Pagination from '@/shared/components/Pagination';
import ProductImageCropper from '@/shared/components/ProductImageCropper';
import { env } from '@/shared/config/env';
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  ImageIcon,
  LinkIcon,
  SaveIcon,
  StarIcon,
  SparklesIcon,
  WarningIcon,
  CheckCircleIcon
} from '@/shared/components/Icons';

interface AttributeLookup {
  id: string;
  name: string;
  dataType: string;
}

export default function AdminProductsPage() {
  const { locale, dir } = useLocale();
  const { user } = useAuthStore();
  const isSupplier = user?.role === 'Supplier';
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [attributes, setAttributes] = useState<AttributeLookup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Handle responsive page size detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPageSize(10);
      } else {
        setPageSize(20);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const params = new URLSearchParams(window.location.search);
    const urlPage = parseInt(params.get('page') || '1', 10) || 1;
    if (urlPage !== 1) {
      setCurrentPage(urlPage);
    }
    setMounted(true);

    return () => window.removeEventListener('resize', handleResize);
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

  // Reset current page when search query or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // No longer client-side filtering; we filter via backend.
  const filteredProducts = products;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductDto | null>(null);

  // Form states - General Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [supplierId, setSupplierId] = useState<string>('');

  // Form states - Photos List
  const [photos, setPhotos] = useState<CreateProductPhotoDto[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoIsMain, setNewPhotoIsMain] = useState(false);
  const [photoInputTab, setPhotoInputTab] = useState<'upload' | 'link'>('upload');
  const [croppedProductFile, setCroppedProductFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [cropperKey, setCropperKey] = useState(0);

  // Form states - Variants List
  const [variants, setVariants] = useState<CreateProductVariantDto[]>([]);
  
  // Temporary Form states for adding a new variant
  const [varSku, setVarSku] = useState('');
  const [varPrice, setVarPrice] = useState<number>(0);
  const [varPurchasePrice, setVarPurchasePrice] = useState<number>(0);
  const [varLowestPriceToSell, setVarLowestPriceToSell] = useState<number>(0);
  const [varStock, setVarStock] = useState<number>(0);
  const [varAttributes, setVarAttributes] = useState<{ attributeId: string; value: string }[]>([]);
  const [editingVariantSku, setEditingVariantSku] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pRes, cRes, aRes, sRes] = await Promise.all([
        productService.getAllAdmin({ 
          pageSize, 
          pageNumber: currentPage, 
          includeInactive: true, 
          search: searchQuery,
          categoryId: selectedCategory === '' ? undefined : Number(selectedCategory)
        }),
        categoryService.getAll(),
        productService.getAttributes(),
        !isSupplier ? supplierService.getAll() : Promise.resolve({ success: true, data: [] })
      ]);

      if (pRes.success && pRes.data) {
        setProducts(pRes.data);
        setTotalPages(pRes.meta?.totalPages || 1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }

      if (cRes.success && cRes.data) {
        setCategories(cRes.data.filter(c => c.isActive));
      }

      if (aRes.success && aRes.data) {
        setAttributes(aRes.data);
      }

      if (!isSupplier && sRes.success && sRes.data) {
        setSuppliers(sRes.data.filter(s => s.isActive));
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل تحميل البيانات الأساسية' : 'Failed to load essential data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, pageSize, currentPage]);

  const openCreateModal = () => {
    setName('');
    setDescription('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
    setPhotos([]);
    setVariants([]);
    resetVariantForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (prod: AdminProductDto) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description || '');
    setCategoryId(prod.categoryId || '');
    setSupplierId(prod.supplierId || '');
    
    // Map photos
    const mappedPhotos = prod.files.map(f => ({
      photoUrl: f.url,
      isMain: f.isMain || false
    }));
    setPhotos(mappedPhotos);

    // Map variants
    const mappedVariants = prod.variants.map(v => {
      // Resolve Attribute ID from Attribute Name
      const resolvedAttrs = v.attributes.map(va => {
        const matchingAttr = attributes.find(a => a.name.toLowerCase() === va.name.toLowerCase());
        return {
          attributeId: matchingAttr ? matchingAttr.id : '',
          value: va.value
        };
      }).filter(attr => attr.attributeId !== '');

      return {
        sku: v.sku,
        price: v.price,
        purchasePrice: v.purchasePrice || 0,
        lowestPriceToSell: v.lowestPriceToSell || 0,
        stockQuantity: v.quantity,
        variantAttributes: resolvedAttrs
      };
    });
    setVariants(mappedVariants);
    resetVariantForm();
    setIsEditOpen(true);
  };

  const resetVariantForm = () => {
    setVarSku('');
    setVarPrice(0);
    setVarPurchasePrice(0);
    setVarLowestPriceToSell(0);
    setVarStock(0);
    setVarAttributes([]);
    setEditingVariantSku(null);
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl) return;
    
    // If setting this as main, unset any other main photo
    let updatedPhotos = [...photos];
    if (newPhotoIsMain) {
      updatedPhotos = updatedPhotos.map(p => ({ ...p, isMain: false }));
    }
    
    updatedPhotos.push({
      photoUrl: newPhotoUrl,
      isMain: newPhotoIsMain || photos.length === 0
    });
    
    setPhotos(updatedPhotos);
    setNewPhotoUrl('');
    setNewPhotoIsMain(false);
  };

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=80&q=80';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = env.apiUrl.replace(/\/api$/, '');
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${apiBase}/${cleanUrl}`;
  };

  const handleUploadAndAddPhoto = async () => {
    if (!croppedProductFile) return;
    setIsUploadingPhoto(true);
    try {
      const res = await productService.uploadPhoto(croppedProductFile);
      if (res.success && res.data) {
        let updatedPhotos = [...photos];
        if (newPhotoIsMain) {
          updatedPhotos = updatedPhotos.map(p => ({ ...p, isMain: false }));
        }
        updatedPhotos.push({
          photoUrl: res.data,
          isMain: newPhotoIsMain || photos.length === 0
        });
        setPhotos(updatedPhotos);
        setCroppedProductFile(null);
        setCropperKey(prev => prev + 1);
        setNewPhotoIsMain(false);
        toast.success(locale === 'ar' ? 'تم رفع وإضافة الصورة بنجاح!' : 'Photo uploaded and added successfully!');
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload photo'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload photo');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, idx) => idx !== index);
    // Ensure at least one isMain if list isn't empty
    if (updated.length > 0 && !updated.some(p => p.isMain)) {
      updated[0].isMain = true;
    }
    setPhotos(updated);
  };

  const handleSetMainPhoto = (index: number) => {
    const updated = photos.map((p, idx) => ({
      ...p,
      isMain: idx === index
    }));
    setPhotos(updated);
  };

  const handleAddAttributeToVariant = () => {
    if (attributes.length === 0) return;
    setVarAttributes([...varAttributes, { attributeId: attributes[0].id, value: '' }]);
  };

  const handleRemoveAttributeFromVariant = (index: number) => {
    setVarAttributes(varAttributes.filter((_, idx) => idx !== index));
  };

  const handleAttributeValueChange = (index: number, field: 'attributeId' | 'value', val: string) => {
    const updated = [...varAttributes];
    updated[index] = { ...updated[index], [field]: val };
    setVarAttributes(updated);
  };

  const handleEditVariant = (v: CreateProductVariantDto) => {
    setEditingVariantSku(v.sku);
    setVarSku(v.sku);
    setVarPrice(v.price);
    setVarPurchasePrice(v.purchasePrice || 0);
    setVarLowestPriceToSell(v.lowestPriceToSell || 0);
    setVarStock(v.stockQuantity);
    setVarAttributes(v.variantAttributes || []);
  };

  const handleAddVariant = () => {
    if (!varSku || varPrice <= 0 || varPurchasePrice < 0 || varLowestPriceToSell < 0 || varStock < 0) {
      toast.error(locale === 'ar' ? 'الرجاء تعبئة بيانات البديل بشكل صحيح' : 'Please fill variant info correctly');
      return;
    }

    if (varLowestPriceToSell > 0 && varLowestPriceToSell < varPrice) {
      toast.error(locale === 'ar' ? 'أقل سعر للبيع لا يمكن أن يقل عن سعر الجملة' : 'Lowest retail price cannot be lower than wholesale price');
      return;
    }

    if (editingVariantSku) {
      const otherVariants = variants.filter(v => v.sku.toLowerCase() !== editingVariantSku.toLowerCase());
      if (otherVariants.some(v => v.sku.toLowerCase() === varSku.toLowerCase())) {
        toast.error(locale === 'ar' ? 'هذا الرمز SKU مستخدم بالفعل' : 'SKU is already used');
        return;
      }

      const updatedVariants = variants.map(v => {
        if (v.sku.toLowerCase() === editingVariantSku.toLowerCase()) {
          return {
            sku: varSku,
            price: varPrice,
            purchasePrice: varPurchasePrice,
            lowestPriceToSell: varLowestPriceToSell,
            stockQuantity: varStock,
            variantAttributes: varAttributes.filter(a => a.attributeId && a.value)
          };
        }
        return v;
      });

      setVariants(updatedVariants);
      resetVariantForm();
      toast.success(locale === 'ar' ? 'تم تحديث البديل بنجاح' : 'Variant updated successfully');
    } else {
      if (variants.some(v => v.sku.toLowerCase() === varSku.toLowerCase())) {
        toast.error(locale === 'ar' ? 'هذا الرمز SKU مستخدم بالفعل' : 'SKU is already used');
        return;
      }

      const newVar: CreateProductVariantDto = {
        sku: varSku,
        price: varPrice,
        purchasePrice: varPurchasePrice,
        lowestPriceToSell: varLowestPriceToSell,
        stockQuantity: varStock,
        variantAttributes: varAttributes.filter(a => a.attributeId && a.value)
      };

      setVariants([...variants, newVar]);
      resetVariantForm();
      toast.success(locale === 'ar' ? 'تم إضافة البديل بنجاح' : 'Variant added successfully');
    }
  };

  const handleRemoveVariant = (sku: string) => {
    if (editingVariantSku?.toLowerCase() === sku.toLowerCase()) {
      resetVariantForm();
    }
    setVariants(variants.filter(v => v.sku !== sku));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !supplierId) {
      toast.error(locale === 'ar' ? 'الاسم والقسم والمورد مطلوبون' : 'Name, category, and supplier are required');
      return;
    }
    if (variants.length === 0) {
      toast.error(locale === 'ar' ? 'يجب إضافة بديل منتج واحد على الأقل مع السعر والمخزون' : 'At least one product variant is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await productService.create({
        name,
        description,
        categoryId: Number(categoryId),
        supplierId,
        productPhotos: photos,
        productVariants: variants
      });

      if (res.success) {
        toast.success(locale === 'ar' ? 'تم إضافة المنتج والبدائل بنجاح!' : 'Product and variants created successfully!');
        setIsCreateOpen(false);
        loadData();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل إضافة المنتج' : 'Failed to add product'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل إضافة المنتج' : 'Failed to add product');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !name || !categoryId || !supplierId) return;
    if (variants.length === 0) {
      toast.error(locale === 'ar' ? 'يجب إبقاء بديل منتج واحد على الأقل' : 'At least one variant must be kept');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await productService.update(editingProduct.id, {
        name,
        description,
        categoryId: Number(categoryId),
        supplierId,
        productPhotos: photos,
        productVariants: variants
      });

      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تحديث المنتج وبدائله بنجاح!' : 'Product and variants updated successfully!');
        setIsEditOpen(false);
        setEditingProduct(null);
        loadData();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تعديل المنتج' : 'Failed to update product'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل تعديل المنتج' : 'Failed to update product');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟' : 'Are you sure you want to permanently delete this product?')) return;
    
    try {
      const res = await productService.delete(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
        loadData();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await productService.toggleActive(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تحديث حالة المنتج بنجاح' : 'Product status updated successfully');
        loadData();
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل تحديث حالة المنتج' : 'Failed to update product status');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            {locale === 'ar' ? 'إدارة المنتجات والمخزون' : 'Products & Variants Management'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
            {locale === 'ar' ? 'أضف منتجات، أنشئ خيارات بديلة (الألوان، المقاسات)، حدد سعر الجملة وعدل مستويات المخزون.' : 'Track stock levels, modify variant options, pricing, and configurations.'}
          </p>
        </div>
        {!isSupplier && (
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{locale === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}</span>
          </button>
        )}
      </div>

      {/* Products list */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden text-right">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-black text-slate-800 text-sm shrink-0">
            {locale === 'ar' ? 'دليل المنتجات والخيارات البديلة' : 'Products & Variants Directory'}
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Category Filter Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === '' ? '' : Number(e.target.value))}
              className="text-right px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="">{locale === 'ar' ? 'كل الأقسام' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'ar' ? c.name : c.nameEn || c.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <SearchIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={locale === 'ar' ? 'ابحث باسم المنتج أو الرمز...' : 'Search by name or SKU...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-right pr-9 pl-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-sm font-bold text-slate-400 animate-pulse">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {locale === 'ar' ? 'لا توجد منتجات مسجلة بعد' : 'No products found'}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {locale === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matches found for your search'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-bold text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase">
                  <th className="p-4 text-right">{locale === 'ar' ? 'المنتج' : 'Product'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'القسم' : 'Category'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'البدائل المتوفرة' : 'Variants'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'سعر الجملة' : 'Wholesale Price'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'نطاق أقل سعر للبيع' : 'Lowest Retail Price Range'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'إجمالي المخزون' : 'Total Stock'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  {!isSupplier && <th className="p-4 text-center">{locale === 'ar' ? 'الإجراءات' : 'Actions'}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3 justify-start text-right">
                        {prod.files && (prod.files.find(f => f.isMain)?.url || prod.files[0]?.url) ? (
                          <img
                            src={getImageUrl(prod.files.find(f => f.isMain)?.url || prod.files[0]?.url)}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0 bg-slate-50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-lg border border-slate-200 shrink-0 select-none">
                            📦
                          </div>
                        )}
                        <div>
                          <p className="text-slate-900 font-black">{prod.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{prod.categoryName || (locale === 'ar' ? 'تصنيف عام' : 'General')}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-black">
                        {prod.variants.length} {locale === 'ar' ? 'خيارات' : 'options'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800 font-black">{prod.price} ج.م</td>
                    <td className="p-4 text-slate-800 font-black">
                      {(() => {
                        const lowestPrices = prod.variants.map(v => v.lowestPriceToSell || 0).filter(p => p > 0);
                        const minLowestPrice = lowestPrices.length > 0 ? Math.min(...lowestPrices) : 0;
                        const maxLowestPrice = lowestPrices.length > 0 ? Math.max(...lowestPrices) : 0;
                        return minLowestPrice === 0 
                          ? (locale === 'ar' ? 'غير محدد' : 'Not set')
                          : minLowestPrice === maxLowestPrice
                            ? `${minLowestPrice} ج.م`
                            : `${minLowestPrice} - ${maxLowestPrice} ج.م`;
                      })()}
                    </td>
                    <td className="p-4">{prod.stockQuantity} قطعة</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(prod.id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black border transition-all ${
                          prod.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {prod.isActive ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Disabled')}
                      </button>
                    </td>
                    {!isSupplier && (
                      <td className="p-4">
                        <div className="flex gap-2 justify-center items-center">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors text-xs font-black border border-amber-200 flex items-center gap-1"
                            title={locale === 'ar' ? 'تعديل' : 'Edit'}
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>{locale === 'ar' ? 'تعديل' : 'Edit'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-xs font-black border border-rose-200 flex items-center gap-1"
                            title={locale === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            <span>{locale === 'ar' ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && products.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Creation / Editing Modal */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200/50 text-right animate-scaleIn my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">
                {isCreateOpen
                  ? (locale === 'ar' ? 'إضافة منتج وبدائل جديدة' : 'Create New Product')
                  : (locale === 'ar' ? 'تعديل تفاصيل وبدائل المنتج' : 'Edit Product Details')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                  setEditingProduct(null);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={isCreateOpen ? handleCreateProduct : handleUpdateProduct} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Product Basic Fields */}
              <div className="space-y-4">
                <h4 className="font-black text-slate-800 text-xs border-r-4 border-primary pr-2">
                  {locale === 'ar' ? '1. معلومات المنتج العامة' : '1. General Product Details'}
                </h4>
                
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-600">الاسم:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-600">الوصف:</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-600">القسم:</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                  >
                    <option value="">{locale === 'ar' ? 'اختر القسم...' : 'Select Category...'}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'المورد:' : 'Supplier:'}</label>
                  <select
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                  >
                    <option value="">{locale === 'ar' ? 'اختر المورد...' : 'Select Supplier...'}</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Photos Section */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <h4 className="font-black text-slate-800 text-xs border-r-4 border-primary pr-2">
                  {locale === 'ar' ? '2. صور المنتج' : '2. Product Images'}
                </h4>

                {/* Visual Tab Selection for Product Photos */}
                <div className="flex gap-2 border-b border-slate-200 pb-2.5 mb-4 justify-start">
                  <button
                    type="button"
                    onClick={() => setPhotoInputTab('upload')}
                    className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      photoInputTab === 'upload'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{locale === 'ar' ? 'رفع وقص صورة المنتج' : 'Upload & Crop Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoInputTab('link')}
                    className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      photoInputTab === 'link'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{locale === 'ar' ? 'رابط خارجي مباشر' : 'Direct External Link'}</span>
                  </button>
                </div>

                {photoInputTab === 'upload' ? (
                  <div className="space-y-4">
                    {/* Visual Image Cropper Component */}
                    <ProductImageCropper key={cropperKey} onCrop={setCroppedProductFile} />
                    
                    <div className="flex items-center justify-between gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/50">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="isMainCheckboxUpload"
                          checked={newPhotoIsMain}
                          onChange={(e) => setNewPhotoIsMain(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-slate-200"
                        />
                        <label htmlFor="isMainCheckboxUpload" className="text-xs font-black text-slate-600">
                          {locale === 'ar' ? 'تعيين كصورة رئيسية' : 'Set as main product photo'}
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={handleUploadAndAddPhoto}
                        disabled={isUploadingPhoto || !croppedProductFile}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-colors flex items-center gap-1.5"
                      >
                        {isUploadingPhoto ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{locale === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
                          </>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <SaveIcon className="w-3.5 h-3.5" />
                            <span>{locale === 'ar' ? 'رفع وإضافة الصورة' : 'Upload & Add Photo'}</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 items-end justify-start">
                    <div className="flex-1 space-y-1 text-right">
                      <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'رابط الصورة المباشر:' : 'Photo URL:'}</label>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <input
                        type="checkbox"
                        id="isMainCheckbox"
                        checked={newPhotoIsMain}
                        onChange={(e) => setNewPhotoIsMain(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-slate-200"
                      />
                      <label htmlFor="isMainCheckbox" className="text-xs font-black text-slate-600">{locale === 'ar' ? 'رئيسية' : 'Main'}</label>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="px-4 py-3 rounded-xl bg-slate-800 text-white font-black text-xs mb-1.5 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>{locale === 'ar' ? 'إضافة' : 'Add'}</span>
                    </button>
                  </div>
                )}

                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                    {photos.map((ph, idx) => (
                      <div key={idx} className={`flex flex-col rounded-2xl overflow-hidden border bg-white transition-all ${ph.isMain ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="relative w-full aspect-square bg-slate-100 border-b border-slate-100">
                          <img src={getImageUrl(ph.photoUrl)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="p-2 sm:p-3 flex gap-2 justify-between items-center bg-slate-50/50 mt-auto">
                          {ph.isMain ? (
                            <span className="bg-primary text-white text-[9px] sm:text-[11px] font-black px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl shadow-xs flex items-center gap-1 shrink-0">
                              <StarIcon className="w-3 h-3 fill-white text-white" />
                              <span>{locale === 'ar' ? 'رئيسية' : 'Main'}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetMainPhoto(idx)}
                              className="bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 text-[9px] sm:text-[11px] font-black px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
                            >
                              {locale === 'ar' ? 'تعيين رئيسية' : 'Set Main'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="bg-rose-600 hover:bg-rose-700 text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-xs font-black cursor-pointer transition-colors shrink-0 flex items-center justify-center"
                            title={locale === 'ar' ? 'إزالة' : 'Remove'}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-400 italic">
                    {locale === 'ar' ? 'لم يتم إضافة صور بعد. سيتم استخدام الصورة الافتراضية.' : 'No photos added. A default fallback will be used.'}
                  </p>
                )}
              </div>

              {/* Product Variants Section */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <h4 className="font-black text-slate-800 text-xs border-r-4 border-primary pr-2">
                  {locale === 'ar' ? '3. خيارات البدائل والمواصفات (ألوان، مقاسات، إلخ)' : '3. Product Variants & Specifications'}
                </h4>

                {/* Subform to create new variant */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-4">
                  <span className="text-xs font-black text-slate-700 block flex items-center gap-1.5 justify-end">
                    <span>{locale === 'ar' ? 'إضافة خيار بديل جديد للمنتج:' : 'Configure a new variant:'}</span>
                    <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">رمز المخزون (SKU):</label>
                      <input
                        type="text"
                        placeholder="e.g. LAP-16GB-BLACK"
                        value={varSku}
                        onChange={(e) => setVarSku(e.target.value)}
                        className="w-full text-right p-2.5 rounded-lg border border-slate-200 focus:outline-none text-[11px] font-bold bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">سعر الجملة (ج.م):</label>
                      <input
                        type="number"
                        min={0}
                        value={varPrice}
                        onChange={(e) => setVarPrice(parseFloat(e.target.value) || 0)}
                        className="w-full text-right p-2.5 rounded-lg border border-slate-200 focus:outline-none text-[11px] font-bold bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">{locale === 'ar' ? 'سعر الشراء (ج.م):' : 'Purchase Price (EGP):'}</label>
                      <input
                        type="number"
                        min={0}
                        value={varPurchasePrice}
                        onChange={(e) => setVarPurchasePrice(parseFloat(e.target.value) || 0)}
                        className="w-full text-right p-2.5 rounded-lg border border-slate-200 focus:outline-none text-[11px] font-bold bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">{locale === 'ar' ? 'أقل سعر للبيع (ج.م):' : 'Lowest Selling Price (EGP):'}</label>
                      <input
                        type="number"
                        min={0}
                        value={varLowestPriceToSell}
                        onChange={(e) => setVarLowestPriceToSell(parseFloat(e.target.value) || 0)}
                        className="w-full text-right p-2.5 rounded-lg border border-slate-200 focus:outline-none text-[11px] font-bold bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">كمية المخزون:</label>
                      <input
                        type="number"
                        min={0}
                        value={varStock}
                        onChange={(e) => setVarStock(parseInt(e.target.value) || 0)}
                        className="w-full text-right p-2.5 rounded-lg border border-slate-200 focus:outline-none text-[11px] font-bold bg-white"
                      />
                    </div>
                  </div>

                  {/* Attributes within variant subform */}
                  {attributes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={handleAddAttributeToVariant}
                          className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black transition-colors flex items-center gap-1"
                        >
                          <PlusIcon className="w-3 h-3" />
                          <span>{locale === 'ar' ? 'إضافة مواصفة للبديل' : 'Add Attribute'}</span>
                        </button>
                        <span className="text-[10px] font-black text-slate-500">
                          {locale === 'ar' ? 'مواصفات هذا البديل:' : 'Variant Attributes:'}
                        </span>
                      </div>

                      {varAttributes.map((va, idx) => (
                        <div key={idx} className="flex gap-2 items-center justify-start">
                          <select
                            value={va.attributeId}
                            onChange={(e) => handleAttributeValueChange(idx, 'attributeId', e.target.value)}
                            className="p-2 rounded border border-slate-200 text-[10px] font-bold bg-white"
                          >
                            {attributes.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Value (e.g. XL, Blue)"
                            value={va.value}
                            onChange={(e) => handleAttributeValueChange(idx, 'value', e.target.value)}
                            className="flex-1 p-2 rounded border border-slate-200 text-[10px] font-bold text-right"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAttributeFromVariant(idx)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded text-xs font-black border border-rose-100 flex items-center justify-center"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex-1 py-2 rounded-xl bg-primary text-white font-extrabold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      {editingVariantSku ? (
                        <>
                          <SaveIcon className="w-3.5 h-3.5" />
                          <span>{locale === 'ar' ? 'حفظ تعديلات البديل' : 'Save Variant Changes'}</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-3.5 h-3.5" />
                          <span>{locale === 'ar' ? 'إضافة البديل للمنتج الحالي' : 'Add Variant to Product'}</span>
                        </>
                      )}
                    </button>
                    {editingVariantSku && (
                      <button
                        type="button"
                        onClick={resetVariantForm}
                        className="py-2 px-4 rounded-xl bg-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-300 transition-all"
                      >
                        {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>

                {/* List of currently configured variants */}
                {variants.length > 0 ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-right">
                    <div className="bg-slate-100 p-2.5 font-black text-xs text-slate-700">
                      {locale === 'ar' ? 'البدائل المضافة للمنتج الحالي:' : 'Added Variants List:'}
                    </div>
                    <div className="divide-y divide-slate-100">
                      {variants.map((v) => (
                        <div key={v.sku} className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors text-right ${editingVariantSku?.toLowerCase() === v.sku.toLowerCase() ? 'bg-amber-50/50 border border-amber-200 rounded-xl' : 'hover:bg-slate-50'}`}>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditVariant(v)}
                              className="px-3 py-1.5 rounded-xl border border-amber-200 text-amber-600 hover:bg-amber-50 text-xs font-black transition-colors flex items-center gap-1"
                            >
                              <EditIcon className="w-3.5 h-3.5" />
                              <span>{locale === 'ar' ? 'تعديل' : 'Edit'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(v.sku)}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-black transition-colors flex items-center gap-1"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              <span>{locale === 'ar' ? 'إزالة' : 'Remove'}</span>
                            </button>
                          </div>
                          
                          <div className="flex-1 space-y-1.5 w-full">
                            <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                SKU: {v.sku}
                              </span>
                              {v.variantAttributes && v.variantAttributes.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-start sm:justify-end">
                                  {v.variantAttributes.map((va, idx) => {
                                    const name = attributes.find(a => a.id === va.attributeId)?.name || '';
                                    return (
                                      <span key={idx} className="bg-primary/5 border border-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                                        {name}: {va.value}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-bold justify-start sm:justify-end">
                              <span>
                                {locale === 'ar' ? 'سعر الجملة:' : 'Wholesale Price:'} <span className="text-emerald-700 font-black">{v.price} ج.م</span>
                              </span>
                              <span>
                                {locale === 'ar' ? 'سعر الشراء:' : 'Purchase Price:'} <span className="text-blue-750 font-black">{v.purchasePrice || 0} ج.م</span>
                              </span>
                              <span>
                                {locale === 'ar' ? 'أقل سعر للبيع:' : 'Lowest Retail Price:'} <span className="text-amber-700 font-black">{v.lowestPriceToSell || 0} ج.م</span>
                              </span>
                              <span>
                                {locale === 'ar' ? 'المخزون:' : 'Stock:'} <span className="text-slate-800 font-black">{v.stockQuantity}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-black text-rose-600 flex items-center gap-1.5 justify-end">
                    <span>{locale === 'ar' ? 'يجب عليك إضافة بديل واحد على الأقل للمنتج لحفظه بنجاح.' : 'You must configure at least one variant to create the product.'}</span>
                    <WarningIcon className="w-4 h-4 text-rose-500" />
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/95 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{locale === 'ar' ? 'جاري حفظ التغييرات...' : 'Saving changes...'}</span>
                  </>
                ) : (
                  <>
                    <span>{locale === 'ar' ? 'حفظ ونشر التغييرات' : 'Save & Publish Changes'}</span>
                    <CheckCircleIcon className="w-4 h-4 fill-white text-primary" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
