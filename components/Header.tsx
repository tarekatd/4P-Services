

import React from 'react';
import { User } from '../types';
import { LogoutIcon, ReportIcon, ChartBarIcon, PaintBrushIcon, CheckIcon } from './icons';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  route: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, route }) => {
    const NavLink: React.FC<{ href: string; currentRoute: string; children: React.ReactNode; icon: React.ReactNode }> = ({ href, currentRoute, children, icon }) => {
        const normalizedCurrent = currentRoute === '' || currentRoute === '#' ? '#/' : currentRoute;
        const normalizedHref = href === '' || href === '#' ? '#/' : href;
        const isActive = normalizedCurrent === normalizedHref;
        
        return (
          <a
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--primary-100)] text-[var(--primary-700)]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {icon}
            {children}
          </a>
        );
    };

    const THEMES = [
        { id: 'indigo', name: 'بنفسجي', color: '#6366f1' },
        { id: 'emerald', name: 'زمردي', color: '#10b981' },
        { id: 'sky', name: 'سماوي', color: '#0ea5e9' },
        { id: 'rose', name: 'وردي', color: '#f43f5e' },
    ];
    
    const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false);
    const [activeTheme, setActiveTheme] = React.useState(() => localStorage.getItem('app-theme') || 'indigo');
    const themeMenuRef = React.useRef<HTMLDivElement>(null);

    const applyTheme = (themeId: string) => {
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('app-theme', themeId);
        setActiveTheme(themeId);
        setIsThemeMenuOpen(false);
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
                setIsThemeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.1s ease-out;
                }
            `}</style>
            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-bold text-[var(--primary-700)]">4P</span>
                        <span className="text-xl sm:text-2xl font-light text-slate-300">|</span>
                        <span className="text-xl sm:text-2xl font-semibold text-emerald-600">NBE</span>
                    </div>
                     <nav className="hidden md:flex items-center gap-2">
                        <NavLink href="#/" currentRoute={route} icon={<ReportIcon className="w-5 h-5" />}>
                            لوحة التحكم
                        </NavLink>
                        <NavLink href="#/analytics" currentRoute={route} icon={<ChartBarIcon className="w-5 h-5" />}>
                            التحليلات
                        </NavLink>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                     <div className="relative" ref={themeMenuRef}>
                        <button
                            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-[var(--primary-600)] transition-colors duration-200 bg-slate-100 hover:bg-[var(--primary-50)] rounded-full p-2.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)]"
                            aria-label="تغيير المظهر"
                        >
                            <PaintBrushIcon className="w-5 h-5" />
                        </button>
                        {isThemeMenuOpen && (
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 origin-top-left animate-fade-in-up z-50">
                                {THEMES.map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => applyTheme(theme.id)}
                                        className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.color }}></div>
                                            <span>{theme.name}</span>
                                        </div>
                                        {activeTheme === theme.id && <CheckIcon className="w-5 h-5 text-[var(--primary-600)]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <span className="text-sm sm:text-base text-slate-600 hidden md:block">مرحباً، <span className="font-medium text-slate-800">{user.name}</span></span>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition-colors duration-200 bg-slate-100 hover:bg-red-50 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)]"
                        aria-label="تسجيل الخروج"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">تسجيل الخروج</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;