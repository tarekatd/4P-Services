import React from 'react';
import { Report, ReportCategory } from '../types';
import { SearchIcon, ReportIcon, TagIcon, CalendarIcon, FunnelIcon } from './icons';
import SkeletonReportCard from './SkeletonReportCard';

interface BankDashboardProps {
  reports: Report[];
  onViewDetails: (report: Report) => void;
}

const ReportCard = React.forwardRef<HTMLDivElement, { report: Report; onViewDetails: (report: Report) => void }>(({ report, onViewDetails }, ref) => {
    const placeholderImage = 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';
    const displayImage = report.after_photos?.[0] || report.before_photos?.[0] || placeholderImage;
    const monthName = new Date(report.maintenance_date).toLocaleDateString('ar-EG', { month: 'long' });
    const [imageLoaded, setImageLoaded] = React.useState(false);

    return (
        <div 
            ref={ref}
            className="bg-white rounded-sm shadow-md border border-slate-200 overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
            onClick={() => onViewDetails(report)}
        >
            <div className="p-2 text-center flex-grow">
                <div className="space-y-1 mb-2">
                    <p className="text-[10px] font-bold text-white bg-emerald-600/90 text-center px-2 py-1 rounded-sm leading-tight">
                        {report.category.join(' / ')}
                    </p>
                    <p className="text-[10px] font-bold text-white bg-emerald-600/90 text-center px-2 py-1 rounded-sm leading-tight">
                        {monthName}
                    </p>
                </div>
                
                <h3 className="text-xs font-bold text-slate-700 leading-snug">{report.atm_name}</h3>
                <p className="text-xs text-slate-500">{report.atm_number}</p>
            </div>
            <div className="p-1 bg-slate-200 overflow-hidden relative h-32">
                 <div className={`absolute inset-0 bg-slate-100 flex items-center justify-center transition-opacity duration-500 z-10 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                     <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                 </div>
                <img 
                    src={displayImage} 
                    alt={report.atm_name} 
                    className={`w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
                    onLoad={() => setImageLoaded(true)}
                />
            </div>
        </div>
    );
});

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-start gap-4">
        <div className="bg-[var(--primary-100)] text-[var(--primary-600)] rounded-lg p-3 shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);


const BankDashboard: React.FC<BankDashboardProps> = ({ reports, onViewDetails }) => {
    // Search & Filter State
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [sortOption, setSortOption] = React.useState<string>('date-desc');
    const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

    // Advanced Filters
    const [dateFrom, setDateFrom] = React.useState('');
    const [dateTo, setDateTo] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState<string>('all');
    const [filterGovernorate, setFilterGovernorate] = React.useState<string>('all');

    const [visibleCount, setVisibleCount] = React.useState(24);
    const [isLoading, setIsLoading] = React.useState(true);
    
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

        return reports
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
                    report.address.toLowerCase().includes(lowercasedSearchTerm) ||
                    report.category.some(c => c.toLowerCase().includes(lowercasedSearchTerm))
                );
            })
            // FIX: Add explicit types to sort callback parameters to prevent type inference issues.
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

    const handleClearFilters = () => {
        setSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setFilterCategory('all');
        setFilterGovernorate('all');
    };

    React.useEffect(() => {
        setIsLoading(true);
        setVisibleCount(24);
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, sortOption, dateFrom, dateTo, filterCategory, filterGovernorate]);

    const observer = React.useRef<IntersectionObserver | null>(null);
    const lastReportElementRef = React.useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleCount < filteredAndSortedReports.length) {
                setVisibleCount(prevVisibleCount => prevVisibleCount + 24);
            }
        }, {});
        if (node && observer.current) observer.current.observe(node);
    }, [isLoading, filteredAndSortedReports.length, visibleCount]);

    const visibleReports = filteredAndSortedReports.slice(0, visibleCount);
    
    const overviewData = React.useMemo(() => {
        const total = reports.length;
        const corrective = reports.filter(r => r.category.includes(ReportCategory.CORRECTIVE)).length;
        const modern = reports.filter(r => r.category.includes(ReportCategory.MODERN)).length;

        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
        const reportsThisMonth = reports.filter(report => {
            const date = new Date(report.maintenance_date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            return monthKey === currentMonthKey;
        }).length;
        const currentMonthName = now.toLocaleDateString('ar-EG', { month: 'long' });

        return { total, corrective, modern, reportsThisMonth, currentMonthName };
    }, [reports]);


  return (
    <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">تقارير الصيانة للبنك</h1>

        <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">نظرة عامة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="إجمالي التقارير" 
                    value={overviewData.total} 
                    icon={<ReportIcon className="w-6 h-6"/>} 
                />
                <StatCard 
                    title={ReportCategory.CORRECTIVE} 
                    value={overviewData.corrective} 
                    icon={<TagIcon className="w-6 h-6"/>} 
                />
                <StatCard 
                    title={ReportCategory.MODERN} 
                    value={overviewData.modern} 
                    icon={<TagIcon className="w-6 h-6"/>} 
                />
                <StatCard 
                    title={`تقارير ${overviewData.currentMonthName}`}
                    value={overviewData.reportsThisMonth} 
                    icon={<CalendarIcon className="w-6 h-6"/>} 
                />
            </div>
        </div>
        
        <div>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">تصفح التقارير</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-8 border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full">
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400"/>
                        </span>
                        <input
                            type="text"
                            placeholder="بحث بالاسم، الرقم، التصنيف..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-md shadow-sm focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)]"
                            aria-label="Search reports"
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                         <button 
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg border shadow-sm transition-colors ${isFiltersOpen || activeFiltersCount > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                        >
                            <FunnelIcon className="w-5 h-5"/>
                            <span>فلترة {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                        </button>

                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full sm:w-auto py-2 pr-3 pl-8 border border-slate-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                        >
                            <option value="date-desc">الأحدث أولاً</option>
                            <option value="date-asc">الأقدم أولاً</option>
                            <option value="name-asc">اسم الماكينة (أ - ي)</option>
                            <option value="name-desc">اسم الماكينة (ي - أ)</option>
                            <option value="serial-asc">الرقم المسلسل (تصاعدي)</option>
                            <option value="serial-desc">الرقم المسلسل (تنازلي)</option>
                        </select>
                    </div>
                </div>

                {isFiltersOpen && (
                        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-down">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">من تاريخ</label>
                                <input 
                                    type="date" 
                                    value={dateFrom} 
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">إلى تاريخ</label>
                                <input 
                                    type="date" 
                                    value={dateTo} 
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">المحافظة</label>
                                <select 
                                    value={filterGovernorate} 
                                    onChange={(e) => setFilterGovernorate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
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
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                                >
                                    <option value="all">الكل</option>
                                    <option value={ReportCategory.CORRECTIVE}>الديكورات التصحيحية</option>
                                    <option value={ReportCategory.MODERN}>الديكورات الحديثة</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                                <button 
                                    onClick={handleClearFilters}
                                    className="text-sm text-red-600 hover:text-red-800 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    إعادة تعيين الفلاتر
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {isLoading ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-10">
                    {Array.from({ length: 18 }).map((_, index) => <SkeletonReportCard key={index} />)}
                </div>
            ) : visibleReports.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-10">
                    {visibleReports.map((report, index) => (
                        <ReportCard 
                            key={report.id}
                            report={report} 
                            onViewDetails={onViewDetails} 
                            ref={index === visibleReports.length - 1 ? lastReportElementRef : null}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
                    <p className="text-slate-500">لا توجد تقارير لعرضها حسب معايير البحث والفلترة المحددة.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default BankDashboard;