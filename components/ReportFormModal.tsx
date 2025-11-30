
import React from 'react';
import { Report, ReportCategory } from '../types';
import { CameraIcon, TrashIcon, XCircleIcon } from './icons';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<Report, 'id'> | Report) => void;
  initialData?: Report;
}

// Ensure exactly 4 slots for photos
const ensureSlots = (arr: string[] = []) => {
    const slots = [...arr];
    while (slots.length < 4) slots.push('');
    return slots.slice(0, 4);
};

const PhotoSlot: React.FC<{
    index: number;
    photo: string;
    onUpdate: (index: number, base64: string) => void;
    onRemove: (index: number) => void;
    label: string;
}> = ({ index, photo, onUpdate, onRemove, label }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) return;
            processFile(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                onUpdate(index, reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div 
            className={`relative border-2 border-dashed rounded-lg h-36 flex flex-col items-center justify-center transition-all duration-200 overflow-hidden group
                ${isDragging ? 'border-[var(--primary-500)] bg-[var(--primary-50)] scale-[1.02] shadow-md' : 'border-slate-300 bg-slate-50 hover:border-[var(--primary-400)] hover:bg-white'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !photo && inputRef.current?.click()}
        >
            {photo ? (
                <div className="relative w-full h-full">
                    <img src={photo} alt={label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                        title="حذف الصورة"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] font-medium text-center py-1.5 backdrop-blur-sm">
                        {label}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full p-2 text-center cursor-pointer">
                    <div className={`p-2.5 rounded-full mb-2 transition-colors duration-200 ${isDragging ? 'bg-[var(--primary-100)] text-[var(--primary-600)]' : 'bg-slate-100 text-slate-400 group-hover:bg-[var(--primary-50)] group-hover:text-[var(--primary-500)]'}`}>
                         <CameraIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-slate-700 font-semibold mb-1">{label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight px-2">اختر صورة أو قم بإفلاتها هنا</span>
                </div>
            )}
            <input 
                type="file" 
                ref={inputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
        </div>
    );
};

const ReportFormModal: React.FC<ReportFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = !!initialData;

    const getInitialFormData = React.useCallback(() => ({
        atm_name: initialData?.atm_name || '',
        atm_number: initialData?.atm_number || '',
        serial_number: initialData?.serial_number || '',
        governorate: initialData?.governorate || '',
        address: initialData?.address || '',
        maintenance_date: initialData?.maintenance_date ? new Date(initialData.maintenance_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        technical_report: initialData?.technical_report || '',
        notes: initialData?.notes || '',
        category: initialData?.category || [] as ReportCategory[],
    }), [initialData]);

    const [formData, setFormData] = React.useState(getInitialFormData());
    const [beforePhotos, setBeforePhotos] = React.useState<string[]>(ensureSlots(initialData?.before_photos));
    const [afterPhotos, setAfterPhotos] = React.useState<string[]>(ensureSlots(initialData?.after_photos));
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            setBeforePhotos(ensureSlots(initialData?.before_photos));
            setAfterPhotos(ensureSlots(initialData?.after_photos));
        }
    }, [isOpen, initialData, getInitialFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const categoryValue = value as ReportCategory;
        
        setFormData(prev => {
            if (checked) {
                return { ...prev, category: [...prev.category, categoryValue] };
            } else {
                return { ...prev, category: prev.category.filter(c => c !== categoryValue) };
            }
        });
    };

    const handlePhotoUpdate = (section: 'before' | 'after', index: number, base64: string) => {
        const setter = section === 'before' ? setBeforePhotos : setAfterPhotos;
        setter(prev => {
            const newPhotos = [...prev];
            newPhotos[index] = base64;
            return newPhotos;
        });
    };

    const handlePhotoRemove = (section: 'before' | 'after', index: number) => {
        const setter = section === 'before' ? setBeforePhotos : setAfterPhotos;
        setter(prev => {
            const newPhotos = [...prev];
            newPhotos[index] = '';
            return newPhotos;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const cleanBeforePhotos = beforePhotos.filter(p => p !== '');
        const cleanAfterPhotos = afterPhotos.filter(p => p !== '');

        let maintenanceDateIso: string;

        if (formData.maintenance_date) {
            // Add time to date to ensure proper sorting for new reports
            const dateParts = formData.maintenance_date.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            const now = new Date();
            const maintenanceDate = new Date(year, month, day, now.getHours(), now.getMinutes(), now.getSeconds());
            maintenanceDateIso = maintenanceDate.toISOString();
        } else {
            // Default to current time if date is cleared
            maintenanceDateIso = new Date().toISOString();
        }

        const submissionData = {
            ...formData,
            before_photos: cleanBeforePhotos,
            after_photos: cleanAfterPhotos,
            ...(isEditMode ? { id: initialData!.id } : {}),
            maintenance_date: maintenanceDateIso,
        };

        setTimeout(() => {
            onSubmit(submissionData as Report);
            setIsSubmitting(false);
            onClose();
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50 overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 relative flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isEditMode ? 'تعديل تقرير صيانة' : 'إضافة تقرير صيانة جديد'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="report-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم الماكينة</label>
                                <input type="text" name="atm_name" value={formData.atm_name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]" placeholder="مثال: ماكينة الفرع الرئيسي" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">رقم الماكينة (ID)</label>
                                <input type="text" name="atm_number" value={formData.atm_number} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]" placeholder="مثال: CAI-0123" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">الرقم المسلسل (S/N)</label>
                                <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]" placeholder="مثال: NBE-SN-999" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">تاريخ الصيانة</label>
                                <input type="date" name="maintenance_date" value={formData.maintenance_date} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">المحافظة</label>
                                <select name="governorate" value={formData.governorate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] bg-white">
                                    <option value="">اختر المحافظة</option>
                                    <option value="القاهرة">القاهرة</option>
                                    <option value="الجيزة">الجيزة</option>
                                    <option value="الإسكندرية">الإسكندرية</option>
                                    <option value="البحر الأحمر">البحر الأحمر</option>
                                    <option value="جنوب سيناء">جنوب سيناء</option>
                                    <option value="أسوان">أسوان</option>
                                    <option value="الأقصر">الأقصر</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">العنوان</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]" placeholder="العنوان التفصيلي" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">نوع الصيانة</label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-[var(--primary-300)] transition-colors">
                                    <input 
                                        type="checkbox" 
                                        name="category" 
                                        value={ReportCategory.CORRECTIVE} 
                                        checked={formData.category.includes(ReportCategory.CORRECTIVE)} 
                                        onChange={handleCategoryChange}
                                        className="w-4 h-4 text-[var(--primary-600)] rounded focus:ring-[var(--primary-500)]"
                                    />
                                    <span className="text-slate-700">{ReportCategory.CORRECTIVE}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-[var(--primary-300)] transition-colors">
                                    <input 
                                        type="checkbox" 
                                        name="category" 
                                        value={ReportCategory.MODERN} 
                                        checked={formData.category.includes(ReportCategory.MODERN)} 
                                        onChange={handleCategoryChange}
                                        className="w-4 h-4 text-[var(--primary-600)] rounded focus:ring-[var(--primary-500)]"
                                    />
                                    <span className="text-slate-700">{ReportCategory.MODERN}</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-sm">1</span>
                                    صور قبل الإصلاح (4 صور)
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {beforePhotos.map((photo, index) => (
                                        <PhotoSlot 
                                            key={`before-${index}`} 
                                            index={index} 
                                            photo={photo} 
                                            onUpdate={(idx, b64) => handlePhotoUpdate('before', idx, b64)} 
                                            onRemove={(idx) => handlePhotoRemove('before', idx)}
                                            label={`صورة رقم ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-sm">2</span>
                                    صور بعد الإصلاح (4 صور)
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {afterPhotos.map((photo, index) => (
                                        <PhotoSlot 
                                            key={`after-${index}`} 
                                            index={index} 
                                            photo={photo} 
                                            onUpdate={(idx, b64) => handlePhotoUpdate('after', idx, b64)} 
                                            onRemove={(idx) => handlePhotoRemove('after', idx)}
                                            label={`صورة رقم ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">التقرير الفني</label>
                                <textarea name="technical_report" value={formData.technical_report} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]" placeholder="وصف الأعمال التي تم تنفيذها بالتفصيل..."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">ملاحظات (اختياري)</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]" placeholder="أي ملاحظات إضافية..."></textarea>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button 
                        type="submit" 
                        form="report-form"
                        disabled={isSubmitting} 
                        className="px-6 py-2.5 text-sm font-medium text-white bg-[var(--primary-600)] rounded-lg hover:bg-[var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] disabled:bg-[var(--primary-400)] flex items-center gap-2 shadow-sm transition-all"
                    >
                        {isSubmitting && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isSubmitting ? 'جاري الحفظ...' : (isEditMode ? 'حفظ التعديلات' : 'إضافة التقرير')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportFormModal;
