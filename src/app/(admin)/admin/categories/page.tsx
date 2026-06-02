'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { categoryService } from '@/features/categories/api/categoryService';
import { CategoryDto } from '@/shared/types/category';
import { toast } from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const { locale, dir } = useLocale();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<number | ''>('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.getAll();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr || !newCatNameEn) return;
    setIsAdding(true);
    try {
      const res = await categoryService.create({
        name: newCatNameAr,
        nameEn: newCatNameEn,
        parentCategoryId: parentCategoryId !== '' ? Number(parentCategoryId) : null
      });

      if (res.success) {
        toast.success(locale === 'ar' ? 'تم إضافة القسم بنجاح!' : 'Category added successfully!');
        setNewCatNameAr('');
        setNewCatNameEn('');
        setParentCategoryId('');
        loadCategories();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل إضافة القسم' : 'Failed to add category'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ أثناء إضافة القسم: ${err.message}` : `Error adding category: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const res = await categoryService.toggleActive(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تحديث حالة القسم بنجاح' : 'Category status updated successfully');
        loadCategories();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تغيير حالة النشاط' : 'Failed to change category status'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          {locale === 'ar' ? 'إدارة الأقسام والتصنيفات' : 'Categories Management'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {locale === 'ar' ? 'أضف أقساماً جديدة لتصنيف المنتجات وهيكلتها بشكل شجري مع إمكانية تفعيلها أو إيقافها للمسوقين.' : 'Create parent-child nested categories to structure catalog filters.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-right space-y-4 h-fit">
          <h4 className="font-black text-slate-800 text-base border-b border-slate-100 pb-3">
            {locale === 'ar' ? 'إضافة قسم جديد' : 'Add Category'}
          </h4>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'اسم القسم (بالعربية):' : 'Name (Arabic):'}</label>
              <input
                type="text"
                required
                value={newCatNameAr}
                onChange={(e) => setNewCatNameAr(e.target.value)}
                placeholder="مثال: مستحضرات تجميل"
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'اسم القسم (بالإنجليزية):' : 'Name (English):'}</label>
              <input
                type="text"
                required
                value={newCatNameEn}
                onChange={(e) => setNewCatNameEn(e.target.value)}
                placeholder="Example: Cosmetics"
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-black text-slate-600">
                {locale === 'ar' ? 'القسم الأب (اختياري):' : 'Parent Category (Optional):'}
              </label>
              <select
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
              >
                <option value="">{locale === 'ar' ? 'بدون قسم أب (قسم رئيسي)' : 'None (Root Category)'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === 'ar' ? c.name : c.nameEn || c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isAdding || !newCatNameAr || !newCatNameEn}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isAdding ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{locale === 'ar' ? 'جاري الإضافة...' : 'Adding...'}</span>
                </>
              ) : (
                <span>➕ {locale === 'ar' ? 'إضافة القسم الجديد' : 'Add Category'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Categories Listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 text-right">
              <h3 className="font-black text-slate-800 text-sm">
                {locale === 'ar' ? 'الأقسام المتاحة والترتيب الهرمي' : 'Active Categories Hierarchy'}
              </h3>
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-sm font-bold text-slate-400 animate-pulse">
                {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : categories.length === 0 ? (
              <div className="p-10 text-center text-sm font-bold text-slate-400">
                {locale === 'ar' ? 'لا توجد أقسام مسجلة بعد' : 'No categories found'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-right">
                {categories.map((cat) => {
                  // Resolve parent category info
                  const parentCat = cat.parentCategoryId
                    ? categories.find(c => c.id === cat.parentCategoryId)
                    : null;
                  
                  return (
                    <div key={cat.id} className="p-5 flex justify-between items-center">
                      <button
                        onClick={() => handleToggleActive(cat.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-black border transition-all ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}
                      >
                        {cat.isActive
                          ? (locale === 'ar' ? 'نشط (تعطيل)' : 'Active (Disable)')
                          : (locale === 'ar' ? 'غير نشط (تفعيل)' : 'Inactive (Enable)')}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-base font-black text-slate-800">
                            {cat.name}
                          </span>
                          {parentCat && (
                            <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded-full border border-slate-200 font-bold">
                              {locale === 'ar' ? `تابع لـ: ${parentCat.name}` : `Sub of: ${parentCat.nameEn || parentCat.name}`}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-bold">
                          {cat.nameEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
