import React from 'react';
import { Report, User, UserRole } from '../types';
import { ArrowRightIcon, PencilSquareIcon, TrashIcon } from './icons';

// --- Locally defined icons to avoid modifying other files ---

const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const ZoomInIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
    </svg>
);

const ZoomOutIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
    </svg>
);

const ResetZoomIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.992-4.993m-4.993 0l-3.181 3.183A8.25 8.25 0 004.5 16.5l3.182-3.182z" />
    </svg>
);


// --- CONFIRMATION MODAL ---
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-[60]"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrashIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 id="confirmation-title" className="text-2xl font-semibold text-slate-800">{title}</h2>
          <p className="text-slate-500 mt-2">{message}</p>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
          >
            إلغاء
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <TrashIcon className="w-4 h-4 me-2"/>
            تأكيد الحذف
          </button>
        </div>
      </div>
    </div>
  );
};


interface ReportDetailsScreenProps {
  report: Report;
  onBack: () => void;
  user: User | null;
  onEdit: (report: Report) => void;
  onDelete: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div>
        <h3 className="text-sm font-medium text-slate-500">{label}</h3>
        <p className="text-base text-slate-800 font-medium">{value}</p>
    </div>
);

const PhotoGallery: React.FC<{ title: string; photos: string[]; onPhotoClick: (photos: string[], index: number) => void }> = ({ title, photos, onPhotoClick }) => (
    <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>
        {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                    <button 
                        key={index} 
                        onClick={() => onPhotoClick(photos, index)}
                        aria-label={`View image ${index + 1} for ${title}`}
                        className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] rounded-lg group"
                    >
                        <img 
                            src={photo} 
                            alt={`${title} ${index + 1}`} 
                            className="w-full h-40 object-cover rounded-lg shadow-sm border border-slate-200 group-hover:scale-105 transition-transform duration-300" 
                        />
                    </button>
                ))}
            </div>
        ) : (
            <p className="text-slate-500">لا توجد صور متاحة.</p>
        )}
    </div>
);

const ReportDetailsScreen: React.FC<ReportDetailsScreenProps> = ({ report, onBack, user, onEdit, onDelete }) => {
  const [lightboxState, setLightboxState] = React.useState<{ photos: string[]; currentIndex: number } | null>(null);
  const [zoomState, setZoomState] = React.useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const panStart = React.useRef({ x: 0, y: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const touchStartRef = React.useRef<number | null>(null);
  const [imageTranslateX, setImageTranslateX] = React.useState(0);
  const [isSwiping, setIsSwiping] = React.useState(false);

  const openLightbox = (photos: string[], index: number) => {
    setLightboxState({ photos, currentIndex: index });
  };

  const closeLightbox = React.useCallback(() => {
    setLightboxState(null);
    setZoomState({ scale: 1, x: 0, y: 0 });
  }, []);

  const resetZoom = () => setZoomState({ scale: 1, x: 0, y: 0 });

  const zoomIn = () => setZoomState(prev => ({ ...prev, scale: Math.min(prev.scale * 1.5, 8) }));
  
  const zoomOut = () => setZoomState(prev => {
      const newScale = Math.max(prev.scale / 1.5, 1);
      if (newScale === 1) return { scale: 1, x: 0, y: 0 };
      return { ...prev, scale: newScale };
  });

  const goToIndex = React.useCallback((index: number) => {
      if (!lightboxState) return;
      const newIndex = (index + lightboxState.photos.length) % lightboxState.photos.length;
      resetZoom();
      setLightboxState(prevState => ({ ...prevState!, currentIndex: newIndex }));
  }, [lightboxState]);

  const goToNext = React.useCallback(() => {
      if (lightboxState) goToIndex(lightboxState.currentIndex + 1);
  }, [lightboxState, goToIndex]);

  const goToPrev = React.useCallback(() => {
      if (lightboxState) goToIndex(lightboxState.currentIndex - 1);
  }, [lightboxState, goToIndex]);

  React.useEffect(() => {
    if (!lightboxState) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxState, goToNext, goToPrev, closeLightbox]);

  const handlePanStart = (e: React.MouseEvent) => {
    if (zoomState.scale <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    panStart.current = { x: e.clientX - zoomState.x, y: e.clientY - zoomState.y };
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setZoomState(prev => ({ ...prev, x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y }));
  };

  const handlePanEnd = () => setIsPanning(false);
  
  const handleWheelZoom = (e: React.WheelEvent<HTMLImageElement>) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const { deltaY, clientX, clientY } = e;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    
    const newScale = deltaY < 0 ? zoomState.scale * scaleFactor : zoomState.scale / scaleFactor;
    const clampedScale = Math.min(Math.max(1, newScale), 8);

    if (clampedScale === zoomState.scale) return;
    if (clampedScale === 1) { resetZoom(); return; }

    const mouseX = clientX - left;
    const mouseY = clientY - top;
    const scaleChange = clampedScale / zoomState.scale;
    const newX = zoomState.x + (1 - scaleChange) * (mouseX - zoomState.x);
    const newY = zoomState.y + (1 - scaleChange) * (mouseY - zoomState.y);

    setZoomState({ scale: clampedScale, x: newX, y: newY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if (zoomState.scale > 1) return;
      touchStartRef.current = e.targetTouches[0].clientX;
      setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!isSwiping || touchStartRef.current === null) return;
      const currentX = e.targetTouches[0].clientX;
      const diff = currentX - touchStartRef.current;
      setImageTranslateX(diff);
  };

  const handleTouchEnd = () => {
      if (!isSwiping) return;
      const swipeThreshold = 50;
      if (imageTranslateX < -swipeThreshold) goToNext();
      else if (imageTranslateX > swipeThreshold) goToPrev();
      setImageTranslateX(0);
      touchStartRef.current = null;
      setIsSwiping(false);
  };
  
  const confirmDelete = () => {
      onDelete();
      setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="container mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
          <div className="flex justify-between items-start mb-6">
              <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--primary-700)]">{report.atm_name}</h1>
                  <p className="text-slate-500 mt-1">الرقم المسلسل: {report.serial_number}</p>
              </div>
               <div className="flex items-center gap-3">
                  {user?.role === UserRole.ADMIN && (
                      <>
                          <button
                              onClick={() => onEdit(report)}
                              className="bg-[var(--primary-100)] text-[var(--primary-700)] font-semibold py-2 px-4 rounded-md hover:bg-[var(--primary-200)] transition-colors flex items-center gap-2"
                              aria-label="تعديل التقرير"
                          >
                              <PencilSquareIcon className="w-5 h-5" />
                              <span>تعديل</span>
                          </button>
                          <button
                              onClick={() => setIsDeleteModalOpen(true)}
                              className="bg-red-50 text-red-600 font-semibold py-2 px-4 rounded-md hover:bg-red-100 transition-colors flex items-center gap-2"
                              aria-label="حذف التقرير"
                          >
                              <TrashIcon className="w-5 h-5" />
                              <span>حذف</span>
                          </button>
                      </>
                  )}
                  <button
                      onClick={onBack}
                      className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-md hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                      <ArrowRightIcon className="w-4 h-4" />
                      <span>عودة</span>
                  </button>
              </div>
          </div>
          
          <div className="border-t border-slate-200 pt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
              <DetailItem label="رقم الماكينة" value={report.atm_number} />
              <DetailItem label="المحافظة" value={report.governorate} />
              <DetailItem label="العنوان" value={report.address} />
              <DetailItem label="التصنيف" value={report.category.join('، ')} />
              <DetailItem label="تاريخ الصيانة" value={new Date(report.maintenance_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })} />
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">التقرير الفني</h2>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-200 whitespace-pre-wrap">{report.technical_report}</p>
          </div>

          {report.notes && (
              <div className="mt-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-3">الملاحظات</h2>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-200 whitespace-pre-wrap">{report.notes}</p>
              </div>
          )}
          
          <div className="mt-8 border-t border-slate-200 pt-6 space-y-8">
              <PhotoGallery title="صور قبل الإصلاح" photos={report.before_photos} onPhotoClick={openLightbox} />
              <PhotoGallery title="صور بعد الإصلاح" photos={report.after_photos} onPhotoClick={openLightbox} />
          </div>
        </div>
      </div>

      {lightboxState && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center p-4 z-50 select-none"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery lightbox"
        >
          <div 
            className="relative flex-grow w-full flex items-center justify-center overflow-hidden" 
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img 
              key={lightboxState.currentIndex}
              src={lightboxState.photos[lightboxState.currentIndex]} 
              alt={`عرض مكبر ${lightboxState.currentIndex + 1}`}
              className="block max-w-[95vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
              style={{
                  transform: `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale}) translateX(${imageTranslateX}px)`,
                  cursor: zoomState.scale > 1 ? (isPanning ? 'grabbing' : 'grab') : (isSwiping ? 'grabbing' : 'grab'),
                  transition: isSwiping || isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                  touchAction: 'none',
              }}
              onClick={e => e.stopPropagation()}
              onMouseDown={handlePanStart}
              onWheel={handleWheelZoom}
            />
          </div>

          {lightboxState.photos.length > 1 && (
            <div className="flex-shrink-0 w-full max-w-xl p-4">
              <div className="flex justify-center items-center gap-2 overflow-x-auto">
                {lightboxState.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goToIndex(index); }}
                    className={`w-16 h-12 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white ${lightboxState.currentIndex === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    aria-label={`Go to image ${index + 1}`}
                  >
                    <img src={photo} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="flex flex-col gap-2 bg-black/40 p-1.5 rounded-lg backdrop-blur-sm">
                <button onClick={(e) => { e.stopPropagation(); zoomIn(); }} className="text-white p-2 hover:bg-white/20 rounded-md transition-colors" aria-label="تكبير"><ZoomInIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); zoomOut(); }} className="text-white p-2 hover:bg-white/20 rounded-md transition-colors" aria-label="تصغير"><ZoomOutIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); resetZoom(); }} className="text-white p-2 hover:bg-white/20 rounded-md transition-colors" aria-label="إعادة تعيين التكبير"><ResetZoomIcon /></button>
            </div>
            <button onClick={closeLightbox} className="bg-black/40 text-white rounded-full p-2 hover:bg-white/30 transition-colors backdrop-blur-sm" aria-label="إغلاق">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          {lightboxState.photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goToPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-white/30 transition-colors backdrop-blur-sm" aria-label="الصورة السابقة">
                <ChevronLeftIcon className="w-8 h-8" />
              </button>
              
              <button onClick={(e) => { e.stopPropagation(); goToNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-white/30 transition-colors backdrop-blur-sm" aria-label="الصورة التالية">
                <ChevronRightIcon className="w-8 h-8" />
              </button>

              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm" aria-live="polite">
                {lightboxState.currentIndex + 1} / {lightboxState.photos.length}
              </div>
            </>
          )}
        </div>
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="حذف التقرير"
        message="هل أنت متأكد من رغبتك في حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </>
  );
};

export default ReportDetailsScreen;