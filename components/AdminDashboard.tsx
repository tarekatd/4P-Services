import React from 'react';
import { Report, User, UserRole, ReportCategory } from '../types';
import { PlusIcon, CameraIcon, ReportIcon, UsersIcon, SearchIcon, DownloadIcon, UploadIcon, CalendarIcon, HashtagIcon, BuildingIcon, Cog8ToothIcon, CheckIcon, GripVerticalIcon, PaintBrushIcon, TagIcon, ChartBarIcon, ClipboardDocumentCheckIcon, TrashIcon, XCircleIcon, PencilSquareIcon, FunnelIcon } from './icons';
import ImportReportsModal from './ImportReportsModal';
import ReportFormModal from './ReportFormModal';
import SkeletonReportCard from './SkeletonReportCard';
import DatabaseConfigModal from './DatabaseConfigModal';
import { db } from '../services/database';

// Cloud Icon for the button
const CloudIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);


// --- PROPS INTERFACE ---
interface AdminDashboardProps {
  reports: Report[];
  onAddReport: (newReport: Omit<Report, 'id'> | Report) => void;
  onViewDetails: (report: Report) => void;
  users: User[];
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onBulkAddReports: (newReports: Omit<Report, 'id'>[]) => void;
  onDeleteReports: (reportIds: string[]) => void;
}

// --- CONFIRMATION MODAL ---
export const ConfirmationModal: React.FC<{
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

// --- WIDGET COMPONENTS ---

const StatsWidget: React.FC<{ reports: Report[] }> = ({ reports }) => {
    const summaryStats = React.useMemo(() => {
        const monthlyCounts = new Map<string, { name: string, count: number, date: Date }>();
        let correctiveCount = 0;
        let modernCount = 0;

        reports.forEach(report => {
            const date = new Date(report.maintenance_date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
            
            if (monthlyCounts.has(monthKey)) {
                monthlyCounts.get(monthKey)!.count++;
            } else {
                monthlyCounts.set(monthKey, { name: monthName, count: 1, date });
            }
            if (report.category.includes(ReportCategory.CORRECTIVE)) correctiveCount++;
            if (report.category.includes(ReportCategory.MODERN)) modernCount++;
        });

        const sortedMonths = Array.from(monthlyCounts.values())
            .sort((a, b) => b.date.getTime() - a.date.getTime());
        
        return {
          total: reports.length,
          corrective: correctiveCount,
          modern: modernCount,
          monthly: sortedMonths.slice(0, 3),
        };
    }, [reports]);

    const StatCard: React.FC<{ title: string; value: number | string; icon?: React.ReactNode }> = ({ title, value, icon }) => (
        <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200/80 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
            {icon && <div className="bg-red-100 text-red-600 rounded-full p-2.5">{icon}</div>}
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard 
                title="إجمالي التقارير"
                value={summaryStats.total}
                icon={<HashtagIcon className="w-6 h-6"/>}
            />
            <StatCard
                title={ReportCategory.CORRECTIVE}
                value={summaryStats.corrective}
                icon={<TagIcon className="w-6 h-6" />}
            />
            <StatCard
                title={ReportCategory.MODERN}
                value={summaryStats.modern}
                icon={<TagIcon className="w-6 h-6" />}
            />
            {summaryStats.monthly.map(({ name, count }) => (
                <StatCard 
                    key={name}
                    title={`تقارير ${name}`}
                    value={count}
                    icon={<CalendarIcon className="w-6 h-6"/>}
                />
            ))}
        </div>
    );
};

const ReportsWidget: React.FC<Pick<AdminDashboardProps, 'reports' | 'onViewDetails' | 'onAddReport' | 'onBulkAddReports' | 'onDeleteReports'>> = ({ reports, onViewDetails, onAddReport, onBulkAddReports, onDeleteReports }) => {
    const [isReportFormOpen, setIsReportFormOpen] = React.useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortOption, setSortOption] = React.useState<string>('date-desc');
    const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
    
    // Advanced Filters
    const [dateFrom, setDateFrom] = React.useState('');
    const [dateTo, setDateTo] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState<string>('all');
    const [filterGovernorate, setFilterGovernorate] = React.useState<string>('all');

    const [visibleCount, setVisibleCount] = React.useState(20);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSelectionMode, setIsSelectionMode] = React.useState(false);
    const [selectedReports, setSelectedReports] = React.useState<Set<string>>(new Set());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
    
    const ReportCard = React.forwardRef<HTMLDivElement, { report: Report; onViewDetails: (report: Report) => void; isSelectionMode: boolean; isSelected: boolean; onSelect: (id: string) => void; }>(({ report, onViewDetails, isSelectionMode, isSelected, onSelect }, ref) => {
        const placeholderImage = 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';
        const displayImage = report.after_photos?.[0] || report.before_photos?.[0] || placeholderImage;
        const [imageLoaded, setImageLoaded] = React.useState(false);
        
        const handleClick = (e: React.MouseEvent) => {
            if (isSelectionMode) {
                e.preventDefault();
                e.stopPropagation();
                onSelect(report.id);
            } else {
                onViewDetails(report);
            }
        };

        return (
            <div 
                ref={ref} 
                className={`relative bg-white rounded-sm shadow-md border overflow-hidden group transition-all duration-300 flex flex-col 
                    ${isSelectionMode ? 'cursor-pointer' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'} 
                    ${isSelected ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-200'}`} 
                onClick={handleClick}
            >
                {isSelectionMode && (
                    <div 
                        className={`absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 transform scale-100 group-hover:scale-110 
                            ${isSelected ? 'bg-red-600 text-white' : 'bg-white/60 backdrop-blur-sm ring-1 ring-slate-400 text-slate-600'}`}
                    >
                        <CheckIcon className="w-4 h-4" />
                    </div>
                )}
                <div className="p-2 text-center flex-grow">
                    <div className="space-y-1 mb-2">
                        <p className="text-[10px] font-bold text-white bg-emerald-600/90 text-center px-2 py-1 rounded-sm leading-tight">{report.category.join(' / ')}</p>
                        <p className="text-[10px] font-bold text-white bg-emerald-600/90 text-center px-2 py-1 rounded-sm leading-tight">{new Date(report.maintenance_date).toLocaleDateString('ar-EG', { month: 'long' })}</p>
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 leading-snug">{report.atm_name}</h3><p className="text-xs text-slate-500">{report.atm_number}</p>
                </div>
                <div className="p-1 bg-slate-200 overflow-hidden relative h-32">
                    <div className={`absolute inset-0 bg-slate-100 flex items-center justify-center transition-opacity duration-500 z-10 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                    </div>
                    <img 
                        src={displayImage} 
                        alt={report.atm_name} 
                        className={`w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                        onLoad={() => setImageLoaded(true)}
                    />
                    {isSelected && <div className="absolute inset-0 bg-red-500 bg-opacity-30 transition-opacity z-20"></div>}
                </div>
            </div>
        );
    });

    const handleClearFilters = () => {
        setSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setFilterCategory('all');
        setFilterGovernorate('all');
    };

    const governorateOptions = React.useMemo(() => {
        const uniqueGovernorates = Array.from(new Set(reports.map(r => r.governorate)));
        return uniqueGovernorates.sort((a: string, b: string) => a.localeCompare(b, 'ar'));
    }, [reports]);

    const activeFiltersCount = React.useMemo(() => {
        let count = 0;
        if (dateFrom) count++;
        if (dateTo) count++;
        if (filterCategory !== 'all') count++;
        if (filterGovernorate !== 'all') count++;
        return count;
    }, [dateFrom, dateTo, filterCategory, filterGovernorate]);

    const filteredAndSortedReports = React.useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return [...reports]
            .filter(report => {
                // Date Range Filter
                if (dateFrom || dateTo) {
                    const reportDate = new Date(report.maintenance_date).toISOString().split('T')[0];
                    if (dateFrom && reportDate < dateFrom) return false;
                    if (dateTo && reportDate > dateTo) return false;
                }
                
                // Category Filter
                if (filterCategory !== 'all') {
                    if (!report.category.includes(filterCategory as ReportCategory)) return false;
                }
                
                // Governorate Filter
                if (filterGovernorate !== 'all') {
                    if (report.governorate !== filterGovernorate) return false;
                }

                // Text Search
                if (!lowercasedSearchTerm) return true;
                return (
                    report.atm_name.toLowerCase().includes(lowercasedSearchTerm) ||
                    report.serial_number.toLowerCase().includes(lowercasedSearchTerm) ||
                    report.governorate.toLowerCase().includes(lowercasedSearchTerm) ||
                    report.atm_number.toLowerCase().includes(lowercasedSearchTerm) ||
                    report.address.toLowerCase().includes(lowercasedSearchTerm)
                );
            })
            .sort((a: Report, b: Report) => {
                switch (sortOption) {
                    case 'date-asc':
                        return new Date(a.maintenance_date).getTime() - new Date(b.maintenance_date).getTime();
                    case 'name-asc':
                        return a.atm_name.localeCompare(b.atm_name, 'ar');
                    case 'name-desc':
                        return b.atm_name.localeCompare(a.atm_name, 'ar');
                    case 'serial-asc':
                        return a.serial_number.localeCompare(b.serial_number, 'ar');
                    case 'serial-desc':
                        return b.serial_number.localeCompare(a.serial_number, 'ar');
                    case 'date-desc':
                    default:
                        return new Date(b.maintenance_date).getTime() - new Date(a.maintenance_date).getTime();
                }
            });
    }, [reports, searchTerm, sortOption, dateFrom, dateTo, filterCategory, filterGovernorate]);

     React.useEffect(() => {
        setIsLoading(true);
        setVisibleCount(20); // Reset visible items on filter change
        const timer = setTimeout(() => setIsLoading(false), 500); // Simulate loading
        return () => clearTimeout(timer);
    }, [searchTerm, sortOption, dateFrom, dateTo, filterCategory, filterGovernorate]);

    const observer = React.useRef<IntersectionObserver | null>(null);
    const lastReportElementRef = React.useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleCount < filteredAndSortedReports.length) {
                setVisibleCount(prevVisibleCount => prevVisibleCount + 20);
            }
        }, {});
        if (node && observer.current) observer.current.observe(node);
    }, [isLoading, filteredAndSortedReports.length, visibleCount]);

    const visibleReports = filteredAndSortedReports.slice(0, visibleCount);
    
    const handleExport = () => {
        const XLSX = (window as any).XLSX;
        // Use English headers that match the import template for easy re-importing
        const dataToExport = filteredAndSortedReports.map(r => ({
            atm_name: r.atm_name,
            atm_number: r.atm_number,
            serial_number: r.serial_number,
            governorate: r.governorate,
            address: r.address,
            maintenance_date: new Date(r.maintenance_date).toLocaleDateString('en-CA'), // YYYY-MM-DD
            category: r.category.join(', '),
            technical_report: r.technical_report,
            notes: r.notes
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
        XLSX.writeFile(workbook, "atm_maintenance_reports.xlsx");
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedReports);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedReports(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedReports.size === visibleReports.length) {
            setSelectedReports(new Set());
        } else {
            setSelectedReports(new Set(visibleReports.map(r => r.id)));
        }
    };

    const handleDeleteSelected = () => {
        onDeleteReports(Array.from(selectedReports));
        setSelectedReports(new Set());
        setIsConfirmModalOpen(false);
        setIsSelectionMode(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-slate-400"/>
                    </span>
                    <input
                        type="text"
                        placeholder="بحث بالاسم، الرقم، التصنيف..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-md shadow-sm focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)]"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md border shadow-sm transition-colors ${isFiltersOpen || activeFiltersCount > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                    >
                        <FunnelIcon className="w-5 h-5"/>
                        <span>فلترة {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                    </button>

                     {(activeFiltersCount > 0 || searchTerm) && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-2 py-2 px-3 rounded-md border border-slate-300 shadow-sm bg-white text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="مسح جميع الفلاتر والبحث"
                        >
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    )}

                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="py-2 pr-2 pl-8 border border-slate-300 rounded-md shadow-sm focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)] bg-white text-sm"
                    >
                        <option value="date-desc">الأحدث أولاً</option>
                        <option value="date-asc">الأقدم أولاً</option>
                        <option value="name-asc">اسم الماكينة (أ - ي)</option>
                        <option value="name-desc">اسم الماكينة (ي - أ)</option>
                    </select>

                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 py-2 px-3 rounded-md hover:bg-slate-50 shadow-sm transition-colors text-sm font-medium"
                    >
                        <DownloadIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">تصدير</span>
                    </button>
                    
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 py-2 px-3 rounded-md hover:bg-slate-50 shadow-sm transition-colors text-sm font-medium"
                    >
                        <UploadIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">استيراد</span>
                    </button>

                    <button 
                        onClick={() => setIsReportFormOpen(true)}
                        className="flex items-center gap-2 bg-[var(--primary-600)] text-white py-2 px-4 rounded-md hover:bg-[var(--primary-700)] shadow-md transition-colors text-sm font-medium"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">تقرير جديد</span>
                    </button>
                </div>
            </div>

            {isFiltersOpen && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-down">
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">من تاريخ</label>
                        <input 
                            type="date" 
                            value={dateFrom} 
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">إلى تاريخ</label>
                        <input 
                            type="date" 
                            value={dateTo} 
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">المحافظة</label>
                        <select 
                            value={filterGovernorate} 
                            onChange={(e) => setFilterGovernorate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] bg-white"
                        >
                            <option value="all">الكل</option>
                            {governorateOptions.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">التصنيف</label>
                        <select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)] bg-white"
                        >
                            <option value="all">الكل</option>
                            <option value={ReportCategory.CORRECTIVE}>الديكورات التصحيحية</option>
                            <option value={ReportCategory.MODERN}>الديكورات الحديثة</option>
                        </select>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between items-center bg-slate-100 p-2 rounded-md">
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        className={`text-sm px-3 py-1.5 rounded transition-colors ${isSelectionMode ? 'bg-[var(--primary-600)] text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
                    >
                        {isSelectionMode ? 'إلغاء التحديد' : 'تحديد متعدد'}
                    </button>
                    {isSelectionMode && (
                        <>
                            <button 
                                onClick={handleSelectAll}
                                className="text-sm px-3 py-1.5 bg-white text-slate-600 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                            >
                                {selectedReports.size === visibleReports.length ? 'إلغاء الكل' : 'تحديد الكل'}
                            </button>
                            <span className="text-sm text-slate-600 font-medium px-2">
                                تم تحديد {selectedReports.size}
                            </span>
                        </>
                    )}
                 </div>
                 {isSelectionMode && selectedReports.size > 0 && (
                     <button 
                        onClick={() => setIsConfirmModalOpen(true)}
                        className="text-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                     >
                         <TrashIcon className="w-4 h-4" />
                         حذف المحدد
                     </button>
                 )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, index) => <SkeletonReportCard key={index} />)}
                </div>
            ) : visibleReports.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {visibleReports.map((report, index) => (
                        <ReportCard 
                            key={report.id}
                            report={report} 
                            onViewDetails={onViewDetails}
                            ref={index === visibleReports.length - 1 ? lastReportElementRef : null}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedReports.has(report.id)}
                            onSelect={toggleSelection}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
                    <ReportIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">لا توجد تقارير</h3>
                    <p className="text-slate-500 mt-1">ابدأ بإضافة تقرير صيانة جديد.</p>
                </div>
            )}
            
            <ReportFormModal 
                isOpen={isReportFormOpen} 
                onClose={() => setIsReportFormOpen(false)} 
                onSubmit={onAddReport}
            />

            {isImportModalOpen && (
                <ImportReportsModal 
                    closeModal={() => setIsImportModalOpen(false)}
                    onImport={(reports) => {
                        onBulkAddReports(reports);
                        setIsImportModalOpen(false);
                    }}
                />
            )}
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteSelected}
                title="حذف التقارير المحددة"
                message={`هل أنت متأكد من رغبتك في حذف ${selectedReports.size} تقرير؟ لا يمكن التراجع عن هذا الإجراء.`}
            />
        </div>
    );
};

const UserForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<User, 'id'>) => void;
  initialData?: User;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = React.useState(initialData?.name || '');
    const [username, setUsername] = React.useState(initialData?.username || '');
    const [password, setPassword] = React.useState(initialData?.password || '');
    const [role, setRole] = React.useState<UserRole>(initialData?.role || UserRole.BANK);
    
    React.useEffect(() => {
        if (isOpen) {
             setName(initialData?.name || '');
             setUsername(initialData?.username || '');
             setPassword(initialData?.password || '');
             setRole(initialData?.role || UserRole.BANK);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, username, password, role });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50" onClick={onClose}>
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-800 mb-4">{initialData ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-[var(--primary-500)]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">اسم المستخدم</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-[var(--primary-500)]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                        <input type="text" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-[var(--primary-500)]" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">الدور</label>
                         <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 border rounded-lg">
                             <option value={UserRole.BANK}>مسئول بنك</option>
                             <option value={UserRole.ADMIN}>أدمن</option>
                         </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--primary-600)] text-white rounded-lg hover:bg-[var(--primary-700)]">حفظ</button>
                    </div>
                </form>
             </div>
        </div>
    );
};

const UsersWidget: React.FC<{ 
    users: User[]; 
    onAddUser: (u: Omit<User, 'id'>) => void;
    onUpdateUser: (u: User) => void;
    onDeleteUser: (id: string) => void;
}> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<User | undefined>(undefined);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) onDeleteUser(deleteId);
        setDeleteId(null);
    };

    const handleFormSubmit = (userData: Omit<User, 'id'>) => {
        if (editingUser) {
            onUpdateUser({ ...userData, id: editingUser.id });
        } else {
            onAddUser(userData);
        }
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingUser(undefined);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-slate-800">إدارة المستخدمين</h2>
                 <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 text-sm bg-[var(--primary-100)] text-[var(--primary-700)] px-3 py-1.5 rounded-lg hover:bg-[var(--primary-200)] transition-colors">
                     <PlusIcon className="w-4 h-4" />
                     <span>مستخدم جديد</span>
                 </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                            <th className="px-4 py-3">الاسم</th>
                            <th className="px-4 py-3">اسم المستخدم</th>
                            <th className="px-4 py-3">الدور</th>
                            <th className="px-4 py-3">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                                <td className="px-4 py-3 text-slate-500">{user.username}</td>
                                <td className="px-4 py-3 text-slate-500">
                                    <span className={`px-2 py-0.5 rounded text-xs ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.role === UserRole.ADMIN ? 'مدير' : 'بنك'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 flex items-center gap-2">
                                    <button onClick={() => handleEdit(user)} className="text-slate-400 hover:text-[var(--primary-600)]">
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(user.id)} className="text-slate-400 hover:text-red-600">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserForm 
                isOpen={isFormOpen} 
                onClose={handleClose} 
                onSubmit={handleFormSubmit} 
                initialData={editingUser} 
            />

            <ConfirmationModal 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={confirmDelete}
                title="حذف مستخدم"
                message="هل أنت متأكد من حذف هذا المستخدم؟"
            />
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = React.useState<'reports' | 'users'>('reports');
    const [isDbConfigOpen, setIsDbConfigOpen] = React.useState(false);

    return (
        <div className="container mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-slate-800">لوحة تحكم المشرف</h1>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-[var(--primary-100)] text-[var(--primary-700)] shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <ReportIcon className="w-4 h-4" />
                        التقارير
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-[var(--primary-100)] text-[var(--primary-700)] shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <UsersIcon className="w-4 h-4" />
                        المستخدمين
                    </button>
                     <button
                        onClick={() => setIsDbConfigOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50 border-s border-slate-200 ms-1 ps-3"
                        title="إعدادات قاعدة البيانات"
                    >
                        <CloudIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">السحابة</span>
                    </button>
                </div>
            </div>

            {activeTab === 'reports' ? (
                <div className="space-y-8 animate-fade-in">
                    <StatsWidget reports={props.reports} />
                    <ReportsWidget {...props} />
                </div>
            ) : (
                <div className="animate-fade-in">
                    <UsersWidget 
                        users={props.users} 
                        onAddUser={props.onAddUser} 
                        onUpdateUser={props.onUpdateUser} 
                        onDeleteUser={props.onDeleteUser}
                    />
                </div>
            )}
            
            <DatabaseConfigModal 
                isOpen={isDbConfigOpen}
                onClose={() => setIsDbConfigOpen(false)}
            />
        </div>
    );
};

export default AdminDashboard;