'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { bannerService } from '@/features/banners/api/bannerService';
import { BannerDto } from '@/shared/types/banner';
import { toast } from 'react-hot-toast';
import BannerImageCropper from '@/shared/components/BannerImageCropper';
import { env } from '@/shared/config/env';
import { PlusIcon, ImageIcon, TrashIcon, CloseIcon, SaveIcon } from '@/shared/components/Icons';

export default function AdminBannersPage() {
  const { locale, dir } = useLocale();
  const [banners, setBanners] = useState<BannerDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const res = await bannerService.getAll();
      if (res.success && res.data) {
        setBanners(res.data);
      } else {
        setBanners([]);
      }
    } catch (err: any) {
      toast.error(locale === 'ar' ? 'فشل تحميل الإعلانات البانر' : 'Failed to load banners');
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateModal = () => {
    setTitle('');
    setCroppedFile(null);
    setIsCreateOpen(true);
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(locale === 'ar' ? 'يرجى إدخال عنوان الإعلان' : 'Please enter banner title');
      return;
    }
    if (!croppedFile) {
      toast.error(locale === 'ar' ? 'يرجى اختيار وقص صورة الإعلان' : 'Please select and crop banner image');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('file', croppedFile);

      const res = await bannerService.create(formData);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم إضافة إعلان البانر بنجاح!' : 'Banner added successfully!');
        setIsCreateOpen(false);
        loadBanners();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل إضافة إعلان البانر' : 'Failed to add banner'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل إضافة إعلان البانر' : 'Failed to add banner');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    const confirmDelete = window.confirm(
      locale === 'ar'
        ? 'هل أنت متأكد من رغبتك في حذف هذا البانر نهائياً؟'
        : 'Are you sure you want to permanently delete this banner?'
    );
    if (!confirmDelete) return;

    try {
      const res = await bannerService.delete(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم حذف البانر بنجاح' : 'Banner deleted successfully');
        loadBanners();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل حذف البانر' : 'Failed to delete banner'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل حذف البانر' : 'Failed to delete banner');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const apiBase = env.apiUrl.replace(/\/api$/, '');
    const cleanUrl = path.startsWith('/') ? path.slice(1) : path;
    return `${apiBase}/${cleanUrl}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            {locale === 'ar' ? 'إدارة الإعلانات البانر' : 'Banners Management'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
            {locale === 'ar'
              ? 'أضف إعلانات بانر جديدة لتظهر للمستخدمين والمسوقين في الواجهة الرئيسية للتحكم بالعروض التسويقية.'
              : 'Add new wide banner ads to show up on the main home screen interface.'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
        >
          <PlusIcon className="w-4 h-4" />
          <span>{locale === 'ar' ? 'إضافة بانر جديد' : 'Add New Banner'}</span>
        </button>
      </div>

      {/* Banners Display Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-bold text-slate-400 animate-pulse">
          {locale === 'ar' ? 'جاري تحميل الإعلانات...' : 'Loading banners...'}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400 space-y-3 flex flex-col items-center">
          <ImageIcon className="w-14 h-14 text-slate-300" />
          <p className="text-sm font-black">
            {locale === 'ar' ? 'لا توجد إعلانات بانر مضافة حالياً' : 'No banners uploaded yet'}
          </p>
          <p className="text-xs font-bold text-slate-400/80">
            {locale === 'ar' ? 'انقر على إضافة بانر جديد لتسجيل إعلان تسويقي جديد.' : 'Click "Add New Banner" to create your first promotion.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Banner Image Container with aspect ratio 3:1 */}
              <div className="relative w-full aspect-[3/1] bg-slate-100 border-b border-slate-150 overflow-hidden">
                <img
                  src={getImageUrl(banner.imageUrl)}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
                />
              </div>

              {/* Banner Details */}
              <div className="p-5 flex justify-between items-center bg-slate-50/50 mt-auto text-right">
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 text-sm sm:text-base">{banner.title}</h4>
                  <p className="text-[10px] font-mono text-slate-400 select-all">ID: {banner.id}</p>
                </div>
                <button
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>{locale === 'ar' ? 'حذف' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Banner Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200/50 text-right animate-scaleIn my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">
                {locale === 'ar' ? 'إضافة إعلان بانر جديد' : 'Add New Banner Advertisement'}
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600">
                  {locale === 'ar' ? 'عنوان الإعلان البانر:' : 'Banner Title / Campaign:'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: عروض الصيف الكبرى 50٪' : 'Example: Big Summer Sale 50% Off'}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 block">
                  {locale === 'ar' ? 'صورة الإعلان (نسبة 3:1):' : 'Banner Image (3:1 Aspect Ratio):'}
                </label>
                
                {/* Visual Image Cropper Component */}
                <BannerImageCropper onCrop={setCroppedFile} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !croppedFile}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{locale === 'ar' ? 'جاري إضافة البانر...' : 'Adding banner...'}</span>
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4" />
                    <span>{locale === 'ar' ? 'حفظ وإضافة البانر' : 'Save and Add Banner'}</span>
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
