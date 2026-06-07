'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/shared/context/LocaleContext';
import { supervisorService } from '@/features/supervisors/api/supervisorService';
import { SupervisorDto } from '@/shared/types/supervisor';
import { toast } from 'react-hot-toast';

export default function AdminSupervisorsPage() {
  const { locale, dir } = useLocale();
  const [supervisors, setSupervisors] = useState<SupervisorDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<SupervisorDto | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSupervisors = async () => {
    setIsLoading(true);
    try {
      const res = await supervisorService.getAll(searchQuery, currentPage, pageSize);
      if (res.success && res.data) {
        setSupervisors(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      } else {
        setSupervisors([]);
        setTotalPages(1);
      }
    } catch (err) {
      setSupervisors([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisors();
  }, [currentPage, searchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setIsCreateOpen(true);
  };

  const openEditModal = (sup: SupervisorDto) => {
    setEditingSupervisor(sup);
    setFirstName(sup.firstName);
    setLastName(sup.lastName);
    setPhoneNumber(sup.phoneNumber || '');
    setIsEditOpen(true);
  };

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error(locale === 'ar' ? 'يرجى إدخال جميع الحقول الإلزامية' : 'Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await supervisorService.create({
        firstName,
        lastName,
        email,
        password,
        phoneNumber: phoneNumber || undefined
      });

      if (res.success) {
        toast.success(locale === 'ar' ? 'تم إضافة المشرف بنجاح!' : 'Supervisor created successfully!');
        setIsCreateOpen(false);
        loadSupervisors();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل إضافة المشرف' : 'Failed to add supervisor'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل إضافة المشرف' : 'Failed to add supervisor');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupervisor || !firstName || !lastName) return;

    setIsSubmitting(true);
    try {
      const res = await supervisorService.update(editingSupervisor.id, {
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined
      });

      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تحديث بيانات المشرف بنجاح!' : 'Supervisor updated successfully!');
        setIsEditOpen(false);
        setEditingSupervisor(null);
        loadSupervisors();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل تعديل المشرف' : 'Failed to update supervisor'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل تعديل المشرف' : 'Failed to update supervisor');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupervisor = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا المشرف نهائياً؟' : 'Are you sure you want to permanently delete this supervisor?')) return;

    try {
      const res = await supervisorService.delete(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم حذف المشرف بنجاح' : 'Supervisor deleted successfully');
        loadSupervisors();
      } else {
        toast.error(res.message || (locale === 'ar' ? 'فشل حذف المشرف' : 'Failed to delete supervisor'));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل حذف المشرف' : 'Failed to delete supervisor');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await supervisorService.toggleActive(id);
      if (res.success) {
        toast.success(locale === 'ar' ? 'تم تحديث حالة المشرف بنجاح' : 'Supervisor status updated successfully');
        loadSupervisors();
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || (locale === 'ar' ? 'فشل تحديث حالة المشرف' : 'Failed to update supervisor status');
      toast.error(locale === 'ar' ? `خطأ: ${errMsg}` : `Error: ${errMsg}`);
    }
  };

  const filteredSupervisors = supervisors;

  return (
    <div className="space-y-8 animate-fadeIn" dir={dir}>
      <div className="text-right border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            {locale === 'ar' ? 'إدارة المشرفين' : 'Supervisors Management'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-bold mt-1">
            {locale === 'ar' ? 'أضف مشرفين جدد، عدل صلاحياتهم، وقم بتمكينهم أو تعطيلهم للتحكم بالنظام.' : 'Create, update, delete, and control supervisors access to the system.'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
        >
          {locale === 'ar' ? '➕ إضافة مشرف جديد' : '➕ Add New Supervisor'}
        </button>
      </div>

      {/* Supervisors List Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden text-right">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-black text-slate-800 text-sm shrink-0">
            {locale === 'ar' ? 'قائمة المشرفين' : 'Supervisors List'}
          </h3>
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث باسم المشرف، البريد...' : 'Search by name, email...'}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-right pr-9 pl-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-sm font-bold text-slate-400 animate-pulse">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : supervisors.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {locale === 'ar' ? 'لا يوجد مشرفين مسجلين بعد' : 'No supervisors found'}
          </div>
        ) : filteredSupervisors.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-slate-400">
            {locale === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matches found for your search'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-bold text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase">
                  <th className="p-4 text-right">{locale === 'ar' ? 'المشرف' : 'Supervisor'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'رقم الهاتف' : 'Phone'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'تاريخ التسجيل' : 'Date Joined'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-4 text-center">{locale === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSupervisors.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3 justify-start text-right">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-primary font-black shrink-0">
                          👤
                        </div>
                        <div>
                          <p className="text-slate-900 font-black">{sup.firstName} {sup.lastName}</p>
                          <p className="text-[9px] text-slate-400 font-mono select-all">{sup.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">{sup.email}</td>
                    <td className="p-4 text-slate-500">{sup.phoneNumber || (locale === 'ar' ? 'بدون رقم' : 'No Phone')}</td>
                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(sup.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(sup.id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black border transition-all ${
                          sup.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {sup.isActive ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Disabled')}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center items-center">
                        <button
                          onClick={() => openEditModal(sup)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors text-xs font-black border border-amber-200"
                        >
                          ✏️ {locale === 'ar' ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDeleteSupervisor(sup.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-xs font-black border border-rose-200"
                        >
                          🗑️ {locale === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && supervisors.length > 0 && (
          <div className="flex items-center justify-center gap-4 p-6 border-t border-slate-100 bg-slate-50">
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
              disabled={currentPage >= totalPages || totalPages === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs sm:text-sm disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {locale === 'ar' ? '⬅️ الصفحة التالية' : 'Next ➡️'}
            </button>
          </div>
        )}
      </div>

      {/* Creation / Editing Modal */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200/50 text-right animate-scaleIn my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">
                {isCreateOpen
                  ? (locale === 'ar' ? 'إضافة مشرف جديد' : 'Add New Supervisor')
                  : (locale === 'ar' ? 'تعديل بيانات المشرف' : 'Edit Supervisor Details')}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                  setEditingSupervisor(null);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-700 text-xs font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={isCreateOpen ? handleCreateSupervisor : handleUpdateSupervisor} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'الاسم الأول:' : 'First Name:'}</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'اسم العائلة:' : 'Last Name:'}</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {isCreateOpen && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'كلمة المرور:' : 'Password:'}</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600">{locale === 'ar' ? 'رقم الهاتف (اختياري):' : 'Phone Number (Optional):'}</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <span>💾 {locale === 'ar' ? 'حفظ البيانات' : 'Save Changes'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
