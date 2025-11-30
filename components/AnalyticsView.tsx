import React from 'react';
import { Report, ReportCategory } from '../types';
import { ChartBarIcon, TagIcon, BuildingIcon, CalendarIcon } from './icons';

interface AnalyticsViewProps {
  reports: Report[];
}

const ChartCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-full">
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-100 text-slate-600 rounded-lg p-2">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ reports }) => {
    const [filterPeriod, setFilterPeriod] = React.useState('all');
    const [filterGovernorate, setFilterGovernorate] = React.useState('all');

    const filteredReports = React.useMemo(() => {
        const now = new Date();
        return reports.filter(report => {
            if (filterGovernorate !== 'all' && report.governorate !== filterGovernorate) {
                return false;
            }
            if (filterPeriod !== 'all') {
                const reportDate = new Date(report.maintenance_date);
                const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24);
                if (filterPeriod === '30d' && daysDiff > 30) return false;
                if (filterPeriod === '90d' && daysDiff > 90) return false;
            }
            return true;
        });
    }, [reports, filterPeriod, filterGovernorate]);

    // FIX: Explicitly provided a generic type to React.useMemo to ensure correct type inference for `statsByCategory`.
    const statsByCategory = React.useMemo<Record<ReportCategory, number>>(() => {
        const counts: Record<ReportCategory, number> = {
            [ReportCategory.CORRECTIVE]: 0,
            [ReportCategory.MODERN]: 0,
        };
        filteredReports.forEach(report => {
            report.category.forEach(cat => {
                if (cat in counts) {
                    counts[cat]++;
                }
            });
        });
        return counts;
    }, [filteredReports]);

    // FIX: Explicitly provided a generic type to React.useMemo and types for map parameters to ensure correct type inference for `statsByGovernorate`.
    const statsByGovernorate = React.useMemo<{ name: string; count: number }[]>(() => {
        const counts = new Map<string, number>();
        filteredReports.forEach(report => {
            counts.set(report.governorate, (counts.get(report.governorate) || 0) + 1);
        });
        return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [filteredReports]);

    const governorateOptions = React.useMemo(() => {
        // FIX: Provided a locale-aware comparison function to sort() to ensure correct sorting for Arabic names.
        return [...new Set(reports.map(r => r.governorate))].sort((a: string, b: string) => a.localeCompare(b, 'ar'));
    }, [reports]);
    
    // FIX: Added a type assertion to `Object.values` to prevent type errors in the reduce function.
    const totalCategoryInstances = (Object.values(statsByCategory) as number[]).reduce((sum, count) => sum + count, 0);
    const maxGovCount = Math.max(1, ...statsByGovernorate.map(g => g.count));

    return (
        <div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto flex-grow flex items-center gap-4">
                    <div>
                        <label htmlFor="period-filter" className="text-sm font-medium text-slate-700 mb-1 block">الفترة</label>
                        <select
                            id="period-filter"
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                            className="w-full sm:w-48 rounded-md border-slate-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)] py-2 pl-3 pr-8 bg-white"
                        >
                            <option value="all">كل الأوقات</option>
                            <option value="30d">آخر 30 يوم</option>
                            <option value="90d">آخر 90 يوم</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="gov-filter" className="text-sm font-medium text-slate-700 mb-1 block">المحافظة</label>
                        <select
                            id="gov-filter"
                            value={filterGovernorate}
                            onChange={(e) => setFilterGovernorate(e.target.value)}
                            className="w-full sm:w-48 rounded-md border-slate-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)] py-2 pl-3 pr-8 bg-white"
                        >
                            <option value="all">كل المحافظات</option>
                            {governorateOptions.map(gov => (
                                <option key={gov} value={gov}>{gov}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="pt-2 sm:pt-6">
                    <button onClick={() => { setFilterPeriod('all'); setFilterGovernorate('all'); }} className="py-2 px-3 text-sm font-medium text-slate-600 hover:text-[var(--primary-600)] hover:bg-[var(--primary-50)] rounded-md transition-colors">مسح الفلاتر</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="التقارير حسب التصنيف" icon={<TagIcon className="w-5 h-5"/>}>
                     <div className="space-y-4">
                        {[
                            {label: ReportCategory.CORRECTIVE, value: statsByCategory[ReportCategory.CORRECTIVE], color: 'bg-[var(--primary-500)]'},
                            {label: ReportCategory.MODERN, value: statsByCategory[ReportCategory.MODERN], color: 'bg-emerald-500'}
                        ].map(cat => (
                            <div key={cat.label}>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-medium text-slate-700">{cat.label}</span>
                                    {/* FIX: Cast value to Number to prevent type errors. */}
                                    <span className="font-semibold text-slate-500">{Number(cat.value)}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    {/* FIX: Cast value to Number to fix arithmetic operation error. */}
                                    <div className={`${cat.color} h-2.5 rounded-full`} style={{ width: totalCategoryInstances > 0 ? `${(Number(cat.value) / totalCategoryInstances) * 100}%` : '0%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>

                <ChartCard title="التقارير حسب المحافظة" icon={<BuildingIcon className="w-5 h-5"/>}>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                         {statsByGovernorate.length > 0 ? statsByGovernorate.slice(0, 10).map(gov => (
                            <div key={gov.name}>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-medium text-slate-700">{gov.name}</span>
                                    <span className="font-semibold text-slate-500">{gov.count}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${(gov.count / maxGovCount) * 100}%`}}></div>
                                </div>
                            </div>
                        )) : <p className="text-slate-500 text-sm text-center py-4">لا توجد بيانات لعرضها.</p>}
                    </div>
                </ChartCard>
            </div>
        </div>
    );
};

export default AnalyticsView;