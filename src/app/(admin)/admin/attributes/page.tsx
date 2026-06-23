'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { attributeService } from '@/features/attributes/api/attributeService';
import { AttributeDto } from '@/shared/types/attribute';
import { toast } from 'react-hot-toast';

export default function AdminAttributesPage() {
  const { locale, dir } = useLocale();
  const [attributes, setAttributes] = useState<AttributeDto[]>([]);
  const [name, setName] = useState('');
  const [dataType, setDataType] = useState('text');
  
  // Edit mode states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDataType, setEditDataType] = useState('text');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAttributes = async () => {
    setIsLoading(true);
    try {
      const res = await attributeService.getAll();
      if (res.success && res.data) {
        setAttributes(res.data);
      } else {
        setAttributes([]);
      }
    } catch (err) {
      setAttributes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const res = await attributeService.create({
        name: name.trim(),
        dataType
      });

      if (res.success) {
        toast.success(locale === 'ar' ? 'تم إضافة الخاصية بنجاح!' : 'Attribute created successfully!');
        setName('');
        setDataType('text');
        loadAttributes();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل إضافة الخاصية' : 'Failed to create attribute'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    setIsSaving(true);
    try {
      const res = await attributeService.update(editingId, {
        name: editName.trim(),
        dataType: editDataType
      });

      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تعديل الخاصية بنجاح!' : 'Attribute updated successfully!');
        setEditingId(null);
        setEditName('');
        setEditDataType('text');
        loadAttributes();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تعديل الخاصية' : 'Failed to update attribute'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    const confirmDelete = window.confirm(
      locale === 'ar' 
        ? 'هل أنت متأكد من حذف هذه الخاصية؟ قد يؤثر ذلك على المنتجات المرتبطة بها.' 
        : 'Are you sure you want to delete this attribute? This may affect products using it.'
    );
    if (!confirmDelete) return;

    try {
      const res = await attributeService.delete(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم حذف الخاصية بنجاح!' : 'Attribute deleted successfully!');
        loadAttributes();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل حذف الخاصية' : 'Failed to delete attribute'));
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    }
  };

  const handleStartEdit = (attr: AttributeDto) => {
    setEditingId(attr.id);
    setEditName(attr.name);
    setEditDataType(attr.dataType);
  };

  const getDataTypeLabel = (type: string) => {
    const dataTypes: Record<string, { ar: string; en: string }> = {
      text: { ar: 'نصي', en: 'Text' },
      number: { ar: 'رقمي', en: 'Number' },
      color: { ar: 'لون', en: 'Color' },
      select: { ar: 'قائمة خيارات', en: 'Select Options' },
    };
    return dataTypes[type] ? (locale === 'ar' ? dataTypes[type].ar : dataTypes[type].en) : type;
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          {locale === 'ar' ? 'إدارة خصائص المنتجات' : 'Product Attributes Management'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
          {locale === 'ar' 
            ? 'قم بإنشاء وتحديد خصائص متغيرة للمنتجات (مثل المقاس، اللون، الخامة) لتسهيل تصنيف المنتجات وإضافة خيارات للمسوقين.' 
            : 'Create and configure flexible attributes (e.g. Size, Color, Material) to configure product variants.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create / Edit Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-right space-y-4 h-fit">
          <h4 className="font-black text-slate-800 text-base border-b border-slate-100 pb-3">
            {editingId 
              ? (locale === 'ar' ? 'تعديل الخاصية' : 'Edit Attribute')
              : (locale === 'ar' ? 'إضافة خاصية جديدة' : 'Add New Attribute')}
          </h4>

          <form onSubmit={editingId ? handleUpdateAttribute : handleCreateAttribute} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600">
                {locale === 'ar' ? 'اسم الخاصية:' : 'Attribute Name:'}
              </label>
              <input
                type="text"
                required
                value={editingId ? editName : name}
                onChange={(e) => editingId ? setEditName(e.target.value) : setName(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: المقاس، اللون' : 'Example: Size, Color'}
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-black text-slate-600">
                {locale === 'ar' ? 'نوع البيانات:' : 'Data Type:'}
              </label>
              <select
                value={editingId ? editDataType : dataType}
                onChange={(e) => editingId ? setEditDataType(e.target.value) : setDataType(e.target.value)}
                className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
              >
                <option value="text">{locale === 'ar' ? 'نص (Text)' : 'Text'}</option>
                <option value="number">{locale === 'ar' ? 'رقم (Number)' : 'Number'}</option>
                <option value="color">{locale === 'ar' ? 'لون (Color)' : 'Color'}</option>
                <option value="select">{locale === 'ar' ? 'قائمة خيارات (Select)' : 'Select Options'}</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving || (editingId ? !editName.trim() : !name.trim())}
                className={`py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none ${
                  editingId ? 'w-2/3' : 'w-full'
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <span>
                    {editingId 
                      ? (locale === 'ar' ? '💾 حفظ التعديلات' : '💾 Save Changes') 
                      : (locale === 'ar' ? '➕ إضافة خاصية' : '➕ Add Attribute')}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Attributes Listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 text-right">
              <h3 className="font-black text-slate-800 text-sm">
                {locale === 'ar' ? 'الخصائص المسجلة حالياً' : 'Current Registered Attributes'}
              </h3>
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-sm font-bold text-slate-400 animate-pulse">
                {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : attributes.length === 0 ? (
              <div className="p-10 text-center text-sm font-bold text-slate-400">
                {locale === 'ar' ? 'لا توجد خصائص مسجلة بعد' : 'No attributes registered yet'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-right">
                {attributes.map((attr) => (
                  <div key={attr.id} className="p-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(attr)}
                        className="px-3 py-1.5 rounded-xl text-xs font-black border border-slate-200 hover:border-primary hover:text-primary transition-all bg-white cursor-pointer"
                      >
                        ✏️ {locale === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDeleteAttribute(attr.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-black border border-slate-200 hover:border-red-500 hover:text-red-500 transition-all bg-white cursor-pointer"
                      >
                        🗑️ {locale === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-800">
                        {attr.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-extrabold flex items-center justify-end gap-1.5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] border border-slate-200">
                          {getDataTypeLabel(attr.dataType)}
                        </span>
                        <span>{locale === 'ar' ? 'نوع البيانات:' : 'Type:'}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
